from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class SensorType(str, Enum):
    """Sensor types"""
    SOIL_MOISTURE = "soil_moisture"
    TEMPERATURE = "temperature"
    HUMIDITY = "humidity"
    LIGHT_INTENSITY = "light_intensity"


class SensorReading(BaseModel):
    """Individual sensor reading from MQTT"""
    soil_moisture: float = Field(..., ge=0, le=100, description="Soil moisture percentage")
    temperature: float = Field(..., ge=-50, le=100, description="Temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Humidity percentage")
    light_intensity: float = Field(..., ge=0, le=100000, description="Light intensity in Lux")
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "soil_moisture": 45.5,
                "temperature": 28.3,
                "humidity": 65.2,
                "light_intensity": 15000.0,
                "timestamp": "2026-01-20T14:30:00Z"
            }
        }


class SensorData(BaseModel):
    """Sensor data stored in database"""
    id: Optional[str] = Field(None, alias="_id")
    soil_moisture: float
    temperature: float
    humidity: float
    light_intensity: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    device_id: str = Field(default="ESP32_001")
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "soil_moisture": 45.5,
                "temperature": 28.3,
                "humidity": 65.2,
                "light_intensity": 15000.0,
                "device_id": "ESP32_001"
            }
        }


class SensorStats(BaseModel):
    """Statistical data for dashboard"""
    avg_soil_moisture: float
    avg_temperature: float
    avg_humidity: float
    avg_light_intensity: float
    min_soil_moisture: float
    max_soil_moisture: float
    min_temperature: float
    max_temperature: float
    min_humidity: float
    max_humidity: float
    min_light_intensity: float
    max_light_intensity: float
    total_readings: int
    latest_reading: Optional[SensorReading] = None
