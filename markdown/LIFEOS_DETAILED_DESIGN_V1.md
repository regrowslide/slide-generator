# LifeOS 詳細設計書 v1.0

## 1. ディレクトリ構成 (Project Structure)

Next.js App Routerの特性を活かし、機能単位（Features）と共通基盤（Shared）を分離する。

#### 1.1. ルート構造

```
src/
├── app/
│   └── (apps)/
│       └── lifeos/                    # LifeOS独立アプリ
│           ├── (pages)/               # ページコンポーネント
│           │   ├── layout.tsx         # LifeOS専用レイアウト
│           │   ├── page.tsx           # メインダッシュボード
│           │   └── ...
│           ├── components/            # LifeOS専用コンポーネント
│           │   ├── archetypes/        # UIアーキタイプ (動的コンポーネント)
│           │   │   ├── registry.ts    # マッピング定義
│           │   │   ├── MetricTracker.tsx
│           │   │   ├── TaskList.tsx
│           │   │   ├── TimelineLog.tsx
│           │   │   ├── AttributeCard.tsx
│           │   │   └── Heatmap.tsx
│           │   └── chat/              # チャットUI関連
│           │       ├── ChatInterface.tsx
│           │       └── PlanConfirmationCard.tsx
│           ├── api/                   # Route Handlers (WhisperなどStreamingが必要な場合)
│           ├── actions/               # Server Actions (AI処理)
│           │   └── index.ts
│           ├── hooks/                 # LifeOS専用カスタムフック
│           ├── types/                 # LifeOS専用型定義
│           │   └── index.ts
│           └── lib/                   # LifeOS専用ユーティリティ
│               └── utils.ts
```

### 1.2. 各ディレクトリの役割

#### `(pages)/`

- **`layout.tsx`**: LifeOS専用レイアウト。Adminコンポーネントを使用してSidebarとMain Canvasを提供
- **`page.tsx`**: メインダッシュボードページ。LifeOSの主要機能へのアクセスを提供

#### `components/archetypes/`

- **`registry.ts`**: UIアーキタイプのマッピング定義。データスキーマから適切なコンポーネントを選択するためのレジストリ
- **`MetricTracker.tsx`**: メトリクス追跡用のアーキタイプコンポーネント
- **`TaskList.tsx`**: タスクリスト表示用のアーキタイプコンポーネント
- **`TimelineLog.tsx`**: タイムラインログ表示用のアーキタイプコンポーネント
- **`AttributeCard.tsx`**: 属性カード表示用のアーキタイプコンポーネント
- **`Heatmap.tsx`**: ヒートマップ表示用のアーキタイプコンポーネント

#### `components/chat/`

- **`ChatInterface.tsx`**: チャットインターフェースコンポーネント。ユーザーとの対話を提供
- **`PlanConfirmationCard.tsx`**: 計画確認カードコンポーネント。AIが生成した計画の確認・承認を提供

#### `api/`

- Route Handlers。Whisper APIなど、ストリーミングが必要なエンドポイントを配置

#### `actions/`

- Server Actionsのメインエントリポイント。AI処理の主要ロジックを実装
- `processNaturalLanguage`: 自然言語の処理
- `generateSchema`: データスキーマの生成
- `selectArchetype`: 適切なアーキタイプの選択

#### `types/`

- LifeOS専用の型定義
- `ArchetypeType`: アーキタイプの種類
- `LifeOSData`: LifeOSデータの基本構造
- `Category`: カテゴリーの定義
- `SchemaField`: スキーマフィールドの定義

#### `lib/`

- LifeOS専用のユーティリティ関数
- `inferArchetype`: データスキーマからアーキタイプを推測
- `extractCategory`: 自然言語からカテゴリーを抽出
- `validateData`: データの検証

### 1.3. 設計原則

