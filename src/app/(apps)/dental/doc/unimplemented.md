# 訪問歯科アプリ 未実装項目一覧

> **最終更新**: 2026-02-06
> **対象モック**: `doc/mock/DentalAppMock.jsx`

---

## 1. 提供文書PDF生成・S3保存（優先度: 高）

### 概要

現在のモックでは提供文書の作成画面は基本実装済みだが、実際のPDF生成・S3保存・バージョン管理は未実装。

### 必要な機能

1. **PDF生成** - テンプレートに各種データを流し込みPDF化
2. **S3保存** - 生成したPDFをAWS S3にアップロード
3. **バージョン管理** - 同一文書の更新時にバージョンを管理
4. **ダウンロード** - 生成済みPDFのダウンロード

### 技術的検討事項

- PDF生成ライブラリ: `@react-pdf/renderer` or `jspdf`
- S3連携: 既存のAWS設定を使用

---

## 2. 音声メモAI要約機能（優先度: 中）

### 概要

診療中に音声で記録し、AIが要約を生成。4項目（訪問時の様子/口腔内所見/処置/次回予定）への自動振り分け。

### 必要な機能

1. **音声録音** - Web Audio API
2. **音声→テキスト変換** - Whisper API or Google Speech-to-Text
3. **AI要約** - OpenAI APIで4項目への振り分け

---

## 3. 過去履歴参照モーダル（優先度: 中）

### 概要

診療画面で当該患者の過去の診察記録を参照するモーダル。

### 必要な機能

1. **履歴一覧** - 日付順表示、検索・フィルター
2. **詳細表示** - 実施記録・所見、実施項目、バイタル
3. **コピー機能** - 過去記録を現在の入力欄にコピー

---

## 4. 時刻手動変更と変更履歴管理（優先度: 低）

### 概要

タイマーで自動記録された開始・終了時刻を手動で修正し、変更履歴を管理。

### 必要な機能

1. **時刻編集UI** - 時刻入力フィールド
2. **変更履歴** - 変更前後の値、変更者、日時、理由

---

## 5. テンプレートの追加・編集機能（優先度: 低）

### 概要

現在のテンプレート登録画面は参照のみ。テンプレートの追加・編集機能が必要。

### 必要な機能

1. **テンプレート作成** - フィールド定義、自動/手動項目の設定
2. **テンプレート編集** - 既存テンプレートの変更
3. **プレビュー** - 作成したテンプレートのプレビュー

---

## 6. データベース連携・本番実装（優先度: 高）

### 概要

現在のモックはローカルステートで動作。本番ではPrisma + PostgreSQLでのDB連携が必要。

### 必要なPrismaモデル

```prisma
// dental.prisma に追加予定

model DentalClinic {
  id              Int      @id @default(autoincrement())
  name            String
  address         String?
  phone           String?
  representative  String?
  qualifications  Json?    // 届出・施設基準（全boolean）
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
  id                 Int      @id @default(autoincrement())
  facilityId         Int
  lastName           String
  firstName          String
  lastNameKana       String?
  firstNameKana      String?
  gender             String?  // male, female
  birthDate          DateTime?
  careLevel          String?
  building           String?
  floor              String?
  room               String?
  notes              String?
  diseases           Json?    // 基礎疾患（14項目boolean）
  teethCount         Int?
  hasDenture         Boolean  @default(false)
  hasOralHypofunction Boolean @default(false)
  assessment         Json?    // アセスメントデータ
  createdAt          DateTime @default(now())
  updatedAt          DateTime? @updatedAt
  sortOrder          Float    @default(0)

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
  treatmentItems  Json?
  procedureItems  Json?
  visitCondition  String?
  oralFindings    String?
  treatment       String?
  nextPlan        String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime? @updatedAt
  sortOrder       Float     @default(0)

  documents       DentalProvidedDocument[]
}

model DentalProvidedDocument {
  id            Int      @id @default(autoincrement())
  examinationId Int
  patientId     Int
  templateId    String
  type          String   // 管理計画書, 訪問歯科衛生指導説明書
  content       Json?
  pdfUrl        String?  // S3 URL
  version       Int      @default(1)
  status        String   @default("作成済み")
  createdAt     DateTime @default(now())
  updatedAt     DateTime? @updatedAt
}

model DentalScoringHistory {
  id          Int      @id @default(autoincrement())
  patientId   Int
  visitPlanId Int?
  date        DateTime
  items       Json     // 算定項目リスト
  totalPoints Int
  createdAt   DateTime @default(now())
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
- `dental-scoring-history-actions.ts`

---

## 7. 施設ポータル機能（優先度: 中）

### 概要

モックでは基本UIを実装済み。本番では以下が必要。

### 必要な機能

1. **認証基盤** - 施設ごとのID/パスワード認証（NextAuth or カスタム認証）
2. **専用URL発行** - 施設ごとのユニークなポータルURL生成
3. **アセスメントデータ連携** - 施設が入力したデータをクリニック側にリアルタイム反映
4. **アクセスログ** - 施設側のアクセス履歴の記録・表示
5. **権限管理** - 施設側が編集可能な項目の制御

---

## 8. 履歴・一括印刷機能（優先度: 中）

### 概要

モックでは基本UIを実装済み。本番では以下が必要。

### 必要な機能

1. **PDF一括生成** - フィルタされた診療記録を一括でPDF化
2. **帳票フォーマット** - 施設×月ごとの統合帳票テンプレート
3. **ダウンロード/印刷** - 生成したPDFのダウンロードと印刷機能
4. **S3保存** - 生成した帳票のS3アーカイブ

---

## 実装優先度まとめ

| 優先度 | 項目 | 理由 |
|--------|------|------|
| 高 | 提供文書PDF生成・S3保存 | コア機能、実務必須 |
| 高 | データベース連携 | 本番運用に必須 |
| 中 | 音声メモAI要約 | UX向上、元要件 |
| 中 | 過去履歴参照モーダル | 実務上必要 |
| 低 | 時刻手動変更・履歴 | 運用でカバー可能 |
| 低 | テンプレート追加・編集 | マスタメンテナンス用 |
| 中 | 施設ポータル本番実装 | 認証・データ連携が必要 |
| 中 | 履歴・一括印刷本番実装 | PDF一括生成が必要 |
