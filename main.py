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

# Parking spots selection
def select_parking_spots(image_path):
    selected_coords = []
    display_size = (800, 450)
    original_size = (1600, 900)

    # Calculate scaling factors
    scale_x = original_size[0] / display_size[0]
    scale_y = original_size[1] / display_size[1]

    def mouse_callback(event, x, y, flags, param):
        nonlocal resized_img
        if event == cv2.EVENT_LBUTTONDOWN:
            original_x = int(x * scale_x)
            original_y = int(y * scale_y)
            selected_coords.append((original_x, original_y))
            print(f"Selected spot (original resolution): ({original_x}, {original_y})")

            cv2.rectangle(
                resized_img,
                (x - 10, y - 10),
                (x + 10, y + 10),
                (0, 255, 255),
                2
            )
            cv2.imshow("Select Parking Spots", resized_img)

    img = cv2.imread(image_path)
    resized_img = cv2.resize(img, display_size)
    cv2.imshow("Select Parking Spots", resized_img)
    cv2.setMouseCallback("Select Parking Spots", mouse_callback)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    return selected_coords



def save_parking_spots_to_json(coords):
    parking_lot_data = {
        "ParkingLot": [
            {
                "id": 1,
                "name": "Example Park",
                "location": "Example Address, 12",
                "detection_coords": []
            }
        ]
    }
    for x, y in coords:
        parking_lot_data["ParkingLot"][0]["detection_coords"].append({
            "x": x,
            "y": y,
            "occupied": False,
            "spot_id": f"spot_{len(parking_lot_data['ParkingLot'][0]['detection_coords']) + 1}"
        })

    with open("ParksConf.json", "w") as file:
        json.dump(parking_lot_data, file, indent=4)
    print("Saved parking spots to ParksConf.json.")


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

# Tallentaa nykyhetken tiedot parking_log.json ja luo sen
def log_to_json(timestamp, occupied_count, unoccupied_count):
    detection_coords = load_detection_coords()

    if not detection_coords:
        print("Error: No parking spots available.")
        return
    parking_lot_file = "ParksConf.json"
    with open(parking_lot_file, "r") as file:
        parking_lot_data = json.load(file)

    parking_lot = parking_lot_data["ParkingLot"][0]
    parking_lot_id = parking_lot.get("id", "unknown_id") 
    data = {
        "ParkingLot": [
            {
                "id": parking_lot_id,
                "name": parking_lot.get("name", "Unnamed Lot"),  
                "location": parking_lot.get("location", "Unknown Location"),
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

# Piirtää kuvan missä oletus ruudut näkyyy vihreällä tai punaisella
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
    detection_coords = load_detection_coords()  # Lataa ruudut jsonista

    for (xmin, ymin, _, _) in detection_coords:
        box_color = (0, 255, 0)
        occupied = any(is_overlap((xmin_det, ymin_det, xmax_det, ymax_det), (xmin, ymin))
                       for xmin_det, ymin_det, xmax_det, ymax_det, _, _ in detections)

        if occupied:
            box_color = (0, 0, 255)
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


def take_photo():
    # kuvan ottamminen ja tallentaminen conffausta varten
    load_dotenv()
    ip_camera_url = os.getenv("IP_CAMERA_URL")
    cap = cv2.VideoCapture(ip_camera_url)

    if not cap.isOpened():
        print("Error: Could not open camera.")
        return

    ret, frame = cap.read()
    if not ret:
        print("Error: Could not read frame.")
        return

    resized_frame = cv2.resize(frame, (1600, 900)) 
    filename = "photo.jpg"
    cv2.imwrite(filename, resized_frame)
    print("Photo saved as 1600x900.")


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

def menu():
    print("Welcome to Parking Spot Detection")
    print("1. Select Parking Spots Manually")
    print("2. Use Existing Parking Spots")
    choice = input("Choose an option (1 or 2): ")

    if choice == '1':
        coords = select_parking_spots("photo.jpg")
        if coords:
            save_parking_spots_to_json(coords)
    elif choice == '2':
        print("Using existing parking spots from ParksConf.json")
    else:
        print("Invalid choice, exiting.")
        return

    capture_and_detect()

if __name__ == "__main__":
    menu()
