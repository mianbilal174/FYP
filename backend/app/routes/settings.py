from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_database
from app.models import SystemSettings, EmailSettings, UpdateThresholds, ThresholdSettings
from datetime import datetime
import logging
from app.services.mqtt_service import mqtt_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get("/", response_model=SystemSettings)
async def get_settings(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Get current system settings"""
    try:
        settings = await db.settings.find_one({"setting_type": "system"})
        
        if not settings:
            # Create default settings if none exist
            default_settings = SystemSettings(
                setting_type="system",
                thresholds=ThresholdSettings(),
                email_settings=EmailSettings(email=None, enabled=False)
            )
            
            settings_dict = default_settings.model_dump(exclude={"id"})
            result = await db.settings.insert_one(settings_dict)
            settings = await db.settings.find_one({"_id": result.inserted_id})
        
        settings["_id"] = str(settings["_id"])
        return SystemSettings(**settings)
    
    except Exception as e:
        logger.error(f"Error getting settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/email", response_model=SystemSettings)
async def update_email_settings(
    email_settings: EmailSettings,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update email notification settings"""
    try:
        result = await db.settings.update_one(
            {"setting_type": "system"},
            {
                "$set": {
                    "email_settings": email_settings.model_dump(),
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        settings = await db.settings.find_one({"setting_type": "system"})
        settings["_id"] = str(settings["_id"])
        
        logger.info(f"✅ Email settings updated: {email_settings.email}")
        return SystemSettings(**settings)
    
    except Exception as e:
        logger.error(f"Error updating email settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/thresholds", response_model=SystemSettings)
async def update_thresholds(
    thresholds: UpdateThresholds,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update sensor thresholds"""
    try:
        current_settings = await db.settings.find_one({"setting_type": "system"})
        
        if not current_settings:
            raise HTTPException(status_code=404, detail="Settings not found")
        
        current_thresholds = current_settings.get("thresholds", {})
        update_data = thresholds.model_dump(exclude_none=True)
        
        for key, value in update_data.items():
            current_thresholds[key] = value
        
        await db.settings.update_one(
            {"setting_type": "system"},
            {
                "$set": {
                    "thresholds": current_thresholds,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        settings = await db.settings.find_one({"setting_type": "system"})
        settings["_id"] = str(settings["_id"])
        
        logger.info("✅ Thresholds updated successfully")
        
        # Publish dynamic thresholds back to the ESP32
        mqtt_service.publish("smart_irrigation/settings", current_thresholds)
        
        return SystemSettings(**settings)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating thresholds: {e}")
        raise HTTPException(status_code=500, detail=str(e))
