from .dashboard import router as dashboard_router
from .settings import router as settings_router
from .alerts import router as alerts_router

__all__ = ["dashboard_router", "settings_router", "alerts_router"]
