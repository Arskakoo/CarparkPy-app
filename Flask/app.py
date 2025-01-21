from flask import Flask, jsonify, send_file, request, render_template_string
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

USERNAME = "admin"
PASSWORD = "admin"

# Kirjautumis sivu
logged_in = False
@app.route('/login', methods=['GET'])
def login():
    return render_template_string("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login</title>
        <script>
            function submitLogin() {
                var username = document.getElementById('username').value;
                var password = document.getElementById('password').value;
                
                fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({username: username, password: password}),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = '/api/stats';  // Redirect to the stats page if login is successful
                    } else {
                        alert('Invalid username or password');
                    }
                });
            }
        </script>
    </head>
    <body>
        <h2>Login</h2>
        <label for="username">Username:</label>
        <input type="text" id="username" required>
        <br><br>
        <label for="password">Password:</label>
        <input type="password" id="password" required>
        <br><br>
        <button onclick="submitLogin()">Login</button>
    </body>
    </html>
    """)
    
# Kirjautuminen
@app.route('/api/login', methods=['POST'])
def api_login():
    global logged_in
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    
    if username == USERNAME and password == PASSWORD:
        logged_in = True
        return jsonify({"success": True})
    else:
        logged_in = False
        return jsonify({"success": False})
    
# uloskirjautuminen 
@app.route('/logout', methods=['GET'])
def logout():
    global logged_in
    logged_in = False  # Aseta kirjautumistila epäkohdaksi
    return jsonify({"success": True, "message": "You have logged out successfully."})

@app.route('/api/data')
def get_data():
    if not logged_in:
        return jsonify({"error": "Unauthorized access. Please login first."}), 401
    
    json_file = os.path.join(os.path.dirname(__file__), "./../parking_log.json")
    if os.path.exists(json_file):
        with open(json_file, "r") as file:
            data = json.load(file)
        return jsonify(data)
    else:
        print("[ERROR] Data file 'parking_log.json' not found")
        return jsonify({"error": "Data file not found"}), 404
    
@app.route('/api/stats')
def get_stats():
    if not logged_in:
        return jsonify({"error": "Unauthorized access. Please login first."}), 401
    
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
    if not logged_in:
        return jsonify({"error": "Unauthorized access. Please login first."}), 401
    
    notifications_file = os.path.join(os.path.dirname(__file__), "./../Notification.json")
    if os.path.exists(notifications_file):
        with open(notifications_file, "r") as file:
            notifications = json.load(file)
        return jsonify(notifications)
    else:
        print("[ERROR] Notifications file 'Notification.json' not found")
        return jsonify({"error": "Notifications file not found"}), 404

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

@app.route('/api/photo')
def get_output_photo():
    if not logged_in:
        return jsonify({"error": "Unauthorized access. Please login first."}), 401
    
    photo_path = os.path.join(os.path.dirname(__file__), "./../photo.jpg")
    if os.path.exists(photo_path):
        return send_file(photo_path, mimetype='image/jpeg')
    else:
        print("[ERROR] Output photo 'output.jpg' not found") 
        return jsonify({"error": "Output photo not found"}), 404

if __name__ == '__main__':
    print("[INFO] Starting Flask app")  
    app.run(debug=True)
