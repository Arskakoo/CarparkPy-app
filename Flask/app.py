from flask import Flask, jsonify, send_file, request, session, redirect, url_for, render_template_string
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# Määritä salainen avain istuntojen hallintaan
app.secret_key = os.urandom(24)

# Simuloitu käyttäjälista (tuotannossa käyttäjätietojen pitäisi tulla tietokannasta)
users = {"admin": "admin"}

# Kirjautumisreitti
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if username in users and users[username] == password:
            session['user'] = username  # Tallenna käyttäjä istuntoon
            return redirect(url_for('dashboard'))
        else:
            return "Virheelliset kirjautumistiedot, yritä uudelleen", 401
    
    return '''
        <form method="POST">
            Käyttäjätunnus: <input type="text" name="username">
            Salasana: <input type="password" name="password">
            <input type="submit" value="Kirjaudu">
        </form>
    '''

# Reitti suojattuun alueeseen
@app.route('/dashboard')
def dashboard():
    if 'user' in session:
        return jsonify({"message": f"Tervetuloa {session['user']}!"})
    else:
        return redirect(url_for('login'))

# Kirjautumisesta ulos
@app.route('/logout')
def logout():
    session.pop('user', None)  # Poistaa käyttäjän istunnosta
    return redirect(url_for('login'))

# API-reitit, jotka vaativat kirjautumisen
@app.route('/api/stats')
def get_stats():
    if 'user' not in session:
        return redirect(url_for('login'))

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
    if 'user' not in session:
        return redirect(url_for('login'))

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
    if 'user' not in session:
        return redirect(url_for('login'))

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

@app.route('/api/data')
def get_data():
    if 'user' not in session:
        return redirect(url_for('login'))

    json_file = os.path.join(os.path.dirname(__file__), "./../parking_log.json")
    if os.path.exists(json_file):
        with open(json_file, "r") as file:
            data = json.load(file)
        return jsonify(data)
    else:
        print("[ERROR] Data file 'parking_log.json' not found")
        return jsonify({"error": "Data file not found"}), 404

@app.route('/api/photo')
def get_output_photo():
    if 'user' not in session:
        return redirect(url_for('login'))

    photo_path = os.path.join(os.path.dirname(__file__), "./../photo.jpg")
    if os.path.exists(photo_path):
        return send_file(photo_path, mimetype='image/jpeg')
    else:
        print("[ERROR] Output photo 'output.jpg' not found") 
        return jsonify({"error": "Output photo not found"}), 404

if __name__ == '__main__':
    print("[INFO] Starting Flask app")  
    app.run(debug=True)
