import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api import auth_router, router

app = FastAPI(title="Finance API", version="1.0.0")

# CORS設定
_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターを登録
app.include_router(router)
app.include_router(auth_router)
