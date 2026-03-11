# 設計書 — AI行政書士くん II

> 最終更新: 2026-03-10（0310-MTG 決定事項 + 追加仕様を反映）

---

## 概要

補助金採択後の事業者が「何をすべきか」を把握するための、AI やることリスト自動生成ツール。
事業計画書・公募要領・採択状況を入力すると、AI がタスク一覧と実績報告ガイドを生成する。

- **提供元**: 保利国際法務事務所
- **開発**: 合同会社改善マニア
- **URL**: `https://kaizen-mania.com/KM/mocks/gyosei-ii`
- **ログイン**: 不要（公開ページ）

---

## 利用フロー

```
利用規約同意 → STEP1 → STEP2 → STEP3 → AI分析中 → 結果表示
```

| ステップ | 内容                                                     |
| -------- | -------------------------------------------------------- |
| 利用規約 | 保利国際法務事務所の利用規約・プライバシーポリシーに同意 |
| STEP1    | 事業計画書PDF のアップロード                             |
| STEP2    | 公募要領PDF のアップロード                               |
| STEP3    | 採択日・交付決定日の入力                                 |
| 分析中   | AI がデータを解析（プログレス表示）                      |
| 結果表示 | やることリスト（テーブル）＋ 実績報告ガイド（Markdown）  |

---

## 入力仕様

### STEP1: 事業計画書PDF

| 項目           | 詳細                   |
| -------------- | ---------------------- |
| メインファイル | 必須・1ファイル（PDF） |
| 追加ファイル   | 任意・N個（PDF）       |
| ファイルサイズ | 1ファイルあたり最大5MB |

> **MTG変更点**: モック実装では固定2個だったが、任意個数に変更。

### STEP2: 公募要領PDF

| 項目     | 詳細                   |
| -------- | ---------------------- |
| 公募要領 | 必須・1ファイル（PDF） |

> **MTG変更点**: モック実装ではURL入力だったが、PDFアップロードに統一。

### STEP3: 採択・交付決定状況

| 項目           | 型                                           | 必須                   |
| -------------- | -------------------------------------------- | ---------------------- |
| 交付申請の状況 | セレクト（未申請 / 申請済み / 交付決定済み） | ○                      |
| 採択日         | 日付（カレンダー）                           | ○                      |
| 交付決定日     | 日付（カレンダー）                           | 交付決定済みの場合のみ |

---

## 出力仕様

### やることリスト（テーブル形式）

約20件のタスクを以下のカラムで表示する。

| カラム       | 内容                                       |
| ------------ | ------------------------------------------ |
| タイトル     | タスク名称                                 |
| 詳細         | タスクの具体的な内容・手順                 |
| 期限         | 目安の期限（採択日・交付決定日基準で算出） |
| 関係者・相手 | そのタスクに関わる外部関係者               |
| 自社担当者   | 社内の担当者（経理、代表者など）           |
| カテゴリ     | 交付申請 / 経費管理 / 中間報告 / 実績報告 / その他 |
| 優先度       | high / medium / low                        |

### 実績報告ガイド（Markdown形式）

補助金の実績報告に必要な手順・注意事項をMarkdown で出力する。

- 実績報告の概要と目的
- 必要書類のチェックリスト
- 提出期限と注意事項
- よくあるミスと対策
- 経費の証拠書類の保管方法

---

## Excel配信機能

### フロー

1. 結果画面に「Excelで受け取る」ボタンを表示
2. メールアドレスを入力
3. サーバー側でExcelファイルを生成し、メール送付

### Excelファイル構成

| シート番号 | シート名     | 内容                                       |
| ---------- | ------------ | ------------------------------------------ |
| 1枚目      | 弊社紹介     | 合同会社改善マニアの紹介文                 |
| 2枚目      | やることリスト | AI生成タスク一覧（テーブル形式）          |

### 1枚目: 弊社紹介シート

合同会社改善マニアについての紹介文を記載する。
**シート名・紹介文の内容は定数ファイルで管理し、簡単に変更可能とする。**

```typescript
// 定数定義例（gyosei/lib/constants.ts）

export const EXCEL_CONFIG = {
  // 弊社紹介シート
  introSheet: {
    sheetName: '弊社紹介',
    companyName: '合同会社改善マニア',
    content: [
      '合同会社改善マニアは、業務改善とIT活用のプロフェッショナルです。',
      '',
      '■ 事業内容',
      '・業務改善コンサルティング',
      '・Webアプリケーション開発',
      '・AIソリューション導入支援',
      '・補助金申請サポート',
      '',
      '■ 連絡先',
      'メール: info@kaizen-mania.com',
      'Web: https://kaizen-mania.com',
    ],
    // ロゴ画像パス（任意）
    logoPath: null as string | null,
  },

  // やることリストシート
  taskSheet: {
    sheetName: 'やることリスト',
    headers: ['カテゴリ', 'タスク', '期限', '担当者', '優先度', '備考'],
  },

  // ファイル名テンプレート
  fileNameTemplate: '補助金やることリスト_{date}.xlsx',
} as const
```

### 2枚目: やることリストシート

AIが生成したタスク一覧を表形式で記載。

| カラム   | 内容                         |
| -------- | ---------------------------- |
| カテゴリ | 交付申請/経費管理/中間報告等 |
| タスク   | タスク内容                   |
| 期限     | 期限                         |
| 担当者   | 担当者                       |
| 優先度   | high/medium/low              |
| 備考     | 注意点                       |

### Excel生成ライブラリ

- **exceljs** を使用（サーバーサイドで生成）
- Server Action 内でExcel生成 → メール送信

---

## Gemini API連携 — ファイル送信方式

### 方針: Gemini File API を使用（base64ではなく）

