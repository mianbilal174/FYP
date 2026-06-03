from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class AlertType(str, Enum):
    """Types of alerts"""
    SOIL_MOISTURE_LOW = "soil_moisture_low"
    SOIL_MOISTURE_HIGH = "soil_moisture_high"
    TEMPERATURE_LOW = "temperature_low"
    TEMPERATURE_HIGH = "temperature_high"
    HUMIDITY_LOW = "humidity_low"
    HUMIDITY_HIGH = "humidity_high"
    LIGHT_INTENSITY_LOW = "light_intensity_low"
    LIGHT_INTENSITY_HIGH = "light_intensity_high"


class AlertSeverity(str, Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class Alert(BaseModel):
    """Alert model for threshold violations"""
    id: Optional[str] = Field(None, alias="_id")
    alert_type: AlertType
    severity: AlertSeverity = AlertSeverity.WARNING
    message: str
    sensor_value: float
    threshold_value: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_resolved: bool = Field(False)
    email_sent: bool = Field(False)
    resolved_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "alert_type": "temperature_high",
                "severity": "warning",
                "message": "Temperature is above threshold",
                "sensor_value": 38.5,
                "threshold_value": 35.0,
                "is_resolved": False,
                "email_sent": True
            }
        }


class AlertResponse(BaseModel):
    """Response model for alerts"""
    total_alerts: int
    unresolved_alerts: int
    alerts: list[Alert]


class AlertStats(BaseModel):
    """Alert statistics for dashboard"""
    total_alerts: int
    unresolved_alerts: int
    alerts_by_type: dict[str, int]
    alerts_by_severity: dict[str, int]
    recent_alerts: list[Alert]
