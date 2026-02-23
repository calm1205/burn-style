from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api import auth_router, router
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
app.include_router(router)
app.include_router(auth_router)
