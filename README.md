# 投資キャラ診断（Portfolio Pals）

資産構成を入れるだけ。質問ゼロ。BAKA-017。

設計書：`C:\Users\Sho\Development\design\BAKA-017_ポートフォリオ性格診断\`

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発用サーバー |
| `npm test` | 自動テスト（Vitest） |
| `npm run build` | 型の検査とビルド（`dist/`） |

- `sim/` … 設計時の判定の参照実装と検証スクリプト（設計書の `sim\` をそのまま置いたもの）
- 環境変数は `.env`（`VITE_SITE_URL`・`VITE_GA_ID`）
