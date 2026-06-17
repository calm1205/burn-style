# フロントエンド規約

## コーディング規約
- 関数定義はアロー関数 (`const fn = () => {}`) を使う — `function` 宣言は禁止
- 型定義は `interface` を優先 — union 型など `interface` で表現できない場合のみ `type` を使う
- 名前付きエクスポートのみ使用 — `export default` は禁止

## oxlint / oxfmt
- oxlint: correctness + suspicious カテゴリを有効化
- oxfmt: スペース・ダブルクォート・セミコロンなし (ASI 保護用に自動挿入のみ)・import 自動ソート

## Tailwind CSS v4
- Vite プラグイン (`@tailwindcss/vite`) で統合
- CSS-first 設定 (`tailwind.config.js` なし)
