# テニスアプリ 設計書（開発者向け）

## 概要

テニスサークル向けのスケジュール管理・出欠管理アプリ。
LINE連携による通知機能を備え、メンバー間の予定共有と出欠確認をスムーズに行う。

- **URL**: `/tennis`
- **認証**: LINE OAuth（NextAuth）
- **通知**: LINE Messaging API（プッシュ通知）

---

## ディレクトリ構成

```
src/app/(apps)/tennis/
├── page.tsx                          # エントリーポイント（Server Component）
├── login/
│   └── page.tsx                      # LINEログインページ
├── notify-test/
│   ├── page.tsx                      # 通知テストページ（Server Component）
│   └── NotifyTestClient.tsx          # 通知テストUI
├── _actions/
│   ├── event-actions.ts              # イベントCRUD
│   ├── attendance-actions.ts         # 出欠CRUD
│   ├── court-actions.ts              # コートCRUD
│   ├── member-actions.ts             # メンバー取得
│   └── line-notify-actions.ts        # LINE通知
├── components/
│   ├── TennisApp.tsx                 # メインコンテナ（状態管理の中心）
│   ├── HomeTab.tsx                   # ホームタブ（リスト/カレンダー切替）
│   ├── CalendarView.tsx              # カレンダー表示
│   ├── EventCard.tsx                 # イベントカード（リスト表示）
│   ├── EventDetailModal.tsx          # イベント詳細モーダル
│   ├── EventFormModal.tsx            # イベント作成/編集フォーム
│   ├── AttendanceButtons.tsx         # 出欠ボタン（○△×）
│   ├── CourtsTab.tsx                 # コート管理タブ
│   ├── CourtFormModal.tsx            # コート作成/編集フォーム
│   ├── CourtMultiSelect.tsx          # コート複数選択（イベントフォーム内）
│   ├── CourtNumberEditor.tsx         # コート番号エディタ（コートフォーム内）
│   └── UserAvatar.tsx                # ユーザーアバター表示
└── lib/
    ├── types.ts                      # 型定義
    ├── constants.ts                  # 定数
    └── auth.ts                       # Server Action用認証ヘルパー
```

---

## データベース設計

### スキーマファイル

`prisma/schema/tennis.prisma`

### ER図（テキスト表現）

```
User（共通）
  ├──< TennisEvent        (Creator: 1対多)
  └──< TennisAttendance   (User: 1対多)

TennisCourt
  └──< TennisEventCourt   (1対多)

TennisEvent
  ├──< TennisEventCourt   (1対多, CASCADE)
  └──< TennisAttendance   (1対多, CASCADE)
```

### テーブル定義

#### `tennis_courts`（TennisCourt）

| カラム | 型 | 説明 |
|---|---|---|
| id | Int (PK) | 自動採番 |
| name | VarChar(200) | コート名 |
| address | Text? | 住所 |
| googleMapsUrl | Text? | Google Maps URL |
| courtNumbers | String[] | コート番号リスト（例: `["南1","南2","北11"]`） |
| sortOrder | Float | 表示順（デフォルト0） |
| isDeleted | Boolean | 論理削除フラグ |

#### `tennis_events`（TennisEvent）

| カラム | 型 | 説明 |
|---|---|---|
| id | Int (PK) | 自動採番 |
| title | VarChar(200) | タイトル（デフォルト: 「練習」） |
| date | DateTime | 開催日（**UTC保存**） |
| startTime | VarChar(5) | 開始時刻（`"07:00"`形式） |
| endTime | VarChar(5) | 終了時刻（`"09:00"`形式） |
| memo | Text? | メモ |
| creatorId | Int (FK→User) | 作成者 |
| isDeleted | Boolean | 論理削除フラグ |

#### `tennis_event_courts`（TennisEventCourt）

| カラム | 型 | 説明 |
|---|---|---|
| id | Int (PK) | 自動採番 |
| tennisEventId | Int (FK) | 紐づくイベント |
| tennisCourtId | Int (FK) | 紐づくコート |
| courtNumber | VarChar(50) | コート番号（例: `"南1"`） |
| status | VarChar(20) | `"planned"` or `"reserved"` |

- ユニーク制約: `(tennisEventId, tennisCourtId, courtNumber)`

