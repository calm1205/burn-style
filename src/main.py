from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.repository.database import engine, Base
from src.api import router

# テーブルを作成
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Finance API", version="1.0.0")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターを登録
app.include_router(router)
