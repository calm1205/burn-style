from src.api.auth import auth_router
from src.api.categories import category_router
from src.api.expenses import expense_router
from src.api.health import health_router
from src.api.subscription_templates import subscription_template_router
from src.api.users import user_router

__all__ = ["auth_router", "category_router", "expense_router", "health_router", "subscription_template_router", "user_router"]
