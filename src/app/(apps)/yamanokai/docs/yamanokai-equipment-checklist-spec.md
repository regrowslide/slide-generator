# 装備表機能 詳細仕様書

---

## 1. 機能概要

### 1.1 目的

例会ごとに必要な装備品（個人装備・共同装備）のチェックリストを管理し、管理者が例会に紐づけて設定、一般会員が閲覧できる機能を提供する。

### 1.2 重要な設計方針

**装備表の品目（チェックリスト）と、貸出用装備（物品管理）は完全に別概念として管理する。**

| 概念 | 説明 | Prismaモデル |
|------|------|-------------|
| **装備表品目** | 個人が持参すべき装備のチェックリスト（ザック、登山靴、ヘッドランプなど） | `YamanokaiChecklistItem` |
| **例会装備表** | 例会と品目の多対多リレーション（例会ごとに必要な品目と必要度を設定） | `YamanokaiEventChecklistItem` |
| **貸出用装備** | 会が所有し貸出管理する物品（テント#1、無線機#2など） | `YamanokaiEquipment`（既存） |

### 1.3 ユーザーストーリー

| # | ユーザー | ストーリー |
|---|---------|-----------|
| 1 | 管理者 | 装備表の品目マスターを登録・編集・削除できる |
| 2 | 管理者/CL | 例会設定画面から、その例会に必要な装備品目と必要度レベルを設定できる |
| 3 | 一般会員 | 例会詳細画面から、設定された装備表を個人装備・共同装備に分けて閲覧できる |

---

## 2. データモデル設計

### 2.1 ER図

```
YamanokaiChecklistItem (装備表品目マスター)
  ├── id
  ├── name                    // 品名
  ├── category                // "personal" | "shared"
  ├── defaultRequirementLevel // "required" | "recommended" | "optional"
  ├── sortOrder
  └── isDeleted

YamanokaiEventChecklistItem (例会装備表: 多対多中間テーブル)
  ├── id
  ├── yamanokaiEventId        → YamanokaiEvent.id
  ├── yamanokaiChecklistItemId → YamanokaiChecklistItem.id
  ├── requirementLevel        // "required" | "recommended" | "optional"
  └── @@unique([yamanokaiEventId, yamanokaiChecklistItemId])
```

### 2.2 Prismaスキーマ追加分

`prisma/schema/yamanokai.prisma` に以下を追加する。

```prisma
/// 装備表品目マスター
/// 個人装備・共同装備のチェックリスト品目を管理
model YamanokaiChecklistItem {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)

  name                    String  @db.VarChar(200) // "ザック", "登山靴", "コッヘルセット"
  category                String  @db.VarChar(20)  // "personal" | "shared"
  defaultRequirementLevel String  @default("required") @db.VarChar(20) // "required" | "recommended" | "optional"
  isDeleted               Boolean @default(false)

  // リレーション
  YamanokaiEventChecklistItem YamanokaiEventChecklistItem[]

  @@map("yamanokai_checklist_items")
}

/// 例会装備表（多対多中間テーブル）
/// 例会ごとに必要な装備品目と必要度レベルを設定
model YamanokaiEventChecklistItem {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt

  requirementLevel String @default("required") @db.VarChar(20) // "required" | "recommended" | "optional"

  // リレーション
  YamanokaiEvent          YamanokaiEvent         @relation(fields: [yamanokaiEventId], references: [id], onDelete: Cascade)
  yamanokaiEventId        Int
  YamanokaiChecklistItem  YamanokaiChecklistItem @relation(fields: [yamanokaiChecklistItemId], references: [id], onDelete: Cascade)
  yamanokaiChecklistItemId Int

  @@unique([yamanokaiEventId, yamanokaiChecklistItemId])
  @@map("yamanokai_event_checklist_items")
}
```

### 2.3 既存モデルへのリレーション追加

`YamanokaiEvent` モデルに以下のリレーションを追加する。

```prisma
// yamanokai_events 内に追加
YamanokaiEventChecklistItem YamanokaiEventChecklistItem[]
```

### 2.4 定数定義

#### カテゴリ

| 値 | 表示名 | 説明 |
|---|-------|------|
| `personal` | 個人装備 | 個人が持参する装備 |
| `shared` | 共同装備 | グループで分担する装備 |

#### 必要度レベル

| 値 | 表示ラベル | 表示名 | 色 |
|---|----------|-------|---|
| `required` | ○ | 必須 | 赤系 (`#ef4444` / `#fee2e2`) |
| `recommended` | △ | 推奨 | 黄系 (`#eab308` / `#fef9c3`) |
| `optional` | （空欄） | 任意 | グレー (`#6b7280` / `#f3f4f6`) |

---

## 3. 初期データ（シードデータ）

### 3.1 個人装備（40件）

| sortOrder | 品名 | デフォルト必要度 |
|-----------|------|----------------|
| 1 | ザック | required |
| 2 | 登山靴 | required |
| 3 | 帽子 | required |
| 4 | 雨具 | required |
| 5 | 傘 | optional |
| 6 | ザックカバー | recommended |
| 7 | Lスパッツ | recommended |
| 8 | 手袋 | required |
| 9 | ストック | optional |
| 10 | サングラス | recommended |
| 11 | ヘッドランプ | required |
| 12 | 替え電池 | required |
| 13 | ナイフ | recommended |
| 14 | ホイッスル | required |
| 15 | 筆記具 | required |
| 16 | 地図 | required |
| 17 | コンパス | required |
| 18 | 時計 | required |
| 19 | 計画書 | required |
| 20 | チリ紙 | required |
| 21 | 保険証 | required |
| 22 | タオル | required |
| 23 | 着替え | recommended |
| 24 | 替靴下 | recommended |
| 25 | 替手袋 | recommended |
| 26 | 防寒着 | required |
| 27 | ホッカイロ | optional |
| 28 | 日焼け止め | recommended |
| 29 | 行動食 | required |
| 30 | 非常食 | required |
| 31 | プラティパス2L | recommended |
| 32 | 水筒 | required |
| 33 | テルモス | recommended |
| 34 | 食器 | required |
| 35 | 箸・スプーン | required |
| 36 | 軍手（調理用） | optional |
| 37 | オーバーミトン | optional |
| 38 | シュラフ | required |
| 39 | シュラフカバー | recommended |
| 40 | マット | required |

### 3.2 共同装備（19件）

| sortOrder | 品名 | デフォルト必要度 |
|-----------|------|----------------|
| 41 | 個人テント（1人用）本体 | required |
| 42 | 個人テント（1人用）フライ | required |
| 43 | 個人テント（1人用）ポール | required |
| 44 | 個人テント（1人用）マット×3 | optional |
| 45 | 個人テント（2人用）本体 | required |
| 46 | 個人テント（2人用）フライ | required |
| 47 | 個人テント（2人用）ポール | required |
| 48 | 個人テント（2人用）マット×2 | optional |
| 49 | ツエルト2 | recommended |
| 50 | コッヘルセット | required |
| 51 | 調理器具 | required |
| 52 | ポンプ | optional |
| 53 | ガスセット | required |
| 54 | コンロセット+ガス | required |
| 55 | ガス（予備）2個 | recommended |
| 56 | ベニヤ板 | optional |
| 57 | プラティパス2L | recommended |
| 58 | ブラシ | optional |
| 59 | ハイキングレスキューセット | required |

---

## 4. Server Actions 設計

### 4.1 ファイル構成

```
src/app/(apps)/yamanokai/_actions/
  └── yamanokai-checklist-actions.ts   // 装備表関連のServer Actions
```

### 4.2 装備表品目マスター CRUD

#### `getChecklistItems` (Read)

```typescript
// 装備表品目の一覧取得
const getChecklistItems = async (params?: {
  where?: {
    category?: string       // "personal" | "shared"
    isDeleted?: boolean
  }
  orderBy?: { sortOrder?: 'asc' | 'desc' }
}) => Promise<YamanokaiChecklistItem[]>
```

**デフォルト条件:**
- `isDeleted: false`
- `orderBy: { sortOrder: 'asc' }`

#### `upsertChecklistItem` (Create / Update)

```typescript
// 装備表品目の作成・更新
const upsertChecklistItem = async (data: {
  id?: number               // 指定時はupdate、未指定時はcreate
  name: string
  category: string          // "personal" | "shared"
  defaultRequirementLevel: string  // "required" | "recommended" | "optional"
  sortOrder: number
}) => Promise<YamanokaiChecklistItem>
```

**バリデーション:**
- `name`: 必須、200文字以内
- `category`: `personal` | `shared` のいずれか
- `defaultRequirementLevel`: `required` | `recommended` | `optional` のいずれか

#### `deleteChecklistItem` (Delete: ソフトデリート)

```typescript
// 装備表品目のソフトデリート
const deleteChecklistItem = async (id: number) => Promise<void>
```

**動作:** `isDeleted: true` に更新

### 4.3 例会装備表設定 CRUD

#### `getEventChecklistItems` (Read)

```typescript
// 例会の装備表設定を取得
const getEventChecklistItems = async (params: {
  where: {
    yamanokaiEventId: number
  }
  include?: {
    YamanokaiChecklistItem?: boolean  // 品目マスターの情報をjoin
  }
}) => Promise<YamanokaiEventChecklistItem[]>
```

#### `setEventChecklist` (一括設定: Delete & Create)

```typescript
// 例会の装備表を一括設定（既存設定を全削除→新規作成）
const setEventChecklist = async (
  eventId: number,
  items: Array<{
    checklistItemId: number
    requirementLevel: string  // "required" | "recommended" | "optional"
  }>
) => Promise<void>
```

**動作:**
1. `yamanokaiEventId = eventId` の既存レコードを全削除（物理削除）
2. `items` 配列の内容で新規レコードを一括作成（`createMany`）

**バリデーション:**
- `eventId` が存在する例会であること
- `items[].checklistItemId` が存在する品目であること
- `items[].requirementLevel` が有効な値であること

---

## 5. 画面仕様

### 5.1 画面一覧

| # | 画面名 | URL（案） | 権限 | 説明 |
|---|-------|----------|------|------|
| 1 | 装備表品目マスタ管理 | `/yamanokai/admin/checklist` | 管理者 | 品目の一覧表示・登録・編集・削除 |
| 2 | 例会装備表設定 | 例会詳細画面内タブ | 管理者/CL | 例会ごとの装備表品目選択・必要度設定 |
| 3 | 例会装備表閲覧 | 例会詳細画面内タブ | 全会員 | 設定された装備表の閲覧（読み取り専用） |

### 5.2 装備表品目マスタ管理画面

**アクセス権限:** 管理者のみ

**レイアウト:**
```
┌──────────────────────────────────────────┐
│ 装備表品目マスタ管理                        │
├──────────────────────────────────────────┤
│ [品目一覧] [新規登録]  ← タブナビゲーション  │
├──────────────────────────────────────────┤
│                                          │
│ カテゴリフィルター:                        │
│ [すべて] [🎒 個人装備] [🏕️ 共同装備]       │
│                                          │
│ ┌────┬──────────┬────────┬─────┬────┐   │
│ │ ID │ 品名     │ カテゴリ │必要度│操作│   │
│ ├────┼──────────┼────────┼─────┼────┤   │
│ │ 1  │ ザック   │🎒個人  │ ○  │ 編集│   │
│ │ 2  │ 登山靴   │🎒個人  │ ○  │ 削除│   │
│ │ ...│ ...      │ ...    │ ... │ ...│   │
│ └────┴──────────┴────────┴─────┴────┘   │
└──────────────────────────────────────────┘
```

**機能:**
- カテゴリフィルター: すべて / 個人装備 / 共同装備
- 品目テーブル: ID、品名、カテゴリ、デフォルト必要度、操作（編集・削除）
- 新規登録タブ: フォーム入力（品名、カテゴリ、デフォルト必要度、ソート順）
- 編集: モーダルでフォーム表示
- 削除: 確認ダイアログ後ソフトデリート

