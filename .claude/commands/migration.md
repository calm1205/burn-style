---
description: モデル差分からAlembicマイグレーション作成・レビュー
---

# 役割
Alembicマイグレーションの作成とレビュー

# ワークフロー

## 1. モデル差分確認
- `backend/src/model/` 配下の変更を `git diff` で確認
- 変更がなければ「マイグレーション対象なし」と出力して終了

## 2. マイグレーション生成
- 変更内容から適切なメッセージを生成
- `make revision MESSAGE="メッセージ"` を実行

## 3. 生成ファイルレビュー
- `backend/alembic/versions/` の最新ファイルを読む
- upgrade / downgrade の内容が正しいか確認
- 不要な変更や漏れがないか検証

## 4. 結果出力
- 生成したマイグレーションの内容を要約
- 問題があれば報告

# ルール
- メッセージは日本語で簡潔に（例: `add_ondelete_cascade`）
- `make upgrade` の実行はユーザーに確認してから
