import paho.mqtt.client as mqtt
import json
import logging
from datetime import datetime
from app.config import settings
from app.database import Database
from app.models import SensorReading
from app.services.alert_service import AlertService

logger = logging.getLogger(__name__)


class MQTTService:
    """MQTT service for receiving sensor data from ESP32"""
    
    def __init__(self):
        self.client = None
        self.alert_service = AlertService()
        self.is_connected = False
    
    def on_connect(self, client, userdata, flags, rc):
        """Callback when connected to MQTT broker"""
        if rc == 0:
            self.is_connected = True
            logger.info(f"✅ Connected to MQTT broker: {settings.MQTT_BROKER}")
            # Subscribe to sensor topics
            client.subscribe(settings.MQTT_TOPIC)
            if hasattr(settings, 'MQTT_ALERT_TOPIC'):
                client.subscribe(settings.MQTT_ALERT_TOPIC)
            logger.info(f"📡 Subscribed to topic: {settings.MQTT_TOPIC}")
        else:
            self.is_connected = False
            logger.error(f"❌ Failed to connect to MQTT broker. Return code: {rc}")
    
    def on_disconnect(self, client, userdata, rc):
        """Callback when disconnected from MQTT broker"""
        self.is_connected = False
        logger.warning(f"⚠️ Disconnected from MQTT broker. Return code: {rc}")
    
    def on_message(self, client, userdata, msg):
        """Callback when message received from MQTT"""
        try:
            # Parse JSON payload
            payload = json.loads(msg.payload.decode())
            logger.info(f"📨 Received message on {msg.topic}: {payload}")
            
            # Hardware alert logging
            if hasattr(settings, 'MQTT_ALERT_TOPIC') and msg.topic == settings.MQTT_ALERT_TOPIC:
                logger.warning(f"🚨 Hardware Alert from ESP32: {payload.get('alert', 'Unknown')}")
                return
            
            # Map ESP32 keys to backend models if necessary
            if "soil" in payload:
                payload["soil_moisture"] = payload.pop("soil")
            if "lux" in payload:
                payload["light_intensity"] = payload.pop("lux")
                
            # Remove extra keys that might come from ESP32
            payload.pop("alert", None)
            payload.pop("ip", None)

            # Validate and create sensor reading
            sensor_reading = SensorReading(**payload)
            
            # Store in database (async operation handled separately)
            self._store_sensor_data(sensor_reading)
            
            # Check thresholds and generate alerts natively
            self._check_thresholds(sensor_reading)
            
        except json.JSONDecodeError as e:
            logger.error(f"❌ Invalid JSON payload: {e}")
        except Exception as e:
            logger.error(f"❌ Error processing MQTT message: {e}")
    
    def _store_sensor_data(self, sensor_reading: SensorReading):
        """Store sensor data in MongoDB"""
        try:
            import asyncio
            
            async def save_data():
                db = Database.get_db()
                sensor_dict = sensor_reading.model_dump()
                sensor_dict['timestamp'] = datetime.utcnow()
                await db.sensor_data.insert_one(sensor_dict)
                logger.info("💾 Sensor data saved to database")
            
            # Run async operation in the main loop thread-safely
            if hasattr(self, 'main_loop') and self.main_loop:
                asyncio.run_coroutine_threadsafe(save_data(), self.main_loop)
            else:
                logger.error("❌ No main event loop found to run save_data")
            
        except Exception as e:
            logger.error(f"❌ Error storing sensor data: {e}")
    
    def _check_thresholds(self, sensor_reading: SensorReading):
        """Check sensor values against thresholds"""
        try:
            import asyncio
            
            async def check():
                await self.alert_service.check_and_create_alerts(sensor_reading)
            
            if hasattr(self, 'main_loop') and self.main_loop:
                asyncio.run_coroutine_threadsafe(check(), self.main_loop)
            else:
                logger.error("❌ No main event loop found to run check")
            
        except Exception as e:
            logger.error(f"❌ Error checking thresholds: {e}")
    
    def start(self):
        """Start MQTT client"""
        try:
            import asyncio
            self.main_loop = asyncio.get_running_loop()
        except RuntimeError:
            import asyncio
            self.main_loop = asyncio.get_event_loop()
            
        try:
            self.client = mqtt.Client(client_id=settings.MQTT_CLIENT_ID)
            self.client.on_connect = self.on_connect
            self.client.on_disconnect = self.on_disconnect
            self.client.on_message = self.on_message
            
            logger.info(f"🔌 Connecting to MQTT broker: {settings.MQTT_BROKER}:{settings.MQTT_PORT}")
            self.client.connect(settings.MQTT_BROKER, settings.MQTT_PORT, 60)
            
            # Start network loop in background
            self.client.loop_start()
            logger.info("🚀 MQTT service started")
            
        except Exception as e:
            logger.error(f"❌ Failed to start MQTT service: {e}")
            raise
    
    def stop(self):
        """Stop MQTT client"""
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()
            logger.info("🛑 MQTT service stopped")
    
    def publish(self, topic: str, payload: dict):
        """Publish message to MQTT topic"""
        try:
            if self.client and self.is_connected:
                self.client.publish(topic, json.dumps(payload))
                logger.info(f"📤 Published to {topic}: {payload}")
            else:
                logger.warning("⚠️ MQTT client not connected")
        except Exception as e:
            logger.error(f"❌ Error publishing to MQTT: {e}")


# Global MQTT service instance
mqtt_service = MQTTService()
