# 営業所設定ページ仕様書

## 目次

1. [ユーザー目線の機能一覧](#1-ユーザー目線の機能一覧)
2. [設計者目線の詳細仕様](#2-設計者目線の詳細仕様)
3. [テーブル定義書](#3-テーブル定義書)

---

## 1. ユーザー目線の機能一覧

### 概要

営業所設定ページでは、運送業務に必要な各種マスターデータの登録・編集・管理を行います。

### アクセス方法

| 方法           | 詳細                                                           |
| -------------- | -------------------------------------------------------------- |
| URL            | `/tbm/eigyoshoSettei`                                          |
| ナビゲーション | 画面上部メニュー → **「営業所メニュー」** → **「営業所設定」** |
| 対象ユーザー   | 事務員（isJimuin）、所長（isShocho）、システム管理者           |

> 💡 ナビゲーションには「⚙️ 営業所設定」アイコン付きで表示されます

---

### 機能一覧

#### 1.1 便設定【月別】タブ

運送便（路線）の設定を管理します。

| 機能               | 説明                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| 便一覧の表示       | 登録済みの便を一覧表示。便コード順/出発時間順/荷主コード順でソート可能 |
| 便の新規登録       | 便コード、便名、路線名、出発時刻、取引先などを登録                     |
| 便の編集           | 既存便の情報を編集                                                     |
| 前月データ引き継ぎ | 前月の便設定（請求回数、通行料等）を当月にコピー                       |
| 便の共有設定       | 他営業所との便共有を設定                                               |
| 委託パターン設定   | 年間の稼働日/休日を曜日単位で一括設定可能                              |
| 付帯作業/運賃設定  | 便ごとの運賃・付帯費用を時期別に管理                                   |

**便の登録項目**

| 項目名         | 入力形式 | 必須 | 特記事項                                                                      |
| -------------- | -------- | ---- | ----------------------------------------------------------------------------- |
| 便コード（CD） | テキスト | -    | 営業所内でユニーク。検索可能                                                  |
| 服務番号       | テキスト | -    | 検索可能                                                                      |
| 営業所         | セレクト | ✓    | ログイン中の営業所で自動固定                                                  |
| 区分           | セレクト | ✓    | 既定（地域内/地域間）、臨時、増設、航空、一般、リネン、折り込み、LPG、その他  |
| 便名           | テキスト | ✓    | 検索可能                                                                      |
| 路線名         | テキスト | -    | 検索可能                                                                      |
| 出発時刻       | テキスト | -    | **4桁数字形式（例: 0800）**。24時間超（例: 2530）にも対応。バリデーションあり |
| 最終到着時刻   | テキスト | -    | 同上                                                                          |
| 重複許可       | チェック | -    | ONの場合、同一ドライバーが複数便に同日割当可能                                |
| 車種           | テキスト | -    |                                                                               |
| 品名           | テキスト | -    |                                                                               |
| 取引先         | セレクト | -    | 荷主マスタから選択。**請求書発行に必須**                                      |

**⚠️ 注意: 出発時刻のフォーマット**

- 入力: 4桁数字（コロンなし）例: `0800`, `1530`, `2530`（翌日1:30）
- 表示: HH:MM形式に自動変換（24時間超は「翌05:30」のように表示）
- 48時まで入力可能

**他機能との関連**

| 関連機能       | 影響内容                                                                             |
| -------------- | ------------------------------------------------------------------------------------ |
| **配車設定**   | 便一覧として表示され、ドライバー・車両を割り当てる単位となる                         |
| **請求書発行** | 取引先（荷主）ごとに便の運行実績を集計して請求書を生成。取引先未設定の便は請求対象外 |
| **運行明細**   | 便ごとの運行実績一覧を出力                                                           |
| **給与算定**   | 運賃（TbmRouteGroupFee）を元に乗務員給与を算出                                       |
| **運行回数**   | 区分（seikyuKbn）ごとの運行回数を集計                                                |

---

#### 1.2 車両マスタタブ

保有車両の情報を管理します。

| 機能             | 説明                                    |
| ---------------- | --------------------------------------- |
| 車両一覧の表示   | 車両番号順で一覧表示                    |
| 車両の新規登録   | 車両情報、保険情報、ETCカード情報を登録 |
| 車両の編集       | 既存車両の情報を編集                    |
| 整備履歴の管理   | 車両ごとの整備記録を登録・閲覧          |
| 燃料カードの管理 | 車両に紐づく燃料カード情報を管理        |
| 洗車履歴の管理   | 洗車日と料金を記録                      |
| 給油履歴の確認   | 給油記録を閲覧                          |
| ETC利用明細連携  | ETC利用データとの連携状況を確認         |

**車両の登録項目**

| 項目名                | 入力形式      | 必須 | 特記事項                         |
| --------------------- | ------------- | ---- | -------------------------------- |
| フレームNo            | テキスト      | -    | システム全体でユニーク。検索可能 |
| 営業所                | セレクト      | ✓    |                                  |
| 車両番号              | テキスト      | ✓    | 営業所内でユニーク。検索可能     |
| 初度登録日            | 日付          | -    |                                  |
| 車種                  | テキスト      | -    | 検索可能                         |
| 車名                  | テキスト      | -    | 検索可能                         |
| 形状                  | テキスト      | -    |                                  |
| エアサス有無          | テキスト      | -    |                                  |
| 油脂/タイヤ/備品代    | テキスト      | -    | **給与算定で費用計算に使用**     |
| 整備代                | テキスト      | -    | **給与算定で費用計算に使用**     |
| 保険代                | テキスト      | -    | **給与算定で費用計算に使用**     |
| 車検満了日            | 日付          | -    |                                  |
| 自賠責保険会社/満了日 | テキスト/日付 | -    |                                  |
| 自動車保険会社/満了日 | テキスト/日付 | -    |                                  |
| 貨物保険会社/満了日   | テキスト/日付 | -    |                                  |
| 車両保険会社/満了日   | テキスト/日付 | -    |                                  |
| ETCカード番号         | テキスト      | -    |                                  |
| ETCカード有効期限     | 日付          | -    |                                  |

**他機能との関連**

| 関連機能         | 影響内容                                                     |
| ---------------- | ------------------------------------------------------------ |
| **配車設定**     | 便に車両を割り当てる際の選択肢となる                         |
| **燃費管理**     | 車両ごとの給油履歴・走行距離から燃費を自動計算               |
| **累積距離記帳** | 車両ごとのオドメーター入力データを集計                       |
| **給与算定**     | 車両の維持費（整備代、保険代、油脂代）が費用計算に使用される |
| **ETC連携**      | 車両に紐づくETC利用明細をインポート・管理                    |

---

#### 1.3 ドライバーマスタタブ

運転手（ドライバー）の情報を管理します。

| 機能                 | 説明                       |
| -------------------- | -------------------------- |
| ドライバー一覧の表示 | 社員コード順で一覧表示     |
| ドライバーの新規登録 | 社員情報を登録             |
| ドライバーの編集     | 既存ドライバーの情報を編集 |

**ドライバーの登録項目**

| 項目名     | 入力形式   | 必須 | 特記事項                                               |
| ---------- | ---------- | ---- | ------------------------------------------------------ |
| 営業所     | セレクト   | ✓    |                                                        |
| 社員コード | テキスト   | -    |                                                        |
| 名称       | テキスト   | ✓    | 検索可能                                               |
| Email      | テキスト   | -    | ログイン用                                             |
| パスワード | パスワード | -    | ログイン用                                             |
| 区分       | セレクト   | ✓    | **「一般」または「委託用」**。給与算定の対象判定に影響 |
| 携帯番号   | テキスト   | -    |                                                        |

**⚠️ 注意: ドライバー区分**

- 「一般」: 正社員ドライバー
- 「委託用」: 業務委託ドライバー（給与算定等で区別される場合あり）

**他機能との関連**

| 関連機能                           | 影響内容                                       |
| ---------------------------------- | ---------------------------------------------- |
| **配車設定**                       | 便にドライバーを割り当てる際の選択肢となる     |
| **運行入力（ドライバーメニュー）** | ログインユーザーとして自身の運行実績を入力     |
| **月間予定**                       | ドライバー自身のスケジュールを確認             |
| **給与算定**                       | ドライバーごとの運行実績から給与を計算         |
| **出退勤管理**                     | ドライバーの勤務状況（出勤/公休/有給等）を記録 |

---

#### 1.4 経費タブ

営業所の経費を記録・管理します。

| 機能           | 説明                         |
| -------------- | ---------------------------- |
| 経費一覧の表示 | 日付順（新しい順）で一覧表示 |
| 経費の新規登録 | 経費項目を登録               |
| 経費の編集     | 既存経費の情報を編集         |

**経費の登録項目**

| 項目名 | 入力形式       | 必須 | 特記事項         |
| ------ | -------------- | ---- | ---------------- |
| 項目名 | テキスト       | ✓    |                  |
| 金額   | 数値           | ✓    |                  |
| 日付   | 日付           | ✓    | デフォルト：当日 |
| 備考   | テキストエリア | -    |                  |

---

#### 1.5 ガソリン・軽油【月別】タブ

燃料の月別単価を管理します。

| 機能           | 説明                     |
| -------------- | ------------------------ |
| 単価一覧の表示 | 月別の燃料単価を一覧表示 |
| 単価の新規登録 | 月別の単価を登録         |
| 単価の編集     | 既存の単価を編集         |

**登録項目**

| 項目名               | 入力形式 | 必須 | 特記事項              |
| -------------------- | -------- | ---- | --------------------- |
| 年月                 | 年月     | ✓    | 営業所×年月でユニーク |
| 軽油単価（円/L）     | 数値     | -    |                       |
| ガソリン単価（円/L） | 数値     | -    |                       |

**⚠️ 重要: 燃料単価の設定**

- **燃費管理**: 給油量×単価で燃料費を自動計算
- **給与算定**: 当月燃料代の計算に使用。未設定の場合は0円として計算

**他機能との関連**

| 関連機能     | 影響内容                                 |
| ------------ | ---------------------------------------- |
| **燃費管理** | 燃料コスト計算に使用                     |
| **給与算定** | 「当月ss単価」「当月燃料代」の計算に使用 |

---

## 2. 設計者目線の詳細仕様

### 2.1 ページ構成

```
eigyoshoSettei/
├── page.tsx                          # ページのエントリポイント（サーバーコンポーネント）
└── components/
    ├── EigyoshoSetteiClient.tsx      # メインクライアントコンポーネント
    ├── RouteDisplay.tsx              # 便設定表示コンポーネント
    ├── BulkCalendarSetter.tsx        # 一括カレンダー設定コンポーネント
    ├── autoCreateMonthConfig.tsx     # 前月データ引き継ぎ機能
    └── WorkStatusUpdator.tsx         # 勤務状況更新（未使用）
```

### 2.2 データフロー

```
1. page.tsx（サーバー）
   ├── セッション取得 → tbmBaseId取得
   ├── 日付パラメータ処理（月切り替え対応）
   └── TbmBaseデータ取得 → クライアントに渡す

2. EigyoshoSetteiClient.tsx（クライアント）
   ├── BasicTabsで5つのタブを構成
   └── 各タブにChildCreatorコンポーネントを配置
       └── データのCRUD操作を共通化

3. RouteDisplay.tsx
   ├── 便一覧の表示・ソート機能
   ├── 便の共有設定（自営業所＋共有された便を表示）
   └── 前月データ引き継ぎボタン
```

### 2.3 主要コンポーネント詳細

#### ChildCreatorコンポーネント

- 親子関係にあるデータのCRUD操作を共通化
- `models`パラメータで親子モデル名を指定
- `columns`でカラム定義（ColBuilderを使用）
- `EditForm`で詳細編集フォームを指定

#### BulkCalendarSetter（一括カレンダー設定）

- 曜日別に一括で稼働/休日を設定可能
- 祝日マスタ（Calendar）と連携
- 年間カレンダー形式で視覚的に設定

#### autoCreateMonthConfig（前月データ引き継ぎ）

- TbmMonthlyConfigForRouteGroupのデータを前月から当月にコピー
- トランザクションでバルクupsert実行
- 請求回数、通行料（郵便/一般）が引き継ぎ対象

### 2.4 便共有機能

複数営業所で同一便を共有できる機能。

**仕組み**

- TbmRouteGroupShare中間テーブルで共有関係を管理
- TbmRouteGroup.isSharedフラグで共有状態を識別
- 便一覧では自営業所の便＋共有された便を表示
- 詳細画面から共有先営業所をチェックボックスで選択

### 2.5 カラムビルダー

各マスターのカラム定義は`ColBuilder`クラスで一元管理。

- `ColBuilder.tbmRouteGroup` - 便設定
- `ColBuilder.tbmVehicle` - 車両マスタ
- `ColBuilder.user` - ドライバーマスタ
- `ColBuilder.tbmKeihi` - 経費
- `ColBuilder.tbmBase_MonthConfig` - 月別燃料単価

### 2.6 時刻フォーマット（TimeHandler）

便の出発時刻・最終到着時刻は`TimeHandler`クラスで処理。

```typescript
// 入力バリデーション
TimeHandler.validateTimeString('0800') // { isValid: true }
TimeHandler.validateTimeString('2560') // { isValid: false, error: "分は00-59の範囲で..." }

// 表示フォーマット
TimeHandler.formatTimeString('0800', 'display') // "08:00"
TimeHandler.formatTimeString('2530', 'display') // "翌05:30"
```

### 2.7 認可・権限

- セッションから`tbmBaseId`を取得し、所属営業所のデータのみ操作可能
- 共有された便は閲覧・配車可能だが、基本設定の編集は所有営業所のみ
- 権限レベル:
  - `isJimuin`: 事務員 → 営業所メニュー全般にアクセス可
  - `isShocho`: 所長 → 同上 + 給与算定にアクセス可
  - `isSystemAdmin`: システム管理者 → 共通設定メニューにアクセス可

### 2.8 ナビゲーション構造

```
運行管理（TBM）
├── ドライバーメニュー
│   ├── 運行入力
│   └── 月間予定
├── 営業所メニュー ★ここに営業所設定がある
│   ├── 営業所設定 ← 本ページ
│   ├── 配車設定
│   └── ETC連携
├── レポート①
│   ├── 運行明細
│   ├── 燃費管理
│   ├── 累積距離記帳
│   └── 請求書発行
├── レポート②
│   ├── 営業所別売上
│   ├── 荷主別売上
│   ├── 車両別売上
│   ├── 運行回数
│   ├── 給与算定
│   ├── 出退勤管理
│   └── 簡易走行記録（PDF）
└── 共通設定（システム管理者のみ）
    ├── 営業所
    ├── ユーザー
    ├── 車両
    ├── 荷主
    ├── カレンダー
    └── 権限管理
```

---

## 3. テーブル定義書

### 3.1 TbmBase（営業所）

営業所の基本情報を管理するマスターテーブル。

| カラム名  | 型       | 制約           | 説明         |
| --------- | -------- | -------------- | ------------ |
| id        | Int      | PK, AUTO       | 営業所ID     |
| createdAt | DateTime | DEFAULT NOW    | 作成日時     |
| updatedAt | DateTime | UPDATED AT     | 更新日時     |
| sortOrder | Float    | DEFAULT 0      | 表示順序     |
| code      | String   | UNIQUE, NULL可 | 営業所コード |
| name      | String   | UNIQUE         | 営業所名     |

**リレーション**

- User[] - 所属ユーザー
- TbmVehicle[] - 保有車両
- TbmRouteGroup[] - 所有便
- TbmDriveSchedule[] - 配車スケジュール
- TbmCustomer[] - 取引先
- TbmBase_MonthConfig[] - 月別設定
- TbmKeihi[] - 経費
- TbmRouteGroupShare[] - 便共有設定

---

### 3.2 TbmRouteGroup（便）

運送便（路線）のマスターテーブル。

| カラム名         | 型       | 制約           | 説明                     |
| ---------------- | -------- | -------------- | ------------------------ |
| id               | Int      | PK, AUTO       | 便ID                     |
| createdAt        | DateTime | DEFAULT NOW    | 作成日時                 |
| updatedAt        | DateTime | UPDATED AT     | 更新日時                 |
| sortOrder        | Float    | DEFAULT 0      | 表示順序                 |
| code             | String   | UNIQUE, NULL可 | 便コード                 |
| name             | String   | NOT NULL       | 便名                     |
| routeName        | String   | NULL可         | 路線名                   |
| serviceNumber    | String   | NULL可         | 服務番号                 |
| departureTime    | String   | NULL可         | 出発時刻（HHMM形式）     |
| finalArrivalTime | String   | NULL可         | 最終到着時刻（HHMM形式） |
| allowDuplicate   | Boolean  | DEFAULT FALSE  | 重複許可                 |
| pickupTime       | String   | NULL可         | 接車時間                 |
| vehicleType      | String   | NULL可         | 車種                     |
| productName      | String   | NULL可         | 品名                     |
| seikyuKbn        | String   | DEFAULT '01'   | 請求区分                 |
| isShared         | Boolean  | DEFAULT FALSE  | 共有フラグ               |
| tbmBaseId        | Int      | FK             | 所属営業所ID             |

**ユニーク制約**

- `unique_tbmBaseId_code` (tbmBaseId, code)

**リレーション**

- TbmBase - 所属営業所
- TbmDriveSchedule[] - 配車スケジュール
- TbmMonthlyConfigForRouteGroup[] - 月別設定
- Mid_TbmRouteGroup_TbmCustomer - 取引先紐付け
- TbmRouteGroupCalendar[] - 稼働カレンダー
- TbmRouteGroupFee[] - 運賃/付帯費用履歴
- TbmRouteGroupShare[] - 共有設定

---

### 3.3 TbmVehicle（車両）

車両マスターテーブル。

| カラム名              | 型       | 制約           | 説明               |
| --------------------- | -------- | -------------- | ------------------ |
| id                    | Int      | PK, AUTO       | 車両ID             |
| createdAt             | DateTime | DEFAULT NOW    | 作成日時           |
| updatedAt             | DateTime | UPDATED AT     | 更新日時           |
| sortOrder             | Float    | DEFAULT 0      | 表示順序           |
| code                  | String   | UNIQUE, NULL可 | 車両コード         |
| name                  | String   | NULL可         | 車名               |
| frameNo               | String   | UNIQUE, NULL可 | フレームNo         |
| vehicleNumber         | String   | UNIQUE         | 車両番号           |
| type                  | String   | NULL可         | 車種               |
| shape                 | String   | NULL可         | 形状               |
| airSuspension         | String   | NULL可         | エアサス有無       |
| oilTireParts          | String   | NULL可         | 油脂/タイヤ/備品代 |
| maintenance           | String   | NULL可         | 整備代             |
| insurance             | String   | NULL可         | 保険代             |
| shodoTorokubi         | DateTime | NULL可         | 初度登録日         |
| sakenManryobi         | DateTime | NULL可         | 車検満了日         |
| hokenManryobi         | DateTime | NULL可         | 保険満了日         |
| sankagetsuTenkenbi    | DateTime | NULL可         | 3ヶ月点検日        |
| sokoKyori             | Float    | NULL可         | 走行距離           |
| jibaisekiHokenCompany | String   | NULL可         | 自賠責保険会社     |
| jibaisekiManryobi     | DateTime | NULL可         | 自賠責満了日       |
| jidoshaHokenCompany   | String   | NULL可         | 自動車保険会社     |
| jidoshaManryobi       | DateTime | NULL可         | 自動車保険満了日   |
| kamotsuHokenCompany   | String   | NULL可         | 貨物保険会社       |
| kamotsuManryobi       | DateTime | NULL可         | 貨物保険満了日     |
| sharyoHokenCompany    | String   | NULL可         | 車両保険会社       |
| sharyoManryobi        | DateTime | NULL可         | 車両保険満了日     |
| etcCardNumber         | String   | NULL可         | ETCカード番号      |
| etcCardExpiration     | DateTime | NULL可         | ETCカード有効期限  |
| tbmBaseId             | Int      | FK             | 所属営業所ID       |

**ユニーク制約**

- `unique_tbmBaseId_vehicleNumber` (tbmBaseId, vehicleNumber)

**リレーション**

- TbmBase - 所属営業所
- TbmFuelCard[] - 燃料カード
- TbmRefuelHistory[] - 給油履歴
- TbmDriveSchedule[] - 配車スケジュール
- OdometerInput[] - オドメーター入力
- TbmCarWashHistory[] - 洗車履歴
- TbmVehicleMaintenanceRecord[] - 整備記録
- TbmEtcMeisai[] - ETC利用明細
- EtcCsvRaw[] - ETC生データ
- User[] - 利用ドライバー

---

### 3.4 TbmKeihi（経費）

営業所の経費を管理するテーブル。

| カラム名  | 型       | 制約        | 説明     |
| --------- | -------- | ----------- | -------- |
| id        | Int      | PK, AUTO    | 経費ID   |
| createdAt | DateTime | DEFAULT NOW | 作成日時 |
| updatedAt | DateTime | UPDATED AT  | 更新日時 |
| sortOrder | Float    | DEFAULT 0   | 表示順序 |
| item      | String   | NULL可      | 項目名   |
| amount    | Float    | NULL可      | 金額     |
| date      | DateTime | NULL可      | 日付     |
| remark    | String   | NULL可      | 備考     |
| tbmBaseId | Int      | FK          | 営業所ID |

---

### 3.5 TbmBase_MonthConfig（月別燃料単価設定）

営業所ごとの月別燃料単価を管理するテーブル。

| カラム名         | 型       | 制約        | 説明                 |
| ---------------- | -------- | ----------- | -------------------- |
| id               | Int      | PK, AUTO    | ID                   |
| createdAt        | DateTime | DEFAULT NOW | 作成日時             |
| updatedAt        | DateTime | UPDATED AT  | 更新日時             |
| sortOrder        | Float    | DEFAULT 0   | 表示順序             |
| code             | String   | NULL可      | コード               |
| yearMonth        | DateTime | NOT NULL    | 対象年月             |
| keiyuPerLiter    | Float    | NULL可      | 軽油単価（円/L）     |
| gasolinePerLiter | Float    | NULL可      | ガソリン単価（円/L） |
| tbmBaseId        | Int      | FK          | 営業所ID             |

**ユニーク制約**

- `unique_tbmBaseId_yearMonth` (tbmBaseId, yearMonth)

---

### 3.6 TbmMonthlyConfigForRouteGroup（便月別設定）

便ごとの月別設定を管理するテーブル。

| カラム名           | 型       | 制約        | 説明           |
| ------------------ | -------- | ----------- | -------------- |
| id                 | Int      | PK, AUTO    | ID             |
| createdAt          | DateTime | DEFAULT NOW | 作成日時       |
| updatedAt          | DateTime | UPDATED AT  | 更新日時       |
| sortOrder          | Float    | DEFAULT 0   | 表示順序       |
| yearMonth          | DateTime | NOT NULL    | 対象年月       |
| generalFee         | Int      | NULL可      | 通行料（一般） |
| tsukoryoSeikyuGaku | Int      | NULL可      | 通行料請求額   |
| seikyuKaisu        | Int      | NULL可      | 請求回数       |
| numberOfTrips      | Int      | NULL可      | 運行回数       |
| tbmRouteGroupId    | Int      | FK          | 便ID           |

**ユニーク制約**

- `unique_yearMonth_tbmRouteGroupId` (yearMonth, tbmRouteGroupId)

---

### 3.7 TbmRouteGroupFee（便運賃/付帯費用）

便ごとの運賃・付帯費用の履歴を管理するテーブル。

| カラム名        | 型       | 制約        | 説明       |
| --------------- | -------- | ----------- | ---------- |
| id              | Int      | PK, AUTO    | ID         |
| createdAt       | DateTime | DEFAULT NOW | 作成日時   |
| updatedAt       | DateTime | UPDATED AT  | 更新日時   |
| sortOrder       | Float    | DEFAULT 0   | 表示順序   |
| startDate       | DateTime | NOT NULL    | 適用開始日 |
| driverFee       | Int      | NULL可      | 運賃       |
| futaiFee        | Int      | NULL可      | 付帯費用   |
| tbmRouteGroupId | Int      | FK          | 便ID       |

---

### 3.8 TbmRouteGroupCalendar（便稼働カレンダー）

便ごとの稼働/休日カレンダーを管理するテーブル。

| カラム名        | 型       | 制約        | 説明                  |
| --------------- | -------- | ----------- | --------------------- |
| id              | Int      | PK, AUTO    | ID                    |
| createdAt       | DateTime | DEFAULT NOW | 作成日時              |
| updatedAt       | DateTime | UPDATED AT  | 更新日時              |
| sortOrder       | Float    | DEFAULT 0   | 表示順序              |
| date            | DateTime | NOT NULL    | 日付                  |
| holidayType     | String   | DEFAULT ''  | 稼働種別（'稼働'/''） |
| remark          | String   | NULL可      | 備考                  |
| tbmRouteGroupId | Int      | FK          | 便ID                  |

**ユニーク制約**

- `unique_tbmRouteGroupId_date` (tbmRouteGroupId, date)

---

### 3.9 TbmRouteGroupShare（便共有設定）

便の営業所間共有を管理する中間テーブル。

| カラム名        | 型       | 制約         | 説明           |
| --------------- | -------- | ------------ | -------------- |
| id              | Int      | PK, AUTO     | ID             |
| createdAt       | DateTime | DEFAULT NOW  | 作成日時       |
| updatedAt       | DateTime | UPDATED AT   | 更新日時       |
| sortOrder       | Float    | DEFAULT 0    | 表示順序       |
| tbmRouteGroupId | Int      | FK           | 共有元便ID     |
| tbmBaseId       | Int      | FK           | 共有先営業所ID |
| isActive        | Boolean  | DEFAULT TRUE | 有効フラグ     |

**ユニーク制約**

- `unique_tbmRouteGroupId_tbmBaseId` (tbmRouteGroupId, tbmBaseId)

---

### 3.10 TbmVehicleMaintenanceRecord（車両整備記録）

車両の整備記録を管理するテーブル。

| カラム名     | 型       | 制約        | 説明                                         |
| ------------ | -------- | ----------- | -------------------------------------------- |
| id           | Int      | PK, AUTO    | ID                                           |
| createdAt    | DateTime | DEFAULT NOW | 作成日時                                     |
| updatedAt    | DateTime | UPDATED AT  | 更新日時                                     |
| sortOrder    | Float    | DEFAULT 0   | 表示順序                                     |
| date         | DateTime | NOT NULL    | 日付                                         |
| title        | String   | NOT NULL    | 件名                                         |
| price        | Float    | NOT NULL    | 金額                                         |
| contractor   | String   | NULL可      | 依頼先事業者                                 |
| remark       | String   | NULL可      | 備考                                         |
| type         | String   | NULL可      | 種別（3ヶ月点検/車検/一般修理/プレート変更） |
| tbmVehicleId | Int      | FK, NULL可  | 車両ID                                       |

---

### 3.11 TbmFuelCard（燃料カード）

車両に紐づく燃料カード情報を管理するテーブル。

| カラム名     | 型       | 制約        | 説明       |
| ------------ | -------- | ----------- | ---------- |
| id           | Int      | PK, AUTO    | ID         |
| createdAt    | DateTime | DEFAULT NOW | 作成日時   |
| updatedAt    | DateTime | UPDATED AT  | 更新日時   |
| sortOrder    | Float    | DEFAULT 0   | 表示順序   |
| name         | String   | NOT NULL    | カード名   |
| startDate    | DateTime | DEFAULT NOW | 利用開始日 |
| endDate      | DateTime | DEFAULT NOW | 利用終了日 |
| tbmVehicleId | Int      | FK, NULL可  | 車両ID     |

---

### 3.12 TbmCarWashHistory（洗車履歴）

洗車記録を管理するテーブル。

| カラム名     | 型       | 制約        | 説明             |
| ------------ | -------- | ----------- | ---------------- |
| id           | Int      | PK, AUTO    | ID               |
| createdAt    | DateTime | DEFAULT NOW | 作成日時         |
| updatedAt    | DateTime | UPDATED AT  | 更新日時         |
| sortOrder    | Float    | DEFAULT 0   | 表示順序         |
| date         | DateTime | NOT NULL    | 洗車日           |
| price        | Float    | NOT NULL    | 料金             |
| tbmVehicleId | Int      | FK          | 車両ID           |
| userId       | Int      | FK          | 実施ドライバーID |

---

## ER図（簡略版）

```
TbmBase (営業所)
├── TbmVehicle (車両)
│   ├── TbmVehicleMaintenanceRecord (整備記録)
│   ├── TbmFuelCard (燃料カード)
│   ├── TbmCarWashHistory (洗車履歴)
│   └── TbmRefuelHistory (給油履歴)
├── TbmRouteGroup (便)
│   ├── TbmRouteGroupCalendar (稼働カレンダー)
│   ├── TbmRouteGroupFee (運賃/付帯費用)
│   ├── TbmMonthlyConfigForRouteGroup (月別設定)
│   ├── TbmRouteGroupShare (便共有)
│   └── Mid_TbmRouteGroup_TbmCustomer → TbmCustomer (取引先)
├── TbmKeihi (経費)
├── TbmBase_MonthConfig (月別燃料単価)
└── User (ドライバー)
```

---

_最終更新日: 2025年12月1日_
