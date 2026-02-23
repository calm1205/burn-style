from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api import auth_router, category_router, health_router, subscription_template_router
from src.config import get_frontend_origin

app = FastAPI(title="Finance API", version="1.0.0")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[get_frontend_origin()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターを登録
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(category_router)
app.include_router(subscription_template_router)
