# Smart Crop Irrigation System - Backend

A comprehensive FastAPI backend for IoT-based crop monitoring with real-time sensor data, MQTT integration, email alerts, and MongoDB storage.

## 🌟 Features

- **Real-time Sensor Monitoring**: Continuous monitoring of soil moisture, temperature, humidity, and light intensity
- **MQTT Integration**: Receives sensor data from ESP32 via MQTT protocol
- **MongoDB Storage**: Efficient storage and retrieval of sensor data and alerts
- **Email Notifications**: Automated Gmail alerts when thresholds are exceeded
- **RESTful API**: Comprehensive API for dashboard and settings management
- **Threshold Management**: Customizable thresholds for all sensor parameters
- **Alert System**: Intelligent alert generation and tracking
- **Statistics & Analytics**: Real-time statistics and historical data analysis

## 📋 Prerequisites

- Python 3.9 or higher
- MongoDB (local or cloud instance)
- Gmail account with App Password (for email notifications)
- MQTT Broker (default: HiveMQ public broker)

## 🚀 Installation

### 1. Clone the repository

```bash
cd "d:\Plant monitoring system project\backend"
```

### 2. Create virtual environment

```bash
python -m venv venv
```

### 3. Activate virtual environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure environment variables

Copy `.env.example` to `.env` and update the values:

```bash
copy .env.example .env
```

Edit `.env` file:

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=smart_crop_irrigation

# MQTT Configuration
MQTT_BROKER=broker.hivemq.com
MQTT_PORT=1883
MQTT_TOPIC=smart_crop/sensors
MQTT_CLIENT_ID=smart_crop_backend

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Smart Crop Irrigation System

# Application Settings
APP_HOST=0.0.0.0
APP_PORT=8000
DEBUG=True

# CORS Settings
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 6. Setup Gmail App Password

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password to `SMTP_PASSWORD` in `.env`

## 🏃 Running the Application

### Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if installed as service)
net start MongoDB

# Or run manually
mongod
```

### Run the FastAPI server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python -m app.main
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📡 API Endpoints

### Dashboard Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/sensor-data/latest` | Get latest sensor reading |
| GET | `/api/dashboard/sensor-data/history` | Get historical sensor data |
| GET | `/api/dashboard/stats` | Get sensor statistics |
| GET | `/api/dashboard/health` | Health check |

### Settings Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings/` | Get current settings |
| PUT | `/api/settings/email` | Update email settings |
| PUT | `/api/settings/thresholds` | Update sensor thresholds |

### Alerts Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts/` | Get all alerts |
| GET | `/api/alerts/stats` | Get alert statistics |
| PUT | `/api/alerts/{alert_id}/resolve` | Resolve an alert |
| DELETE | `/api/alerts/{alert_id}` | Delete an alert |

## 🔧 ESP32 MQTT Integration

### MQTT Topic Structure

The ESP32 should publish sensor data to the topic: `smart_crop/sensors`

### JSON Payload Format

```json
{
  "soil_moisture": 45.5,
  "temperature": 28.3,
  "humidity": 65.2,
  "light_intensity": 15000.0,
  "timestamp": "2026-01-20T14:30:00Z"
}
```

### Example ESP32 Code (Arduino)

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "broker.hivemq.com";
const char* mqtt_topic = "smart_crop/sensors";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  // Connect to MQTT
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Read sensors
  float soilMoisture = readSoilMoisture();
  float temperature = readTemperature();
  float humidity = readHumidity();
  float lightIntensity = readLightIntensity();
  
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["soil_moisture"] = soilMoisture;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["light_intensity"] = lightIntensity;
  
  char buffer[200];
  serializeJson(doc, buffer);
  
  // Publish to MQTT
  client.publish(mqtt_topic, buffer);
  
  delay(10000); // Send every 10 seconds
}
```

## 📊 Database Schema

### Collections

#### sensor_data
```json
{
  "_id": "ObjectId",
  "soil_moisture": 45.5,
  "temperature": 28.3,
  "humidity": 65.2,
  "light_intensity": 15000.0,
  "timestamp": "2026-01-20T14:30:00Z",
  "device_id": "ESP32_001"
}
```

#### alerts
```json
{
  "_id": "ObjectId",
  "alert_type": "temperature_high",
  "severity": "warning",
  "message": "Temperature is above threshold",
  "sensor_value": 38.5,
  "threshold_value": 35.0,
  "timestamp": "2026-01-20T14:30:00Z",
  "is_resolved": false,
  "email_sent": true,
  "resolved_at": null
}
```

#### settings
```json
{
  "_id": "ObjectId",
  "setting_type": "system",
  "thresholds": {
    "soil_moisture_min": 30.0,
    "soil_moisture_max": 70.0,
    "temperature_min": 15.0,
    "temperature_max": 35.0,
    "humidity_min": 40.0,
    "humidity_max": 80.0,
    "light_intensity_min": 5000.0,
    "light_intensity_max": 50000.0
  },
  "email_settings": {
    "email": "farmer@example.com",
    "enabled": true
  },
  "updated_at": "2026-01-20T14:30:00Z"
}
```

## 🎯 Usage Examples

### Configure Email Settings

```bash
curl -X PUT "http://localhost:8000/api/settings/email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@gmail.com",
    "enabled": true
  }'
```

### Update Thresholds

```bash
curl -X PUT "http://localhost:8000/api/settings/thresholds" \
  -H "Content-Type: application/json" \
  -d '{
    "soil_moisture_min": 25.0,
    "soil_moisture_max": 75.0,
    "temperature_max": 40.0
  }'
```

### Get Latest Sensor Data

```bash
curl "http://localhost:8000/api/dashboard/sensor-data/latest"
```

## 🛠️ Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── database.py          # MongoDB connection
│   ├── models/              # Pydantic models
│   │   ├── sensor_data.py
│   │   ├── settings.py
│   │   └── alert.py
│   ├── routes/              # API routes
│   │   ├── dashboard.py
│   │   ├── settings.py
│   │   └── alerts.py
│   ├── services/            # Business logic
│   │   ├── mqtt_service.py
│   │   ├── email_service.py
│   │   └── alert_service.py
│   └── utils/               # Utilities
├── requirements.txt
├── .env.example
└── README.md
```

## 🔐 Security Notes

- Never commit `.env` file to version control
- Use strong passwords for MongoDB
- Use Gmail App Passwords, not your actual password
- Configure CORS origins appropriately for production
- Consider using HTTPS in production

## 🐛 Troubleshooting

### MQTT Connection Issues
- Verify MQTT broker is accessible
- Check firewall settings
- Try using a different public broker

### Email Not Sending
- Verify Gmail App Password is correct
- Enable "Less secure app access" if needed
- Check SMTP settings

### MongoDB Connection Failed
- Ensure MongoDB is running
- Verify connection string in `.env`
- Check MongoDB logs

## 📝 License

This project is part of the Smart Crop Irrigation System academic project.

## 👥 Support

For issues and questions, please refer to the project documentation or contact the development team.

---

**Built with ❤️ for sustainable agriculture**