### 5.3 例会装備表設定画面（管理者向けタブ）

**場所:** 例会詳細モーダル → 「装備表」タブ
**アクセス権限:** 管理者 / CL

**レイアウト:**
```
┌──────────────────────────────────────────┐
│ [基本情報] [装備表]  ← タブナビゲーション   │
├──────────────────────────────────────────┤
│ 装備表設定                    [保存]       │
│                                          │
│ 🎒 個人装備                               │
│ ┌────┬──────────┬──────────────┐         │
│ │選択│ 品名     │ 必要度        │         │
│ ├────┼──────────┼──────────────┤         │
│ │ ☑ │ ザック   │ [○ 必須 ▼]   │         │
│ │ ☑ │ 登山靴   │ [○ 必須 ▼]   │         │
│ │ ☐ │ 傘      │ -            │         │
│ │ ☑ │ ヘッドランプ│ [△ 推奨 ▼] │         │
│ │ ...│ ...      │ ...          │         │
│ └────┴──────────┴──────────────┘         │
│                                          │
│ 🏕️ 共同装備                               │
│ ┌────┬──────────┬──────────────┐         │
│ │選択│ 品名     │ 必要度        │         │
│ ├────┼──────────┼──────────────┤         │
│ │ ☑ │ コッヘル │ [○ 必須 ▼]   │         │
│ │ ...│ ...      │ ...          │         │
│ └────┴──────────┴──────────────┘         │
│                                  [保存]   │
└──────────────────────────────────────────┘
```

**機能:**
- 品目マスターの全品目をカテゴリ別に表示
- チェックボックスで品目を選択/解除
- 選択済み品目の必要度レベルをセレクトボックスで変更
- 未選択品目の必要度セルは「-」表示
- 保存ボタンで `setEventChecklist` を実行

**操作フロー:**
1. 品目マスターの全品目が個人装備・共同装備に分かれて表示される
2. チェックボックスで必要な品目を選択する
3. 選択した品目の必要度レベルを設定する（デフォルトは品目マスターの値）
4. 「保存」ボタンで設定を保存する

### 5.4 例会装備表閲覧画面（一般会員向けタブ）

**場所:** 例会詳細モーダル → 「装備表」タブ
**アクセス権限:** 全会員

**レイアウト:**
```
┌──────────────────────────────────────────┐
│ [基本情報] [装備表]  ← タブナビゲーション   │
├──────────────────────────────────────────┤
│                                          │
│ 🎒 個人装備                               │
│ ┌──────┬──────────┐                      │
│ │必要度│ 品名     │                      │
│ ├──────┼──────────┤                      │
│ │  ○  │ ザック   │                      │
│ │  ○  │ 登山靴   │                      │
│ │  △  │ ヘッドランプ│                    │
│ │ ...  │ ...      │                      │
│ └──────┴──────────┘                      │
│                                          │
│ 🏕️ 共同装備                               │
│ ┌──────┬──────────┐                      │
│ │必要度│ 品名     │                      │
│ ├──────┼──────────┤                      │
│ │  ○  │ コッヘル │                      │
│ │ ...  │ ...      │                      │
│ └──────┴──────────┘                      │
│                                          │
└──────────────────────────────────────────┘
```

**機能:**
- 例会に設定された装備品目のみ表示（設定されていない品目は非表示）
- 個人装備・共同装備を分けて表示
- 必要度レベルを色分けバッジで表示（○赤、△黄、空欄グレー）
- 装備表が未設定の場合は「この例会の装備表は未設定です」と表示
- 読み取り専用（編集不可）

---

## 6. コンポーネント設計

### 6.1 ファイル構成

```
src/app/(apps)/yamanokai/
├── (pages)/
│   └── admin/
│       └── checklist/
│           └── page.tsx              // 装備表品目マスタ管理ページ（RSC）
├── components/
│   ├── ChecklistItemTable.tsx        // 品目一覧テーブル（カテゴリフィルター付き）
│   ├── ChecklistItemForm.tsx         // 品目登録・編集フォーム
│   ├── EventChecklistEditor.tsx      // 例会装備表編集（Excel風テーブル）
│   └── EventChecklistView.tsx        // 例会装備表閲覧（読み取り専用）
├── _actions/
│   └── yamanokai-checklist-actions.ts
└── types/
    └── checklist.ts                  // 装備表関連の型定義
```

### 6.2 コンポーネント一覧

#### ChecklistItemTable（品目一覧テーブル）

| Props | 型 | 説明 |
|-------|---|------|
| `checklistItems` | `YamanokaiChecklistItem[]` | 品目一覧 |
| `onEdit` | `(item) => void` | 編集ボタン押下時 |
| `onDelete` | `(id: number) => void` | 削除ボタン押下時 |

**状態:**
- `categoryFilter`: `'all'` | `'personal'` | `'shared'`

#### ChecklistItemForm（品目フォーム）

| Props | 型 | 説明 |
|-------|---|------|
| `initialData?` | `YamanokaiChecklistItem` | 編集時の初期データ |
| `onSubmit` | `(data) => void` | 保存時 |

**フィールド:**
- `name` (text, 必須): 品名
- `category` (select, 必須): カテゴリ
- `defaultRequirementLevel` (select, 必須): デフォルト必要度
- `sortOrder` (number): ソート順

#### EventChecklistEditor（例会装備表編集）

| Props | 型 | 説明 |
|-------|---|------|
| `eventId` | `number` | 対象例会ID |
| `checklistItems` | `YamanokaiChecklistItem[]` | 品目マスター全件 |
| `eventChecklistItems` | `YamanokaiEventChecklistItem[]` | 現在の設定 |
| `onSave` | `(items: Array<{checklistItemId, requirementLevel}>) => void` | 保存時 |

**状態:**
- `selectedItems`: `Map<number, string>` — checklistItemId → requirementLevel のマップ

#### EventChecklistView（例会装備表閲覧）

| Props | 型 | 説明 |
|-------|---|------|
| `eventId` | `number` | 対象例会ID |
| `checklistItems` | `YamanokaiChecklistItem[]` | 品目マスター全件 |
| `eventChecklistItems` | `YamanokaiEventChecklistItem[]` | 現在の設定 |

**表示ロジック:**
- `eventChecklistItems` が空の場合: 「この例会の装備表は未設定です」
- 設定済みの場合: 個人装備テーブル + 共同装備テーブル

---

## 7. 権限設計

### 7.1 権限マトリクス

| 操作 | 三役 | 事務局 | 専門部長 | CL | SL | 一般会員 |
|------|------|-------|---------|----|----|---------|
| 品目マスター閲覧 | ○ | ○ | ○ | - | - | - |
| 品目マスター登録 | ○ | ○ | - | - | - | - |
| 品目マスター編集 | ○ | ○ | - | - | - | - |
| 品目マスター削除 | ○ | ○ | - | - | - | - |
| 例会装備表設定 | ○ | ○ | ○ | ○（自分の例会のみ） | - | - |
| 例会装備表閲覧 | ○ | ○ | ○ | ○ | ○ | ○ |

### 7.2 アクセス制御

- **品目マスター管理ページ**: `isAdmin === true` で表示
- **例会装備表設定タブ**: 管理者 or 該当例会のCL
- **例会装備表閲覧タブ**: 全会員（公開済み例会のみ）

---

## 8. 実装手順

### Step 1: Prismaスキーマ追加

1. `prisma/schema/yamanokai.prisma` に `YamanokaiChecklistItem`, `YamanokaiEventChecklistItem` モデルを追加
2. `YamanokaiEvent` モデルに `YamanokaiEventChecklistItem` リレーションを追加
3. `prisma db push` + `prisma generate` でスキーマ反映

### Step 2: 型定義