#### `tennis_attendances`（TennisAttendance）

| カラム | 型 | 説明 |
|---|---|---|
| id | Int (PK) | 自動採番 |
| tennisEventId | Int (FK) | 紐づくイベント |
| userId | Int (FK→User) | 回答ユーザー |
| status | VarChar(10) | `"yes"` / `"maybe"` / `"no"` |
| comment | Text? | 一言コメント |

- ユニーク制約: `(tennisEventId, userId)`

---

## 認証フロー

### ログイン

1. `/tennis` アクセス → セッション未認証 → `/tennis/login` にリダイレクト
2. LINEログインボタン → NextAuth `signIn('line')` → LINE OAuth
3. 認証成功 → `User` レコード作成/更新（`lineUserId` 保存） → `/tennis` にリダイレクト

### Server Action認証

`lib/auth.ts` の `requireAuth()` を全Server Actionの先頭で呼び出す。
未認証時は例外をスロー。`userId` を返却。

```typescript
export async function requireAuth() {
  const data = await getServerSession(authOptions)
  if (!user?.id) throw new Error('認証が必要です')
  return { userId: user.id as number }
}
```

### メンバー判定

`getTennisMembers()` は `active: true` かつ `lineUserId` が設定済みのユーザーを返す。
→ LINEログイン済み = テニスアプリのメンバーとして扱う。

---

## Server Actions

### event-actions.ts（イベント管理）

| 関数 | 引数 | 説明 |
|---|---|---|
| `getEventsByRange(from, to)` | `from: string, to: string`（YYYY-MM-DD） | 期間内のイベント一覧取得。リレーション全含む |
| `getEventById(id)` | `id: number` | イベント単体取得 |
| `createEvent(data, creatorId)` | `EventFormData, number` | イベント作成。作成者を自動で「参加」に設定 |
| `updateEvent(id, data)` | `number, EventFormData` | イベント更新。**作成者のみ**可能。EventCourtは洗い替え |
| `deleteEvent(id)` | `number` | 論理削除。**作成者のみ**可能 |

**共通includeパターン**（`EVENT_INCLUDE`）:
```typescript
{
  Creator: { select: { id, name, avatar } },
  TennisEventCourt: { include: { TennisCourt: true } },
  TennisAttendance: { include: { User: { select: { id, name, avatar } } } },
}
```

### attendance-actions.ts（出欠管理）

| 関数 | 引数 | 説明 |
|---|---|---|
| `upsertAttendance(eventId, userId, status)` | イベントID, ユーザーID, ステータス | 出欠を登録/更新（upsert） |
| `updateAttendanceComment(eventId, userId, comment)` | イベントID, ユーザーID, コメント | コメント更新 |
| `removeAttendance(eventId, userId)` | イベントID, ユーザーID | 出欠を取り消し（レコード削除） |

### court-actions.ts（コート管理）

| 関数 | 引数 | 説明 |
|---|---|---|
| `getCourts()` | なし | 全コート取得（sortOrder昇順、論理削除除外） |
| `createCourt(data)` | `CourtFormData` | コート登録 |
| `updateCourt(id, data)` | `number, CourtFormData` | コート更新 |
| `deleteCourt(id)` | `number` | コート論理削除 |
| `seedCourts()` | なし | サンプルデータ投入（県営コート、ハチヤ） |

### member-actions.ts（メンバー取得）

| 関数 | 引数 | 説明 |
|---|---|---|
| `getTennisMembers()` | なし | `active && lineUserId != null` のユーザーを取得 |

### line-notify-actions.ts（LINE通知）

| 関数 | 用途 | トリガー |
|---|---|---|
| `notifyAttendanceChange(eventId, userId, status)` | 出欠変更を出席者全員に通知 | 出欠操作時（設定OFF時は無効） |
| `notifyEventCreated(eventId)` | 新規予定をLINEグループに通知 | イベント作成時 |
| `sendReminder3Days()` | 3日前リマインド | Cronジョブ（毎日20:00 JST） |
| `sendReminderNextDay()` | 前日通知 | Cronジョブ（毎日20:00 JST） |
| `sendTestNotify(userId)` | テスト通知 | 通知テストページ |
| `previewReminder3Days()` | 3日前リマインドプレビュー | 通知テストページ |
| `previewReminderNextDay()` | 前日通知プレビュー | 通知テストページ |