base64エンコードでのインライン送信は、大きなPDFファイルでAPIリクエストサイズ制限に抵触するリスクがある。
**Gemini File API（files.upload）を使用し、ファイルを事前にアップロードしてからURIで参照する方式に変更する。**

### File API の流れ

```
1. クライアント: PDFファイルを選択
2. Server Action: Gemini File API（media/upload）にPDFをアップロード
3. Server Action: アップロード完了後に返却されるファイルURIを取得
4. Server Action: generateContent リクエストで fileData.fileUri として参照
5. Gemini: ファイルを読み取り、分析結果を返却
```

### 実装詳細

```typescript
// Gemini File API アップロード
const uploadEndpoint = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`

// multipart/related でアップロード
const metadata = JSON.stringify({
  file: { displayName: fileName }
})

const formData = new FormData()
formData.append('metadata', new Blob([metadata], { type: 'application/json' }))
formData.append('file', fileBuffer) // Buffer or Blob

const uploadResponse = await fetch(uploadEndpoint, {
  method: 'POST',
  body: formData,
})

const { file } = await uploadResponse.json()
// file.uri → "https://generativelanguage.googleapis.com/v1beta/files/xxx"

// generateContent で参照
const parts = [
  { fileData: { mimeType: 'application/pdf', fileUri: file.uri } },
  { text: prompt },
]
```

### メリット

| 項目             | base64（現行）            | File API（変更後）          |
| ---------------- | ------------------------- | --------------------------- |
| リクエストサイズ | ファイルサイズ×1.37倍に膨張 | メタデータのみ（軽量）     |
| 大容量PDF対応    | 制限あり（約10MB目安）    | 最大2GB                     |
| API制限リスク    | 高い                      | 低い                        |
| アップロード管理 | 不要                      | 48時間で自動削除            |
| 実装複雑度       | 低い                      | やや高い（2段階リクエスト） |

### geminiAPI.tsx への変更

既存の `GeminiInlineData` 型に加え、`GeminiFileData` 型を追加する。

```typescript
// 追加する型
export interface GeminiFileData {
  mimeType: string
  fileUri: string
}

// GeminiRequestOptions に追加
export interface GeminiRequestOptions {
  // ... 既存プロパティ
  fileData?: GeminiFileData[]  // File API経由のファイル参照
}

// ファイルアップロード関数を追加
export async function uploadFileToGemini(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  apiKey?: string
): Promise<{ success: boolean; fileUri?: string; error?: string }>
```

---

## 利用制限

| 条件                   | 制限                        |
| ---------------------- | --------------------------- |
| 同一端末・同一ブラウザ | 1日2回まで                  |
| 判定方法               | localStorage による回数管理 |

---

## 技術構成

| 項目           | 技術                                     |
| -------------- | ---------------------------------------- |
| AI モデル      | Gemini 2.5 Flash                         |
| AI パラメータ  | maxOutputTokens: 16384, temperature: 0.3 |
| PDF送信方式    | Gemini File API（URIベース）             |
| データ保存     | localStorage（サーバー側DB不使用）       |
| フレームワーク | Next.js App Router（Server Actions）     |
| Excel生成      | exceljs（サーバーサイド）                |
| メール送信     | Resend / nodemailer（要選定）            |

---

## 利用規約

保利国際法務事務所が提供する利用規約・プライバシーポリシーを初回表示時に同意画面として提示する。

**主な条項:**

- **機密情報のマスキング**: ユーザー自身の責任でマスキングを実施すること
- **AI の特性**: 常に正確な回答を保証するものではない
- **成果物の確認義務**: 生成された情報は参考情報としての利用に留める
- **データ利用**: サービス品質向上の目的で利用される場合がある
- **免責・損害賠償請求の放棄**: 利用に起因する損害について当事務所は一切の責任を負わない
- **個人情報保護**: 個人情報保護法に基づき適切に管理、第三者提供なし
- **問い合わせ先**: 〒815-0037 福岡県福岡市南区玉川町13-3 / 050-5526-5506

---

## モック画像

| 画面                        | ファイル                    |
| --------------------------- | --------------------------- |
| 利用規約画面                | `mockImage/mock-image①.png` |
| STEP1（計画書アップロード） | `mockImage/mock-image②.png` |
| STEP2（公募要領）           | `mockImage/mock-image③.png` |
| STEP3（採択状況入力）       | `mockImage/mock-image④.png` |
| AI分析中                    | `mockImage/mock-image⑤.png` |
| 結果表示                    | `mockImage/mock-image⑥.png` |

---

## ファイル構成（実装予定）

```
gyosei/
├── page.tsx                    # メインページ（ステップウィザードUI）
├── layout.tsx                  # メタデータ定義
├── _actions.ts                 # Server Actions（Gemini連携・Excel生成・メール送信）
├── lib/
│   └── constants.ts            # Excel設定・弊社紹介文などの定数
└── gyosei-doc/                 # ドキュメント
    ├── spec-gyosei.md          # 本設計書
    ├── spec-schedule.md        # スケジュール秘書設計書
    ├── estimate/               # 見積もり
    ├── riyokiyaku.txt          # 利用規約
    └── mockImage/              # モック画像
```

---

## 情報ソース

| ソース                       | パス                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| モック実装（ページ）         | `gyosei/page.tsx`                                            |
| モック実装（Server Actions） | `gyosei/_actions.ts`                                         |
| MTG議事メモ（0310）          | `gyosei-doc/0310-mtg/memo.txt`                               |
| 初期要望                     | `gyosei-doc/request.txt`                                     |
| 利用規約                     | `gyosei-doc/riyokiyaku.txt`                                  |
| モック画像                   | `gyosei-doc/mockImage/mock-image①〜⑥.png`                    |
