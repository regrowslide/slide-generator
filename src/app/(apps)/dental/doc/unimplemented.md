# 訪問歯科アプリ 未実装項目一覧

> **最終更新**: 2026-01-27
> **対象モック**: `doc/mock/DentalAppMock.jsx`

---

## 1. 提供文書作成ページ（優先度: 高）

**パス:** `/dental/documents/[patientId]_[examinationId]_[templateId]`

### 概要

実施項目の選択時に「必要な提供文書」ボタンを押すと遷移する専用ページ。テンプレートに各種データを流し込み、PDF形式で保存・ダウンロードする機能。

### 必要な機能

1. **テンプレート管理**
   - 文書テンプレートのマスタ登録
   - テンプレートごとのフィールド定義（差し込みフィールド）

2. **データ流し込み**
   - クリニック情報
   - 施設情報
   - 利用者情報
   - 診察情報（日付、担当者、バイタル、実施項目など）

3. **PDF生成・保存**
   - クライアントサイドまたはサーバーサイドでのPDF生成
   - AWS S3へのアップロード
   - 保存履歴の管理（バージョン管理）

4. **ダウンロード機能**
   - 生成済みPDFのダウンロード
   - 履歴からの過去バージョンダウンロード

### 技術的検討事項

- PDF生成ライブラリ: `@react-pdf/renderer` or `jspdf`
- S3連携: 既存のAWS設定を使用
- テンプレートエンジン: React コンポーネントベース or Markdown変換

### 関連ファイル

- `instruction.md` の「提供文書の作成」セクション
- モック内 `PROCEDURE_ITEMS_MASTER` の `documents` 配列

---

## 2. クリニック設定画面（優先度: 中）

**パス:** `/dental/admin/clinic`

### 概要

クリニック（医院）の基本情報と届出資格の設定を行う管理画面。

### 必要な機能

1. **基本情報**
   - クリニック名
   - 住所
   - 電話番号
   - 代表者名

2. **届出資格設定**
   - 歯訪診（boolean）
   - 歯援診（enum: 1/2/なし）
   - 在歯管（boolean）
   - 口管強（boolean）

3. **保留中の資格**
   - 在宅歯科医療情報連携加算
   - ベースアップ加算
   - DX加算

### 技術的検討事項

- 資格設定は点数計算ロジックに影響するため、設計に注意

---

## 3. 音声メモAI要約機能（優先度: 中）

### 概要

診療中に音声で記録し、AIが要約を生成する機能。当初の要件にあったが、4項目入力形式に変更したため保留中。

### 必要な機能

1. **音声録音**
   - ブラウザの Web Audio API を使用
   - 録音開始/停止/再生

2. **音声→テキスト変換**
   - Whisper API または Google Speech-to-Text

3. **AI要約**
   - OpenAI API を使用
   - 4項目（訪問時の様子/口腔内所見/処置/次回予定）への自動振り分け

### 技術的検討事項

- 録音データの保存場所（一時的 or 永続的）
- プライバシー・セキュリティ対応

---

## 4. 過去履歴参照モーダル（優先度: 中）

### 概要

診療画面で、当該患者の過去の診察記録を参照するモーダル。

### 必要な機能

1. **履歴一覧表示**
   - 日付順での表示
   - 検索・フィルター機能

2. **詳細表示**
   - 実施記録・所見
   - 実施項目
   - バイタル情報

3. **コピー機能**
   - 過去の記録内容を現在の入力欄にコピー

### UI/UX

- モーダル or サイドパネル
- スワイプで過去履歴をナビゲート

---

## 5. 時刻手動変更と変更履歴管理（優先度: 低）

### 概要

タイマーで自動記録された開始・終了時刻を手動で修正する機能と、その変更履歴を管理する機能。

### 必要な機能

1. **時刻編集UI**
   - 時刻入力フィールド
   - カレンダーピッカー

2. **変更履歴**
   - 変更前の値
   - 変更後の値
   - 変更者
   - 変更日時
   - 変更理由（任意）

### 技術的検討事項

- 履歴テーブルの設計（`ExaminationTimeLog` など）

---

## 6. 算定項目一覧ページ（優先度: 低）

### 概要

算定項目マスタの一覧表示・管理ページ。

### 必要な機能

1. **一覧表示**
   - 項目名、略称、点数、該当区分
   - 検索・フィルター

2. **詳細表示**
   - 算定条件
   - 必要な提供文書
   - 関連する施設基準

