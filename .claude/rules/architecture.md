# アーキテクチャ

## レイヤド設計
- `backend/src/api/` → `backend/src/service/` → `backend/src/repository/` → `backend/src/model/`
- Pydanticスキーマ: `backend/src/schema/`
- エントリーポイント: `backend/src/main.py`
- 設定: `backend/src/config.py`

## ディレクトリ構造
```
burn-style/
├── backend/
│   ├── src/
│   │   ├── api/          # ルーター・エンドポイント定義
│   │   ├── service/      # ビジネスロジック
│   │   ├── repository/   # DB操作
│   │   ├── model/        # SQLAlchemyモデル
│   │   ├── schema/       # Pydanticスキーマ
│   │   ├── config.py     # 環境設定
│   │   └── main.py       # FastAPIアプリ初期化
│   ├── alembic/          # マイグレーション
│   └── scripts/          # seedスクリプト等
├── frontend/
│   └── src/              # Reactアプリ
├── .github/workflows/    # GitHub Actions
├── Makefile              # 開発コマンド
└── docker-compose.yml    # ローカル開発環境
```

## 認証
- WebAuthn/パスキーによるパスワードレス認証
- JWT (JSON Web Token) によるセッション管理
- 関連モデル: `User`, `WebAuthnCredential`
