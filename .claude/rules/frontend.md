# フロントエンド規約

## 技術スタック
- **言語**: TypeScript 5.9
- **UIライブラリ**: React 19
- **ビルドツール**: Vite 8
- **CSS**: Tailwind CSS v4
- **UIコンポーネント**: Radix UI Themes
- **リンター**: oxlint
- **フォーマッター**: oxfmt

## oxlint 設定
- import sortルール有効

## oxfmt 設定
- インデント: スペース
- クォート: ダブルクォート (`"`)
- セミコロン: なし（ASI保護時のみ自動付与）

## Tailwind CSS v4
- Viteプラグイン (`@tailwindcss/vite`) で統合
- CSS-firstの設定（`tailwind.config.js` 不要）

## コーディング規約
- 関数定義はアロー関数 (`const fn = () => {}`) を使用（`function` 宣言は不可）
- 型定義は可能な限り `interface` を使用（`type` は union型等 `interface` で表現できない場合のみ）
- named export に統一（`export default` は使用しない）

## ビルド
- `tsc -b && vite build` でビルド
- `vite` で開発サーバー起動