---

## コンポーネント設計

### TennisApp.tsx（メインコンテナ）

アプリ全体の状態管理を担うクライアントコンポーネント。

**管理する状態**:

| state | 型 | 説明 |
|---|---|---|
| `events` | `TennisEventWithRelations[]` | イベント一覧（SSRで初期化、操作時に楽観的更新） |
| `courts` | `TennisCourtWithRelations[]` | コート一覧 |
| `activeTab` | `'home' \| 'courts'` | アクティブタブ |
| `dateFrom` / `dateTo` | `string` | 表示期間フィルター |
| `calendarDate` | `Date` | カレンダーの表示月 |

**モーダル管理**:
- `eventDetailModal` — イベント詳細表示
- `createEventModal` — イベント作成
- `editEventModal` — イベント編集
- `confirmAttendanceModal` — 出欠確認
- `confirmDeleteModal` — 削除確認

**データフロー**:
1. `page.tsx`（Server Component）で初期データ取得 → `TennisApp` にpropsで渡す
2. ユーザー操作 → Server Action呼び出し → `setEvents()` で楽観的更新 or `fetchEvents()` で再取得
3. 出欠変更時はユーザー操作 → 確認モーダル表示 → 確定後にServer Action実行

### HomeTab.tsx

**ビューモード**: `list`（リスト表示）/ `calendar`（カレンダー表示）を切替

- **リスト表示**: 今日以降のイベントを日付昇順で `EventCard` として表示
- **カレンダー表示**: `CalendarView` で月表示。日付タップで `dateEventsModal` を開く

### EventCard.tsx

イベントカードの表示ロジック:

| 条件 | カード色 | 意味 |
|---|---|---|
| コート未設定 | 赤背景 `bg-red-50` | 会場未定 |
| コートあり・一部未予約 | 黄背景 `bg-yellow-50` | 予約進行中 |
| 全コート予約済 | 青背景 `bg-blue-50` | 確定済み |

### EventFormModal.tsx

**初期値**:
- タイトル: `'練習'`
- 開始時間: `'07:00'`
- 終了時間: `'09:00'`

`initialData` がnullの場合は初期値を使用、値がある場合は編集データで上書き。

### CalendarView.tsx

- 月ごとのカレンダーグリッド表示
- 各日付に自分の出欠状況を記号（○△×?）で表示
- 日付タップでその日のイベント一覧モーダルを表示

### AttendanceButtons.tsx

出欠ボタンコンポーネント。2つの表示モード:

- **通常モード**: `○ 参加` `△ 未定` `× 不参加` のフルラベル
- **compactモード**: `○` `△` `×` の記号のみ（カード内で使用）

同じステータスを再度押すと**取り消し**動作となる。

---

## 型定義（lib/types.ts）

### ステータス型

```typescript
type AttendanceStatus = 'yes' | 'maybe' | 'no'     // 出欠
type CourtStatus = 'planned' | 'reserved'            // コート予約状況
```

### 表示マッピング

```typescript
ATTENDANCE_DISPLAY = { yes: '○', maybe: '△', no: '×' }
COURT_STATUS_DISPLAY = { planned: '予定', reserved: '予約済み' }
```

### リレーション含む型

| 型 | 説明 |
|---|---|
| `TennisEventWithRelations` | Event + EventCourt（+Court） + Attendance（+User） + Creator |
| `TennisEventCourtWithRelations` | EventCourt + Court |
| `TennisAttendanceWithUser` | Attendance + User（id, name, avatar） |

### フォームデータ型

| 型 | 用途 |
|---|---|
| `EventFormData` | イベント作成/編集フォーム |
| `EventCourtInput` | コート選択入力（courtId, courtNumber, status） |
| `CourtFormData` | コート作成/編集フォーム |
| `TennisMember` | メンバー表示用（id, name, avatar） |

---

## LINE通知設計

### 環境変数

| 変数 | 用途 |
|---|---|
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging APIのアクセストークン |
| `LINE_CHANNEL_SECRET` | Webhook署名検証用シークレット |
| `LINE_GROUP_ID` | 通知送信先LINEグループID |
| `NEXT_PUBLIC_ALLOW_LINE_LOGIN` | LINEログイン有効化フラグ |

