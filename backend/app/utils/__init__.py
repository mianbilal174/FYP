"""Utility helper functions"""
from datetime import datetime
from typing import Any, Dict


def format_timestamp(dt: datetime) -> str:
    """Format datetime to ISO string"""
    return dt.isoformat()


def convert_objectid_to_str(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert MongoDB ObjectId to string"""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc
