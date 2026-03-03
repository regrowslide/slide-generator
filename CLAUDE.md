# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

```bash
npm run dev              # 開発サーバー（Turbopack + Tailwind watch）
npm run build            # 本番ビルド（prisma generate → next build）
npm run lint             # ESLint チェック
npm run lint-fix         # ESLint 修正 + Prettier フォーマット
npx tsc --noEmit         # 型チェック
npx prisma db push       # スキーマをDBに反映（migrate devはシャドウDB問題あり、db pushを使う）
npx prisma generate      # Prismaクライアント生成
```

## アーキテクチャ

複数の業務アプリを1つのNext.js (App Router)プロジェクトで運用するマルチアプリ基盤。

### レイヤー構成

- **`src/app/(apps)/[app-name]/`** — 各アプリ（KM, regrow, dental 等）。`_actions/`にServer Actions、`lib/services/`にサービスクラス、`components/`にアプリ固有コンポーネント
- **`src/cm/`** — 全アプリ共有の共通モジュール。`class/`にユーティリティクラス（Days, FileHandler等）、`components/`に共通UI、`hooks/`にカスタムフック、`providers/`にContext Provider、`shadcn/`にshadcn UIコンポーネント
- **`src/non-common/`** — アプリ横断だがcmには入れないコード（ページ定数、パス定義等）
- **`prisma/schema/`** — アプリごとに分割されたPrismaスキーマファイル群

### 認証

NextAuth（JWT戦略）。Google OAuth + Credentials。ログインページは `/login`。`User`モデルを中心に`UserRole` + `RoleMaster`で権限管理。

### Provider構成

`AppRootProvider` が SessionProvider → SWRConfig → DeviceContext → SessionContext → NavigationContext → LoaderContext の順でラップ。

## 開発ルール

- **モーダル** → `useModal`（`@cm/components/utils/modal/useModal`）を使う
- **日付処理** → `Days` クラス（`@cm/class/Days/Days`）を使う。`date-fns` / `dayjs` を直接使わない
- **日付保存** → DBにはUTC時刻で保存する
- **UTC ↔ JST変換** → `toUtc()` / `toJst()`（`@cm/class/Days/date-utils/calculations`）
- **Server Actions** → `'use server'`、CRUD順、DBアクセスはサービスクラスに委譲
- **サービスクラス** → 静的メソッドのみ、`PascalCase + Service` 命名、Prismaクライアント直接使用