### 通知設定（constants.ts `LINE_NOTIFY_CONFIG`）

| 設定 | デフォルト | 説明 |
|---|---|---|
| `ATTENDANCE_CHANGE` | `false` | 出欠変更時に出席者全員に通知 |
| `EVENT_CREATE` | `true` | 新規予定作成時にLINEグループに通知 |
| `REMINDER_3DAYS` | `true` | 3日前リマインド（未定/未回答者へ） |
| `REMINDER_1DAY` | `true` | 前日通知（参加者へ予定詳細） |

### 通知フロー

```
[出欠変更]
  ユーザー操作 → upsertAttendance → notifyAttendanceChange
                                     ├→ 自分に確認通知
                                     └→ 出席者全員に変更通知

[イベント作成]
  ユーザー操作 → createEvent → notifyEventCreated
                               └→ LINEグループにプッシュ通知

[Cronジョブ]（毎日20:00 JST）
  ├→ sendReminder3Days → 3日後の予定の未定/未回答者に通知
  └→ sendReminderNextDay → 翌日の予定の参加者に詳細通知
```

### LINE Webhookエンドポイント

`/api/line-webhook`（POST）

- LINE platformからのWebhookを受信
- 署名検証（`LINE_CHANNEL_SECRET` 設定時）
- グループIDをコンソールログに出力（初回セットアップ用）
- 常に200を返却

---

## 画面構成

### `/tennis/login` — ログインページ

- LINEログインボタン
- `NEXT_PUBLIC_ALLOW_LINE_LOGIN` がfalseの場合はボタン無効化

### `/tennis` — メインページ

```
┌──────────────────────────┐
│ [Tennis]     [ホーム][コート] │  ← ヘッダー（タブ切替）
│ [Avatar] 名前   [通知][ログアウト]│  ← ユーザー情報バー
│ 期間 [from] 〜 [to]          │  ← 期間フィルター（ホームタブ時のみ）
├──────────────────────────┤
│                              │
│  [リスト] [カレンダー]           │  ← サブタブ（ホームタブ内）
│                              │
│  ┌─ EventCard ──────────┐  │
│  │ タイトル     ○2 △1 ×0 │  │
│  │ 3/15(土) 07:00〜09:00  │  │
│  │ 県営コート 南1番        │  │
│  │ [○] [△] [×]           │  │  ← 出欠ボタン（compact）
│  └──────────────────────┘  │
│                              │
│                        [＋]  │  ← FAB（イベント作成）
└──────────────────────────┘
```

### `/tennis/notify-test` — 通知テストページ

- LINE公式アカウント友だち追加案内
- 通知設定ON/OFF状況表示
- テスト通知送信ボタン
- Cronジョブ手動実行（プレビュー + 送信）
- 実行ログ表示

---

## 権限モデル

| 操作 | 権限 |
|---|---|
| イベント作成 | ログイン済みユーザー |
| イベント編集/削除 | **作成者のみ** (`creatorId === userId`) |
| 出欠回答 | ログイン済みユーザー |
| コート管理 | ログイン済みユーザー |
| 通知テスト | ログイン済みユーザー |

---

## 初期データ取得（SSR）

`page.tsx` で以下を並列取得:

```typescript
const [courts, events, members] = await Promise.all([
  getCourts(),
  getEventsByRange(initialFrom, initialTo),  // 当日〜2ヶ月先
  getTennisMembers(),
])
```

→ `TennisApp` コンポーネントにpropsで渡し、クライアント側で `useState` で保持。

---

## 日付処理

- **DB保存**: UTC（`toUtc()` で変換後に保存）
- **表示**: `formatDate()` でJST表示
- **初期表示期間**: 当日〜2ヶ月先
- **時刻**: `startTime` / `endTime` は文字列（`"07:00"` 形式）でDB保存

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Next.js（App Router） |
| 認証 | NextAuth（LINE OAuth） |
| DB/ORM | Prisma（PostgreSQL） |
| UI | Tailwind CSS, lucide-react |
| モーダル | `useModal`（共通フック） |
| 通知 | LINE Messaging API（Push） |
| 日付 | `Days` クラス（`@cm/class/Days`） |
