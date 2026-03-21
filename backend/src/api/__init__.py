from src.api.auth import auth_router
from src.api.categories import category_router
from src.api.expense_templates import expense_template_router
from src.api.expenses import expense_router
from src.api.health import health_router
from src.api.users import user_router

__all__ = [
    "auth_router",
    "category_router",
    "expense_router",
    "expense_template_router",
    "health_router",
    "user_router",
]