3. **編集機能**（管理者のみ）
   - 点数の更新（診療報酬改定対応）

---

## 7. 歯科衛生士専用モードの詳細UI（優先度: 低）

### 概要

現在のモックは医師・衛生士共通のUIだが、衛生士専用の機能や表示の差異を明確化する。

### 検討事項

- 訪衛指（訪問歯科衛生指導）に特化したUI
- 医師の診察とは異なる実施項目セット
- 独自の記録項目

---

## 8. データベース連携・本番実装（優先度: 高）

### 概要

現在のモックはローカルステートで動作しているが、本番ではPrismaを使用したDB連携が必要。

### 必要なPrismaモデル

```prisma
// dental.prisma に追加予定

model DentalClinic {
  id              Int      @id @default(autoincrement())
  name            String
  address         String?
  qualifications  Json?    // 届出資格
  createdAt       DateTime @default(now())
  updatedAt       DateTime? @updatedAt
  sortOrder       Float    @default(0)
}

model DentalFacility {
  id           Int      @id @default(autoincrement())
  clinicId     Int
  name         String
  address      String?
  facilityType String   // NURSING_HOME, GROUP_HOME, RESIDENTIAL
  createdAt    DateTime @default(now())
  updatedAt    DateTime? @updatedAt
  sortOrder    Float    @default(0)

  patients     DentalPatient[]
  visitPlans   DentalVisitPlan[]
}

model DentalPatient {
  id         Int      @id @default(autoincrement())
  facilityId Int
  name       String
  nameKana   String?
  building   String?
  floor      String?
  room       String?
  notes      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime? @updatedAt
  sortOrder  Float    @default(0)

  examinations DentalExamination[]
}

model DentalStaff {
  id        Int      @id @default(autoincrement())
  clinicId  Int
  name      String
  role      String   // doctor, hygienist
  createdAt DateTime @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float    @default(0)
}

model DentalVisitPlan {
  id         Int      @id @default(autoincrement())
  facilityId Int
  visitDate  DateTime
  status     String   // scheduled, in_progress, completed
  createdAt  DateTime @default(now())
  updatedAt  DateTime? @updatedAt
  sortOrder  Float    @default(0)

  examinations DentalExamination[]
}

model DentalExamination {
  id              Int       @id @default(autoincrement())
  visitPlanId     Int
  patientId       Int
  doctorId        Int?
  hygienistId     Int?
  status          String    // waiting, in_progress, done
  drStartTime     DateTime?
  drEndTime       DateTime?
  dhStartTime     DateTime?
  dhEndTime       DateTime?
  vitalBefore     Json?
  vitalAfter      Json?
  treatmentItems  Json?     // 本日の実施項目
  procedureItems  Json?     // 実施項目の選択（加算）
  visitCondition  String?   // 訪問時の様子
  oralFindings    String?   // 口腔内所見
  treatment       String?   // 処置
  nextPlan        String?   // 次回予定
  createdAt       DateTime  @default(now())
  updatedAt       DateTime? @updatedAt
  sortOrder       Float     @default(0)

  documents       DentalProvidedDocument[]
}

model DentalProvidedDocument {
  id            Int      @id @default(autoincrement())
  examinationId Int
  templateId    String
  content       Json?
  pdfUrl        String?  // S3 URL
  version       Int      @default(1)
  createdAt     DateTime @default(now())
  updatedAt     DateTime? @updatedAt
}
```

### Server Actions

- `dental-clinic-actions.ts`
- `dental-facility-actions.ts`
- `dental-patient-actions.ts`
- `dental-staff-actions.ts`
- `dental-visit-plan-actions.ts`
- `dental-examination-actions.ts`
- `dental-document-actions.ts`

---

## 実装優先度まとめ

| 優先度 | 項目 | 理由 |
|--------|------|------|
| 高 | 提供文書作成ページ | コア機能、instruction.md に記載 |
| 高 | データベース連携 | 本番運用に必須 |
| 中 | クリニック設定画面 | 点数計算に影響 |
| 中 | 音声メモAI要約 | UX向上、元要件 |
| 中 | 過去履歴参照モーダル | 実務上必要 |
| 低 | 時刻手動変更・履歴 | 運用でカバー可能 |
| 低 | 算定項目一覧ページ | マスタメンテナンス用 |
| 低 | 衛生士専用モード | 差異が明確になってから |
