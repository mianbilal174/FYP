"""
Test script to simulate ESP32 sending sensor data via MQTT
"""
import paho.mqtt.client as mqtt
import json
import time
import random
from datetime import datetime

# MQTT Configuration
MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_TOPIC = "smart_irrigation/data"
MQTT_ALERT_TOPIC = "smart_irrigation/alerts"
CLIENT_ID = "esp32_simulator"


def generate_sensor_data():
    """Generate random sensor data"""
    return {
        "soil": round(random.uniform(20, 80), 2),
        "temperature": round(random.uniform(15, 40), 2),
        "humidity": round(random.uniform(30, 90), 2),
        "lux": round(random.uniform(1000, 60000), 2),
        "ip": "127.0.0.1",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


def on_connect(client, userdata, flags, rc):
    """Callback when connected to MQTT broker"""
    if rc == 0:
        print("✅ Connected to MQTT broker")
    else:
        print(f"❌ Connection failed with code {rc}")


def on_publish(client, userdata, mid):
    """Callback when message is published"""
    print(f"📤 Message published (ID: {mid})")


def main():
    """Main function to simulate ESP32"""
    print("🌱 ESP32 Sensor Simulator")
    print("=" * 50)
    print(f"Broker: {MQTT_BROKER}")
    print(f"Topic: {MQTT_TOPIC}")
    print("=" * 50)
    print()
    
    # Create MQTT client
    client = mqtt.Client(client_id=CLIENT_ID)
    client.on_connect = on_connect
    client.on_publish = on_publish
    
    try:
        # Connect to broker
        print("🔌 Connecting to MQTT broker...")
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start()
        
        # Wait for connection
        time.sleep(2)
        
        # Send sensor data every 5 seconds
        print("\n📡 Starting to send sensor data (Ctrl+C to stop)...\n")
        
        while True:
            # Generate sensor data
            sensor_data = generate_sensor_data()
            
            # Convert to JSON
            payload = json.dumps(sensor_data)
            
            # Publish to MQTT
            result = client.publish(MQTT_TOPIC, payload)
            
            # Display data
            print(f"🌡️  Temperature: {sensor_data['temperature']}°C")
            print(f"💧 Soil Moisture: {sensor_data['soil']}%")
            print(f"💨 Humidity: {sensor_data['humidity']}%")
            print(f"☀️  Light: {sensor_data['lux']} Lux")
            print(f"⏰ Time: {sensor_data['timestamp']}")
            print("-" * 50)
            
            # Wait 5 seconds
            time.sleep(5)
    
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping simulator...")
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
    
    finally:
        client.loop_stop()
        client.disconnect()
        print("✅ Disconnected from MQTT broker")


if __name__ == "__main__":
    main()
