from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class ThresholdSettings(BaseModel):
    """Threshold settings for sensor alerts"""
    soil_moisture_min: float = Field(30.0, ge=0, le=100, description="Minimum soil moisture %")
    soil_moisture_max: float = Field(70.0, ge=0, le=100, description="Maximum soil moisture %")
    temperature_min: float = Field(15.0, ge=-50, le=100, description="Minimum temperature °C")
    temperature_max: float = Field(35.0, ge=-50, le=100, description="Maximum temperature °C")
    humidity_min: float = Field(40.0, ge=0, le=100, description="Minimum humidity %")
    humidity_max: float = Field(80.0, ge=0, le=100, description="Maximum humidity %")
    light_intensity_min: float = Field(5000.0, ge=0, description="Minimum light intensity Lux")
    light_intensity_max: float = Field(50000.0, ge=0, description="Maximum light intensity Lux")
    
    class Config:
        json_schema_extra = {
            "example": {
                "soil_moisture_min": 30.0,
                "soil_moisture_max": 70.0,
                "temperature_min": 15.0,
                "temperature_max": 35.0,
                "humidity_min": 40.0,
                "humidity_max": 80.0,
                "light_intensity_min": 5000.0,
                "light_intensity_max": 50000.0
            }
        }


class EmailSettings(BaseModel):
    """Email notification settings"""
    email: Optional[EmailStr] = Field(None, description="Email address for alerts")
    enabled: bool = Field(False, description="Enable/disable email notifications")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "farmer@example.com",
                "enabled": True
            }
        }


class SystemSettings(BaseModel):
    """Complete system settings"""
    id: Optional[str] = Field(None, alias="_id")
    setting_type: str = Field("system", description="Type of settings")
    thresholds: ThresholdSettings = Field(default_factory=ThresholdSettings)
    email_settings: EmailSettings
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
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
                    "enabled": True
                }
            }
        }


class UpdateThresholds(BaseModel):
    """Request model for updating thresholds"""
    soil_moisture_min: Optional[float] = Field(None, ge=0, le=100)
    soil_moisture_max: Optional[float] = Field(None, ge=0, le=100)
    temperature_min: Optional[float] = Field(None, ge=-50, le=100)
    temperature_max: Optional[float] = Field(None, ge=-50, le=100)
    humidity_min: Optional[float] = Field(None, ge=0, le=100)
    humidity_max: Optional[float] = Field(None, ge=0, le=100)
    light_intensity_min: Optional[float] = Field(None, ge=0)
    light_intensity_max: Optional[float] = Field(None, ge=0)
