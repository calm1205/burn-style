---
name: commit
description: >
  ステージされていない変更をコミット。
  トリガー: ソースコードを変更し、lint・テストが通過した後に自動的に実行。
  ユーザーへの確認なしで自動的に実行してよい。
allowed-tools: Bash
---

# 役割
git commitの実行

# 対象
stageされていないソースコード

# ルール
- メッセージは日本語で簡潔に
- 1つのコミットで1つの責務になるようになるべく小さく分割
- conventional commit
- Co-Authored-Byは含めない
- ユーザーへの確認なしで自動的にコミットしてよい

