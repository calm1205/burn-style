# フロントエンド規約

## 技術スタック
- **言語**: TypeScript 5.9
- **UIライブラリ**: React 19
- **ビルドツール**: Vite 7
- **CSS**: Tailwind CSS v4
- **UIコンポーネント**: Radix UI Themes
- **リンター/フォーマッター**: Biome 2.x

## Biome 設定
- インデント: タブ
- クォート: ダブルクォート (`"`)
- import自動整理: 有効
- recommended ルール適用

## Tailwind CSS v4
- Viteプラグイン (`@tailwindcss/vite`) で統合
- CSS-firstの設定（`tailwind.config.js` 不要）

## ビルド
- `tsc -b && vite build` でビルド
- `vite` で開発サーバー起動