1. **機能単位の分離**: 各機能は独立したディレクトリに配置し、依存関係を明確化
2. **共通基盤の共有**: `components/`, `lib/`, `hooks/` などは全機能で共有
3. **動的コンポーネント**: `archetypes/` により、AIがデータスキーマに応じて適切なUIコンポーネントを選択
4. **Server Actions優先**: API RouteはStreamingが必要な場合のみ使用

### 1.4. 既存構造との関係

- 既存の `src/cm/` 構造は共通基盤として維持
- 既存の `src/app/layout.tsx` はルートレイアウトとして維持
- LifeOSは `(apps)` ルートグループ内の独立アプリとして動作
- 既存の `hakobun`、`image-captioner` などのアプリと同じ構造パターンを採用

## 2. 技術スタック

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (v15+, JSONB活用)
- **ORM**: Prisma
- **UI**: Tailwind CSS, Lucide Icons

## 3. コアバリュー

1. ユーザーはテーブル設計を意識せず、喋るだけで記録できる
2. AIが入力内容から動的に「カテゴリー」と「データスキーマ」を生成する
3. データの種類に応じて、AIが最適な「UIコンポーネント（アーキタイプ）」を選択し、可視化する

## 4. データフロー

```
ユーザー入力（自然言語）
  ↓
Server Actions (processNaturalLanguage)
  ↓
AI処理（カテゴリー・スキーマ生成）
  ↓
アーキタイプ選択 (selectArchetype)
  ↓
動的コンポーネント表示 (archetypes/registry.ts)
  ↓
UI表示
```

## 5. 実装ファイル

### ページ構造

- [src/app/(apps)/lifeos/(pages)/layout.tsx](<src/app/(apps)/lifeos/(pages)/layout.tsx>) - LifeOS専用レイアウト
- [src/app/(apps)/lifeos/(pages)/page.tsx](<src/app/(apps)/lifeos/(pages)/page.tsx>) - メインダッシュボード

### アーキタイプコンポーネント

- [src/app/(apps)/lifeos/components/archetypes/registry.ts](<src/app/(apps)/lifeos/components/archetypes/registry.ts>) - アーキタイプレジストリ
- [src/app/(apps)/lifeos/components/archetypes/MetricTracker.tsx](<src/app/(apps)/lifeos/components/archetypes/MetricTracker.tsx>) - メトリックトラッカー
- [src/app/(apps)/lifeos/components/archetypes/TaskList.tsx](<src/app/(apps)/lifeos/components/archetypes/TaskList.tsx>) - タスクリスト
- [src/app/(apps)/lifeos/components/archetypes/TimelineLog.tsx](<src/app/(apps)/lifeos/components/archetypes/TimelineLog.tsx>) - タイムラインログ
- [src/app/(apps)/lifeos/components/archetypes/AttributeCard.tsx](<src/app/(apps)/lifeos/components/archetypes/AttributeCard.tsx>) - 属性カード
- [src/app/(apps)/lifeos/components/archetypes/Heatmap.tsx](<src/app/(apps)/lifeos/components/archetypes/Heatmap.tsx>) - ヒートマップ

### チャットコンポーネント

- [src/app/(apps)/lifeos/components/chat/ChatInterface.tsx](<src/app/(apps)/lifeos/components/chat/ChatInterface.tsx>) - チャットインターフェース
- [src/app/(apps)/lifeos/components/chat/PlanConfirmationCard.tsx](<src/app/(apps)/lifeos/components/chat/PlanConfirmationCard.tsx>) - 計画確認カード

### Server Actions

- [src/app/(apps)/lifeos/actions/index.ts](<src/app/(apps)/lifeos/actions/index.ts>) - AI処理のServer Actions

### 型定義とユーティリティ

- [src/app/(apps)/lifeos/types/index.ts](<src/app/(apps)/lifeos/types/index.ts>) - 型定義
- [src/app/(apps)/lifeos/lib/utils.ts](<src/app/(apps)/lifeos/lib/utils.ts>) - ユーティリティ関数
