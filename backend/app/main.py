from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from app.config import settings
from app.database import Database
from app.routes import dashboard_router, settings_router, alerts_router
from app.services.mqtt_service import mqtt_service

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("🚀 Starting Smart Crop Irrigation System...")
    
    try:
        # Connect to MongoDB
        await Database.connect_db()
        
        # Start MQTT service
        mqtt_service.start()
        
        logger.info("✅ Application started successfully")
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down application...")
    
    try:
        # Stop MQTT service
        mqtt_service.stop()
        
        # Close database connection
        await Database.close_db()
        
        logger.info("✅ Application shutdown complete")
        
    except Exception as e:
        logger.error(f"❌ Shutdown error: {e}")


# Create FastAPI application
app = FastAPI(
    title="Smart Crop Irrigation System API",
    description="IoT-based crop monitoring system with real-time sensor data and alert notifications",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard_router)
app.include_router(settings_router)
app.include_router(alerts_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Smart Crop Irrigation System API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "mqtt_connected": mqtt_service.is_connected,
        "database": "connected" if Database.db else "disconnected"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.DEBUG
    )