```typescript
// src/app/(apps)/yamanokai/types/checklist.ts
import type {
  YamanokaiChecklistItem,
  YamanokaiEventChecklistItem,
} from '@prisma/generated/prisma/client'

// 品目マスター + 例会設定を結合した型
export type ChecklistItemWithEventSetting = YamanokaiChecklistItem & {
  YamanokaiEventChecklistItem?: YamanokaiEventChecklistItem[]
}

// 例会装備表設定の入力型
export type EventChecklistInput = {
  checklistItemId: number
  requirementLevel: 'required' | 'recommended' | 'optional'
}

// カテゴリ定数
export const CHECKLIST_CATEGORIES = {
  personal: {id: 'personal', name: '個人装備'},
  shared: {id: 'shared', name: '共同装備'},
} as const

// 必要度レベル定数
export const REQUIREMENT_LEVELS = {
  required: {id: 'required', label: '○', name: '必須'},
  recommended: {id: 'recommended', label: '△', name: '推奨'},
  optional: {id: 'optional', label: '', name: '任意'},
} as const
```

### Step 3: Server Actions 実装

`yamanokai-checklist-actions.ts` にCRUD関数を実装（セクション4参照）

### Step 4: シードデータ投入

`npm run seedYamanokai` で初期データ（個人装備40件 + 共同装備19件）を投入

### Step 5: 品目マスタ管理ページ

1. `(pages)/admin/checklist/page.tsx` RSCページ作成
2. `ChecklistItemTable`, `ChecklistItemForm` コンポーネント作成
3. データ取得 → Client Component にprops渡し

### Step 6: 例会詳細への装備表タブ追加

1. 管理者用例会詳細モーダルに「装備表」タブ追加
2. `EventChecklistEditor` コンポーネントを表示
3. 一般会員用例会詳細モーダルに「装備表」タブ追加
4. `EventChecklistView` コンポーネントを表示

---

## 9. モックとの対応表

| モック（_constants.js） | Prismaモデル | DBテーブル |
|----------------------|-------------|-----------|
| `CHECKLIST_CATEGORIES` | - | 定数（コード内定義） |
| `REQUIREMENT_LEVELS` | - | 定数（コード内定義） |
| `INITIAL_EQUIPMENT_CHECKLIST_ITEMS` | `YamanokaiChecklistItem` | `yamanokai_checklist_items` |
| `INITIAL_EVENT_EQUIPMENT_ITEMS` | `YamanokaiEventChecklistItem` | `yamanokai_event_checklist_items` |

| モック（コンポーネント） | 本番コンポーネント |
|---------------------|--------------------|
| `AdminEquipmentChecklistManagement` | `(pages)/admin/checklist/page.tsx` + `ChecklistItemTable` + `ChecklistItemForm` |
| `AdminEquipmentChecklistList` | `ChecklistItemTable` |
| `AdminEquipmentChecklistForm` | `ChecklistItemForm` |
| `EventEquipmentChecklistEditor` | `EventChecklistEditor` |
| `EventEquipmentChecklistView` | `EventChecklistView` |

| モック（ハンドラー） | Server Action |
|-------------------|--------------|
| `handleCreateChecklistItem` | `upsertChecklistItem` (create) |
| `handleUpdateChecklistItem` | `upsertChecklistItem` (update) |
| `handleDeleteChecklistItem` | `deleteChecklistItem` |
| `handleSetEventEquipment` | `setEventChecklist` |

---

## 10. 将来拡張（フェーズ2以降）

| 機能 | 説明 | 優先度 |
|------|------|-------|
| 印刷用CSS | 装備表をA4用紙に印刷できるレイアウト | 中 |
| 装備表テンプレート | よく使う装備セットをテンプレート化し、例会設定時に一括適用 | 中 |
| 個人チェック機能 | 会員が自分の持参状況をチェックして記録できる | 低 |
| 装備表コピー機能 | 過去の例会の装備表設定を別の例会にコピー | 中 |
| 品目グループ | 品目をさらに細かいグループに分類（衣類、食料、テント周りなど） | 低 |
