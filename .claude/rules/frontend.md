# フロントエンド規約

## 技術スタック
- **言語**: TypeScript 5.9
- **UIライブラリ**: React 19
- **ビルドツール**: Vite 7
- **CSS**: Tailwind CSS v4
- **UIコンポーネント**: Radix UI Themes
- **リンター/フォーマッター**: Biome 2.x

## Biome 設定
- インデント: スペース
- クォート: ダブルクォート (`"`)
- import自動整理: 有効
- recommended ルール適用

## Tailwind CSS v4
- Viteプラグイン (`@tailwindcss/vite`) で統合
- CSS-firstの設定（`tailwind.config.js` 不要）

## コーディング規約
- 関数定義はアロー関数 (`const fn = () => {}`) を使用（`function` 宣言は不可）
- 型定義は可能な限り `interface` を使用（`type` は union型等 `interface` で表現できない場合のみ）

## ビルド
- `tsc -b && vite build` でビルド
- `vite` で開発サーバー起動
