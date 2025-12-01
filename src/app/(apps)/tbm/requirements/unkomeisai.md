# 運行明細ページ仕様書

## 目次

1. [ユーザー目線の機能一覧](#1-ユーザー目線の機能一覧)
2. [設計者目線の詳細仕様](#2-設計者目線の詳細仕様)
3. [テーブル定義書](#3-テーブル定義書)

---

## 1. ユーザー目線の機能一覧

### 概要

運行明細ページでは、月間の運行実績を一覧形式で確認できます。各運行の詳細情報、費用計算、ETC紐付け状況を確認できます。

### アクセス方法

| 方法           | 詳細                                                   |
| -------------- | ------------------------------------------------------ |
| URL            | `/tbm/unkomeisai`                                      |
| ナビゲーション | 画面上部メニュー → **「レポート①」** → **「運行明細」** |
| 対象ユーザー   | 事務員（isJimuin）、所長（isShocho）、システム管理者   |

> 💡 ナビゲーションには「📋 運行明細」アイコン付きで表示されます

---

### 機能一覧

#### 1.1 月切り替え

画面上部の日付切り替えボタンで表示月を変更できます。

| 操作       | 説明                 |
| ---------- | -------------------- |
| 「◀」ボタン | 前月のデータを表示   |
| 「▶」ボタン | 翌月のデータを表示   |
| 月選択     | カレンダーから月選択 |

#### 1.2 運行明細一覧表示

承認済みの運行データが一覧表示されます。

**表示項目**

| 列名           | 説明                                   | 背景色   |
| -------------- | -------------------------------------- | -------- |
| A運行日        | 運行実施日                             | -        |
| 路線名         | 便の路線名                             | -        |
| C便名          | 便の名称                               | -        |
| D車種          | 使用車両の車種                         | -        |
| E品名          | 運送品目名                             | -        |
| G取引先        | 荷主名                                 | -        |
| I車番          | 使用車両のナンバー                     | -        |
| K運転手        | 担当ドライバー名                       | -        |
| L通行料（郵便）| 郵便向け通行料請求額                   | 赤系     |
| M有料利用料（郵便）| 郵便向け高速道路利用料             | 赤系     |
| N通行料（一般）| 一般向け通行料                         | 青系     |
| O有料利用料（一般）| 一般向け高速道路利用料             | 青系     |
| P高速使用代    | 乗務員負担の高速代                     | -        |
| Q運賃          | 便の運賃単価                           | -        |
| Q付帯作業      | 付帯作業料金                           | -        |
| R給与算定運賃  | 給与計算用の運賃                       | 緑系     |
| S乗務員負担    | 高速代の乗務員負担額                   | 緑系     |
| T運賃から負担  | 高速代の30%                            | -        |
| U高速代-通行料 | 一般の高速代差額                       | 濃青系   |
| V高速超過額    | 高速代超過分                           | -        |

#### 1.3 運行詳細モーダル

行をクリックすると詳細情報をモーダルで表示します。

**詳細モーダルの内容**

| セクション     | 表示内容                                   |
| -------------- | ------------------------------------------ |
| 基本情報       | 日付、車両、便名、路線名、ドライバー、拠点 |
| ETCデータ      | 紐付けられたETC明細の一覧                  |

**ETCデータの表示項目**

| 項目       | 説明                       |
| ---------- | -------------------------- |
| グループ番号 | ETCグループの識別番号     |
| 出発日時   | IC入場日時                 |
| 到着日時   | IC出場日時                 |
| 出発IC     | 入口IC名                   |
| 到着IC     | 出口IC名                   |
| 合計金額   | グループ内の合計通行料金   |

**ETCデータ操作**

| 操作           | 説明                                   |
| -------------- | -------------------------------------- |
| ETCデータと紐付け | 未紐付けの場合、ETCデータを選択して紐付け |
| 紐付け追加     | 追加でETCグループを紐付け             |
| 紐付け解除     | 紐付けを解除                           |

---

### 機能間の関連性

| 関連機能     | 関連内容                                           |
| ------------ | -------------------------------------------------- |
| 配車設定     | 配車データが承認されると運行明細に表示             |
| 営業所設定   | 便の運賃・付帯作業料金設定を参照                   |
| ETC連携      | ETCデータを運行明細と紐付け                        |
| 請求書発行   | 運行明細データから請求金額を算出                   |
| 給与算定     | R給与算定運賃を給与計算に使用                      |

---

## 2. 設計者目線の詳細仕様

### 2.1 コンポーネント構成

```
unkomeisai/
├── page.tsx                    # サーバーコンポーネント（ページエントリ）
├── UnkoMeisaiCC.tsx            # クライアントコンポーネント（一覧表示）
├── DriveDetailCC.tsx           # 詳細表示コンポーネント
└── [id]/
    └── UnkomeisaiDetailModal.tsx # 詳細モーダル
```

### 2.2 データフロー

```
page.tsx (RSC)
    ↓ [fetchUnkoMeisaiData でデータ取得]
    ↓ 承認済み(approved: true)の配車スケジュールを取得
UnkoMeisaiCC.tsx (RCC)
    ↓ [CsvTable で一覧表示]
UnkomeisaiDetailModal.tsx
    ↓ [モーダルで詳細表示]
    ↓ [ETC紐付け機能]
```

### 2.3 データ取得ロジック

`fetchUnkoMeisaiData` 関数の処理:

1. `TbmDriveSchedule` を取得（`approved: true` フィルタ）
2. 関連データを include:
   - `TbmEtcMeisai`: ETC明細
   - `TbmRouteGroup`: 便情報
     - `TbmMonthlyConfigForRouteGroup`: 月次設定
     - `Mid_TbmRouteGroup_TbmCustomer`: 荷主紐付け
     - `TbmRouteGroupFee`: 運賃設定
   - `TbmVehicle`: 車両情報
   - `User`: ドライバー情報
3. `createUnkoMeisaiRow` で各列の値を計算

### 2.4 URLクエリパラメータ

| パラメータ | 型   | デフォルト | 説明             |
| ---------- | ---- | ---------- | ---------------- |
| from       | Date | 月初       | 表示開始日       |
| to         | Date | 月末       | 表示終了日       |

### 2.5 費用計算ロジック

```typescript
// L: 郵便向け通行料（月次設定の請求額 ÷ 実働回数）
const L_postalFee = ConfigForRoute.tsukoryoSeikyuGaku / jitsudoKaisu

// M: 郵便向け有料利用料（運行データから直接取得）
const M_postalHighwayFee = schedule.M_postalHighwayFee

// N: 一般向け通行料（月次設定から取得）
const N_generalFee = ConfigForRoute.generalFee

// O: 一般向け有料利用料（運行データから直接取得）
const O_generalHighwayFee = schedule.O_generalHighwayFee

// T: 高速代の30%
const T_thirteenPercentOfPostalHighway = M_postalHighwayFee * 0.3

// S: 乗務員負担（M - L - T）
const S_jomuinFutan = M_postalHighwayFee - (L_postalFee + T_thirteenPercentOfPostalHighway)

// U: 一般高速代差額（O - N）
const U_general = O_generalHighwayFee - N_generalFee

// R: 給与算定運賃（運賃 + 付帯作業 - T - U）
const R_JomuinUnchin = (feeOnDate.driverFee + feeOnDate.futaiFee) - (T_thirteenPercentOfPostalHighway + U_general)
```

### 2.6 運賃取得ロジック

便の運賃設定（`TbmRouteGroupFee`）は時期別に管理されており、運行日に有効な設定を適用します。

```typescript
// 運行日時点で有効な運賃設定を取得
const feeOnDate = schedule.TbmRouteGroup.TbmRouteGroupFee
  .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
  .find(fee => fee.startDate <= schedule.date)
```

### 2.7 承認済みデータのみ表示

デフォルトでは `approved: true` のデータのみ表示。`TbmReportCl.allowNonApprovedSchedule` フラグで未承認データも含めることが可能。

---

## 3. テーブル定義書

### 3.1 TbmDriveSchedule（配車スケジュール）※運行明細関連フィールド

| カラム名              | 型       | 必須 | 説明                       |
| --------------------- | -------- | ---- | -------------------------- |
| id                    | Int      | ○    | 主キー                     |
| date                  | DateTime | ○    | 運行日                     |
| tbmBaseId             | Int      | ○    | 営業所ID                   |
| tbmRouteGroupId       | Int      | ○    | 便ID                       |
| userId                | Int      | -    | ドライバーID               |
| tbmVehicleId          | Int      | -    | 車両ID                     |
| M_postalHighwayFee    | Float    | -    | 郵便向け有料利用料         |
| O_generalHighwayFee   | Float    | -    | 一般向け有料利用料         |
| approved              | Boolean  | -    | 承認フラグ                 |

### 3.2 TbmMonthlyConfigForRouteGroup（便月次設定）※費用計算用

| カラム名           | 型       | 必須 | 説明               |
| ------------------ | -------- | ---- | ------------------ |
| id                 | Int      | ○    | 主キー             |
| tbmRouteGroupId    | Int      | ○    | 便ID               |
| yearMonth          | DateTime | ○    | 対象年月           |
| tsukoryoSeikyuGaku | Float    | -    | 通行料請求額       |
| generalFee         | Float    | -    | 一般通行料         |

### 3.3 TbmRouteGroupFee（便運賃設定）

| カラム名        | 型       | 必須 | 説明               |
| --------------- | -------- | ---- | ------------------ |
| id              | Int      | ○    | 主キー             |
| tbmRouteGroupId | Int      | ○    | 便ID               |
| startDate       | DateTime | ○    | 適用開始日         |
| endDate         | DateTime | -    | 適用終了日         |
| driverFee       | Float    | -    | 運賃               |
| futaiFee        | Float    | -    | 付帯作業料金       |

### 3.4 TbmEtcMeisai（ETC明細）※運行紐付け用

| カラム名            | 型       | 必須 | 説明                     |
| ------------------- | -------- | ---- | ------------------------ |
| id                  | Int      | ○    | 主キー                   |
| tbmDriveScheduleId  | Int      | -    | 配車スケジュールID（FK） |
| sum                 | Float    | -    | 合計金額                 |
| groupIndex          | Int      | -    | グループ番号             |

---

## 4. チェックリスト

### 導入時の確認事項

- [ ] 配車設定で配車データが承認済みになっているか
- [ ] 便の月次設定（通行料請求額、一般通行料）が設定されているか
- [ ] 便の運賃設定（運賃、付帯作業料金）が設定されているか
- [ ] ETCデータがインポート・紐付けされているか

### 運用時の注意事項

- [ ] 未承認の配車データは表示されない
- [ ] 運賃は運行日時点で有効な設定が適用される
- [ ] 費用計算は月次設定と運賃設定から自動計算される

### よくある確認ポイント

| 項目                     | 確認方法                                   |
| ------------------------ | ------------------------------------------ |
| データが表示されない     | 配車設定で承認処理されているか確認         |
| 運賃が0になる            | 便の運賃設定を確認                         |
| 通行料が0になる          | 便の月次設定を確認                         |
| ETCデータがない          | ETC連携で紐付け状況を確認                  |

---

*最終更新日: 2025年12月1日*
