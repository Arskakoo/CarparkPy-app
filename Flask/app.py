from flask import Flask, jsonify, send_file
from flask_cors import CORS
import json
import os
import time

app = Flask(__name__)
CORS(app)

@app.route('/api/stats')
def get_stats():
    stats_filename = os.path.join(os.path.dirname(__file__), "./../stats.json")
    if os.path.exists(stats_filename):
        with open(stats_filename, "r") as file:
            stats = json.load(file)
        return jsonify(stats)
    else:
        print("[ERROR] Stats file 'stats.json' not found")  
        return jsonify({"error": "Stats file not found"}), 404

@app.route('/api/notifications')
def get_notifications():
    notifications_file = os.path.join(os.path.dirname(__file__), "./../Notification.json")
    if os.path.exists(notifications_file):
        with open(notifications_file, "r") as file:
            notifications = json.load(file)
        return jsonify(notifications)
    else:
        print("[ERROR] Notifications file 'Notification.json' not found")
        return jsonify({"error": "Notifications file not found"}), 404


# Hakee datan logista josta muokkaa uuden urlin jossa tarvittava data
@app.route('/api/lastupdate')
def get_last_update():
    json_file = os.path.join(os.path.dirname(__file__), "../parking_log.json")
    
    if not os.path.exists(json_file):
        return jsonify({"error": "Data file not found"}), 404
    
    try:
        with open(json_file, "r") as file:
            data = json.load(file)
    except json.JSONDecodeError as e:
        return jsonify({"error": f"JSON decode error: {e}"}), 400
    
    status_data = [
        {
            "name": lot["name"],
            "last_update": lot.get("timestamp")
        }
        for lot in data.get("ParkingLot", [])
        if "timestamp" in lot
    ]
    
    return jsonify(status_data)

# Näyttää koko Login
@app.route('/api/data')
def get_data():
    json_file = os.path.join(os.path.dirname(__file__), "./../parking_log.json")
    if os.path.exists(json_file):
        with open(json_file, "r") as file:
            data = json.load(file)
        return jsonify(data)
    else:
        print("[ERROR] Data file 'parking_log.json' not found")
        return jsonify({"error": "Data file not found"}), 404

# Näyttää kuvan
@app.route('/api/photo')
def get_output_photo():
    photo_path = os.path.join(os.path.dirname(__file__), "./../photo.jpg")
    if os.path.exists(photo_path):
        return send_file(photo_path, mimetype='image/jpeg')
    else:
        print("[ERROR] Output photo 'output.jpg' not found") 
        return jsonify({"error": "Output photo not found"}), 404

if __name__ == '__main__':
    print("[INFO] Starting Flask app")  
    app.run(debug=True)