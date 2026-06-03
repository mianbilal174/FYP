from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_database
from app.models import Alert, AlertResponse, AlertStats
from bson import ObjectId
from datetime import datetime, timedelta
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("/", response_model=List[Alert])
async def get_alerts(
    limit: int = Query(50, ge=1, le=200),
    unresolved_only: bool = Query(False),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get alerts with optional filtering"""
    try:
        query = {}
        if unresolved_only:
            query["is_resolved"] = False
        
        cursor = db.alerts.find(query).sort("timestamp", -1).limit(limit)
        alerts = await cursor.to_list(length=limit)
        
        for alert in alerts:
            alert["_id"] = str(alert["_id"])
        
        return [Alert(**alert) for alert in alerts]
    
    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats", response_model=AlertStats)
async def get_alert_stats(
    hours: int = Query(24, ge=1, le=168),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get alert statistics"""
    try:
        time_threshold = datetime.utcnow() - timedelta(hours=hours)
        
        total_alerts = await db.alerts.count_documents(
            {"timestamp": {"$gte": time_threshold}}
        )
        
        unresolved_alerts = await db.alerts.count_documents(
            {"timestamp": {"$gte": time_threshold}, "is_resolved": False}
        )
        
        pipeline = [
            {"$match": {"timestamp": {"$gte": time_threshold}}},
            {"$group": {"_id": "$alert_type", "count": {"$sum": 1}}}
        ]
        
        alerts_by_type_cursor = db.alerts.aggregate(pipeline)
        alerts_by_type_list = await alerts_by_type_cursor.to_list(length=None)
        alerts_by_type = {item["_id"]: item["count"] for item in alerts_by_type_list}
        
        pipeline[1]["$group"]["_id"] = "$severity"
        alerts_by_severity_cursor = db.alerts.aggregate(pipeline)
        alerts_by_severity_list = await alerts_by_severity_cursor.to_list(length=None)
        alerts_by_severity = {item["_id"]: item["count"] for item in alerts_by_severity_list}
        
        recent_cursor = db.alerts.find(
            {"timestamp": {"$gte": time_threshold}}
        ).sort("timestamp", -1).limit(10)
        
        recent_alerts = await recent_cursor.to_list(length=10)
        for alert in recent_alerts:
            alert["_id"] = str(alert["_id"])
        
        return AlertStats(
            total_alerts=total_alerts,
            unresolved_alerts=unresolved_alerts,
            alerts_by_type=alerts_by_type,
            alerts_by_severity=alerts_by_severity,
            recent_alerts=[Alert(**alert) for alert in recent_alerts]
        )
    
    except Exception as e:
        logger.error(f"Error getting alert stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Mark an alert as resolved"""
    try:
        result = await db.alerts.update_one(
            {"_id": ObjectId(alert_id)},
            {
                "$set": {
                    "is_resolved": True,
                    "resolved_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return {"message": "Alert resolved successfully", "alert_id": alert_id}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resolving alert: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{alert_id}")
async def delete_alert(
    alert_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete an alert"""
    try:
        result = await db.alerts.delete_one({"_id": ObjectId(alert_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return {"message": "Alert deleted successfully", "alert_id": alert_id}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting alert: {e}")
        raise HTTPException(status_code=500, detail=str(e))
