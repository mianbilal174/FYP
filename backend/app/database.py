from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class Database:
    """MongoDB database connection manager"""
    
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None
    
    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB"""
        try:
            cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
            cls.db = cls.client[settings.DATABASE_NAME]
            
            # Test connection
            await cls.client.admin.command('ping')
            logger.info(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")
            
            # Create indexes
            await cls.create_indexes()
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to MongoDB: {e}")
            raise
    
    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            logger.info("🔌 MongoDB connection closed")
    
    @classmethod
    async def create_indexes(cls):
        """Create database indexes for better performance"""
        try:
            # Sensor data indexes
            await cls.db.sensor_data.create_index([("timestamp", -1)])
            await cls.db.sensor_data.create_index([("sensor_type", 1)])
            
            # Alerts indexes
            await cls.db.alerts.create_index([("timestamp", -1)])
            await cls.db.alerts.create_index([("is_resolved", 1)])
            
            # Settings indexes
            await cls.db.settings.create_index([("setting_type", 1)], unique=True)
            
            logger.info("✅ Database indexes created")
        except Exception as e:
            logger.warning(f"⚠️ Index creation warning: {e}")
    
    @classmethod
    def get_db(cls) -> AsyncIOMotorDatabase:
        """Get database instance"""
        return cls.db


# Dependency for FastAPI routes
async def get_database() -> AsyncIOMotorDatabase:
    """FastAPI dependency to get database"""
    return Database.get_db()
