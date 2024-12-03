import json
import os
import time
import threading
import cv2
from ultralytics import YOLO
from dotenv import load_dotenv

# YOLOv8x tunnistaa ajoneuvot parhaiten
model = YOLO('yolov8x.pt')

# Ajoneuvo luokat YOLO
vehicle_classes = [2, 3, 5, 7, 10]
log_filename = "parking_log.json"
last_cleanup_time = time.time()
stats_data = []

# Stats.json
def write_stats():
    global stats_data
    while True:
        if os.path.exists(log_filename):
            with open(log_filename, "r") as file:
                logs = json.load(file)
                parking_lot = logs["ParkingLot"][0]
                stats_data.append({
                    "timestamp": parking_lot["timestamp"],
                    "name": parking_lot["name"],        
                    "location": parking_lot["location"], 
                    "id": parking_lot["id"],             
                    "occupied_spots": parking_lot["occupied_spots"],
                    "unoccupied_spots": parking_lot["unoccupied_spots"]
                })
                
        # Poistaa yli 24h tunnin datan
        current_time = time.time()
        stats_data = [entry for entry in stats_data if current_time - time.mktime(time.strptime(entry["timestamp"], "%Y-%m-%d %H:%M:%S")) <= 86400]
        stats_filename = "stats.json"
        with open(stats_filename, "w") as stats_file:
            json.dump(stats_data, stats_file, indent=4)

        print("Updated stats.json")
        time.sleep(600)  # Odottaa 10min ennenkuin tallentaa seuraavan tiedon ja ensimmäisen

stats_thread = threading.Thread(target=write_stats, daemon=True)
stats_thread.start()

# Parkkiruudut 
def load_detection_coords():
    parking_lot_file = "ParksConf.json"
    if not os.path.exists(parking_lot_file):
        print("Error: ParksConf.json not found.")
        return []

    with open(parking_lot_file, "r") as file:
        parking_lot_data = json.load(file)
        detection_coords = [
            (spot['x'], spot['y'], spot['occupied'], spot['spot_id'])
            for spot in parking_lot_data["ParkingLot"][0]["detection_coords"]
        ]
        return detection_coords

# Tallentaa nykyhetken tiedot parking_log.json ja luosen
def log_to_json(timestamp, occupied_count, unoccupied_count):
    detection_coords = load_detection_coords() 

    if not detection_coords:
        print("Error: No parking spots available.")
        return
    parking_lot_file = "ParksConf.json"
    with open(parking_lot_file, "r") as file:
        parking_lot_data = json.load(file)

    parking_lot = parking_lot_data["ParkingLot"][0]
    data = {
        "ParkingLot": [
            {
                "id": parking_lot["id"],
                "name": parking_lot["name"],
                "location": parking_lot["location"],
                "timestamp": timestamp,
                "occupied_spots": occupied_count,
                "unoccupied_spots": unoccupied_count,
            }
        ]
    }

    with open(log_filename, "w") as file:
        json.dump(data, file, indent=4)

# Tarkistaa onko ajoneuvoja ruuduissa
def is_overlap(detected_box, coord):
    xmin_detected, ymin_detected, xmax_detected, ymax_detected = detected_box
    xmin_coord, ymin_coord = coord
    size = 20
    xmax_coord_box = xmin_coord + size
    ymax_coord_box = ymin_coord + size

    return (xmin_detected < xmax_coord_box and xmax_detected > xmin_coord and
            ymin_detected < ymax_coord_box and ymax_detected > ymin_coord)

# Piirtää kuvan missä oletus ruudut näkyuy vihreällä tai punaisella
def detect_and_draw_vehicles(image_path, output_path='output.jpg', confidence_threshold=0.1):
    img = cv2.imread(image_path)
    resized_img = cv2.resize(img, (1600, 900))
    scales = [640, 800, 1024]
    detections = []

    for scale in scales:
        img_resized = cv2.resize(resized_img, (scale, scale))
        results = model(img_resized, conf=confidence_threshold)

        for result in results[0].boxes.data.tolist():
            xmin, ymin, xmax, ymax, confidence, class_id = result
            if confidence > confidence_threshold and int(class_id) in vehicle_classes:
                detections.append((
                    int(xmin * resized_img.shape[1] / scale),
                    int(ymin * resized_img.shape[0] / scale),
                    int(xmax * resized_img.shape[1] / scale),
                    int(ymax * resized_img.shape[0] / scale),
                    confidence, class_id
                ))

    occupied_count = 0
    detection_coords = load_detection_coords()  # Load parking spots from JSON

    for (xmin, ymin, _, _) in detection_coords:  # Draw boxes on the image
        box_color = (0, 255, 0)  # Green if spot is free
        occupied = any(is_overlap((xmin_det, ymin_det, xmax_det, ymax_det), (xmin, ymin))
                       for xmin_det, ymin_det, xmax_det, ymax_det, _, _ in detections)

        if occupied:
            box_color = (0, 0, 255)  # Red if spot is occupied
            occupied_count += 1

        cv2.rectangle(resized_img, (xmin, ymin), (xmin + 50, ymin + 50), box_color, 2)

    unoccupied_count = len(detection_coords) - occupied_count
    print(f"Occupied spots: {occupied_count}")
    print(f"Unoccupied spots: {unoccupied_count}")
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    log_to_json(timestamp, occupied_count, unoccupied_count)

    # Lisää timestampin kuvaan
    cv2.putText(resized_img, timestamp, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2, cv2.LINE_AA)
    for (xmin, ymin, xmax, ymax, confidence, class_id) in detections:
        cv2.rectangle(resized_img, (xmin, ymin), (xmax, ymax), (0, 255, 0), 2)
        class_name = model.names[int(class_id)]
        cv2.putText(resized_img, f"{class_name} {confidence:.2f}", (xmin, ymin - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    cv2.imwrite(output_path, resized_img)

# Kameran hallinta
def capture_and_detect():

    try:
        while True:
            load_dotenv()
            ip_camera_url = os.getenv("IP_CAMERA_URL") 
            cap = cv2.VideoCapture(ip_camera_url)

            if not cap.isOpened():
                print("Error: Could not open camera.")
                return

            ret, frame = cap.read()
            if not ret:
                print("Error: Could not read frame. Retrying...")
                time.sleep(2)  # Try again after a short delay
                continue

            filename = "photo.jpg"
            cv2.imwrite(filename, frame)
            print("Captured image.")

            detect_and_draw_vehicles(filename, 'output.jpg', confidence_threshold=0.1)

            for remaining in range(5, 0, -1):
                print(f"Next photo in {remaining} seconds...", end='\r')
                time.sleep(1)

    except KeyboardInterrupt:
        print("Stopped by user.")
    finally:
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    capture_and_detect()