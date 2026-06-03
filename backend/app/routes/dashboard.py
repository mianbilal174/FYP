from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_database
from app.models import SensorData, SensorStats
from datetime import datetime, timedelta
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/sensor-data/latest", response_model=SensorData)
async def get_latest_sensor_data(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Get the most recent sensor reading"""
    try:
        sensor_data = await db.sensor_data.find_one(
            sort=[("timestamp", -1)]
        )
        
        if not sensor_data:
            raise HTTPException(status_code=404, detail="No sensor data found")
        
        # Convert ObjectId to string
        sensor_data["_id"] = str(sensor_data["_id"])
        
        return SensorData(**sensor_data)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting latest sensor data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sensor-data/history", response_model=List[SensorData])
async def get_sensor_data_history(
    hours: int = Query(24, ge=1, le=168, description="Number of hours to retrieve"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get historical sensor data for specified time period"""
    try:
        # Calculate time threshold
        time_threshold = datetime.utcnow() - timedelta(hours=hours)
        
        # Query database
        cursor = db.sensor_data.find(
            {"timestamp": {"$gte": time_threshold}}
        ).sort("timestamp", -1).limit(limit)
        
        sensor_data_list = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for data in sensor_data_list:
            data["_id"] = str(data["_id"])
        
        return [SensorData(**data) for data in sensor_data_list]
    
    except Exception as e:
        logger.error(f"Error getting sensor data history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats", response_model=SensorStats)
async def get_sensor_statistics(
    hours: int = Query(24, ge=1, le=168, description="Time period for statistics"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get statistical summary of sensor data"""
    try:
        time_threshold = datetime.utcnow() - timedelta(hours=hours)
        
        # Aggregation pipeline
        pipeline = [
            {"$match": {"timestamp": {"$gte": time_threshold}}},
            {
                "$group": {
                    "_id": None,
                    "avg_soil_moisture": {"$avg": "$soil_moisture"},
                    "avg_temperature": {"$avg": "$temperature"},
                    "avg_humidity": {"$avg": "$humidity"},
                    "avg_light_intensity": {"$avg": "$light_intensity"},
                    "min_soil_moisture": {"$min": "$soil_moisture"},
                    "max_soil_moisture": {"$max": "$soil_moisture"},
                    "min_temperature": {"$min": "$temperature"},
                    "max_temperature": {"$max": "$temperature"},
                    "min_humidity": {"$min": "$humidity"},
                    "max_humidity": {"$max": "$humidity"},
                    "min_light_intensity": {"$min": "$light_intensity"},
                    "max_light_intensity": {"$max": "$light_intensity"},
                    "total_readings": {"$sum": 1}
                }
            }
        ]
        
        cursor = db.sensor_data.aggregate(pipeline)
        result = await cursor.to_list(length=1)
        
        if not result:
            raise HTTPException(status_code=404, detail="No data available for statistics")
        
        stats = result[0]
        stats.pop("_id", None)
        
        # Get latest reading
        latest = await db.sensor_data.find_one(sort=[("timestamp", -1)])
        if latest:
            latest.pop("_id", None)
            stats["latest_reading"] = latest
        
        return SensorStats(**stats)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting sensor statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Health check endpoint"""
    try:
        # Check database connection
        await db.command("ping")
        
        # Get latest data timestamp
        latest = await db.sensor_data.find_one(sort=[("timestamp", -1)])
        
        return {
            "status": "healthy",
            "database": "connected",
            "latest_data": latest["timestamp"] if latest else None,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unavailable")
