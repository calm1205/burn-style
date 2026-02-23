from src.api.auth import auth_router
from src.api.categories import category_router
from src.api.health import health_router
from src.api.subscription_templates import subscription_template_router

__all__ = ["auth_router", "category_router", "health_router", "subscription_template_router"]
