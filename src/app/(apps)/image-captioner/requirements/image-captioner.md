# Image Captioner（画像注釈自動生成アプリ）

## 概要

Image Captionerは、スクリーンショット画像にAIが自動で注釈（吹き出し、矢印、番号など）を付与し、ユーザーマニュアル用の画像を生成するアプリケーションです。さらに、生成した画像からPowerPoint形式のスライド資料を自動生成する機能も備えています。

**主な用途**
- ユーザーマニュアルの作成
- 操作手順書の作成
- システム説明資料の作成

---

## アクセス方法

| 方法           | 詳細                                                           |
| -------------- | -------------------------------------------------------------- |
| URL            | `/image-captioner`                                              |
| ナビゲーション | 画面上部メニュー → **「アプリ」** → **「Image Captioner」** |
| 対象ユーザー   | 全ユーザー（認証不要）                                          |

---

## ユーザー目線の機能一覧

### 機能概要

Image Captionerは4つのステップで構成されるワークフローです：

1. **初期設定 & アップロード**: 画像生成設定と画像ファイルのアップロード
2. **シナリオ入力**: 画面操作の流れを説明したテキストの入力
3. **注釈内容確認・編集**: AIが生成した注釈内容の確認と編集
4. **最終生成**: 注釈付き画像の生成とスライド資料の作成

### Step 1: 初期設定 & アップロード

**機能説明**
画像生成の設定と、注釈を付与したい画像ファイルのアップロードを行います。

**操作手順**
1. **画像生成設定**を選択
   - アスペクト比: 16:9 / 4:3 / 1:1 / 21:9 から選択
   - 解像度: 1024px / 2048px / 3072px / 4K (3840x2160) から選択
2. **画像ファイルをアップロード**
   - ドラッグ&ドロップで画像を追加（最大50件）
   - またはファイル選択ダイアログから選択
   - アップロード済み画像はサムネイル表示
   - 不要な画像は削除可能
3. **「次へ: シナリオ入力」**ボタンをクリック

**データ項目**

| 項目名     | 入力形式 | 必須 | 特記事項                                                                 |
| ---------- | -------- | ---- | ------------------------------------------------------------------------ |
| アスペクト比 | セレクト | -    | デフォルト: 16:9。生成される画像の縦横比を決定                           |
| 解像度     | セレクト | -    | デフォルト: 1024px。生成される画像の解像度を決定。高い解像度ほど処理時間が長い |
| 画像ファイル | ファイル | ✓    | PNG、JPEG、GIF等の画像形式。最大50件までアップロード可能。プレビュー用に800px以下にリサイズされ、元の高解像度画像はAPI送信用に保持 |

**注意事項**
- アップロードされた画像は、プレビュー表示用に自動的にリサイズされますが、API送信時は元の高解像度画像が使用されます
- 画像が多すぎる場合、処理に時間がかかることがあります

### Step 2: シナリオ入力

**機能説明**
画面操作の流れや目的を説明したテキスト（シナリオ）を入力します。このシナリオは、AIが各画像に適切な注釈を生成する際の文脈として使用されます。

**操作手順**
1. **「画面操作のシナリオ」**テキストエリアに、操作手順や目的を入力
   - 例: 「ログイン画面からダッシュボードに遷移する手順を説明します。まず、ユーザー名とパスワードを入力し、ログインボタンをクリックします。」
2. **「Gemini 2.5で画像を分析」**ボタンをクリック
3. 進捗バーで分析の進行状況を確認
4. 分析が完了すると自動的にStep 3に遷移

**データ項目**

| 項目名   | 入力形式 | 必須 | 特記事項                                                                 |
| -------- | -------- | ---- | ------------------------------------------------------------------------ |
| シナリオ | テキスト | ✓    | 画面操作の流れや目的を説明したテキスト。AIが各画像の注釈内容を生成する際の文脈として使用される |

**注意事項**
- シナリオが詳細であるほど、AIが生成する注釈の精度が向上します
- 分析処理は並列実行されるため、複数の画像があっても比較的短時間で完了します

### Step 3: 注釈内容確認・編集

**機能説明**
AIが生成した各画像の注釈内容を確認し、必要に応じて編集できます。また、個別に画像の再分析や画像生成を実行できます。

**操作手順**
1. **各画像カードで注釈内容を確認**
   - 画像のプレビュー
   - 注釈内容（編集可能なテキストエリア）
   - ステータス（分析済み、エラーなど）
2. **注釈内容を編集**（必要に応じて）
   - テキストエリアを直接編集
3. **個別に再分析**（必要に応じて）
   - 「この画像だけ再分析」ボタンをクリック
4. **「Nano Banana Proで一括生成」**ボタンをクリックして画像生成を開始
   - 生成が完了すると自動的にStep 4に遷移

**データ項目**

| 項目名       | 入力形式 | 必須 | 特記事項                                                                 |
| ------------ | -------- | ---- | ------------------------------------------------------------------------ |
| 注釈内容     | テキスト | ✓    | AIが生成した注釈内容。ユーザーが編集可能。画像生成時に使用される         |
| ステータス   | 表示のみ | -    | pending / analyzing / analyzed / generating / completed / error のいずれか |
| エラーメッセージ | 表示のみ | -    | エラーが発生した場合に表示される                                         |

**注意事項**
- 注釈内容は簡潔な説明文です。詳細なスタイル情報（色、位置など）は画像生成時にAIが自動的に決定します
- 画像生成は並列実行されるため、複数の画像があっても比較的短時間で完了します

### Step 4: 最終生成

**機能説明**
生成された注釈付き画像を確認し、個別ダウンロードまたは一括ダウンロードが可能です。また、生成した画像からPowerPoint形式のスライド資料を自動生成できます。

**操作手順**
1. **処理ログを確認**
   - 各画像の処理状況がログ形式で表示
   - エラーが発生した画像は「失敗した画像を再生成」ボタンで再処理可能
2. **生成された画像を確認**
   - 各画像カードで注釈付き画像を確認
   - 進行中の画像には進捗ログがオーバーレイ表示
3. **画像をダウンロード**
   - **「一括ダウンロード」**ボタン: すべての生成済み画像を個別にダウンロード
   - 個別ダウンロード: 各画像カードから個別にダウンロード可能
4. **スライド資料を生成**（オプション）
   - **「スライド資料を生成」**ボタンをクリック
   - AIがスライド構成を自動生成（タイトル、章立て、各スライドのタイトル・説明文）
   - PowerPoint形式（.pptx）で自動ダウンロード

**データ項目**

| 項目名           | 入力形式 | 必須 | 特記事項                                                                 |
| ---------------- | -------- | ---- | ------------------------------------------------------------------------ |
| 生成画像URL      | 表示のみ | -    | 注釈付き画像のURL。Base64形式のData URL                                  |
| 処理ログ         | 表示のみ | -    | 各画像の処理状況。info / success / error / warning のいずれか           |
| スライド構成     | 自動生成 | -    | AIが生成したスライド構成（タイトル、章立て、各スライドのタイトル・説明文） |

**注意事項**
- スライド生成時は、AIがシナリオと画像の注釈内容を分析して、適切なスライド構成を自動生成します
- スライドには、タイトルスライド、章タイトルスライド、各画像スライドが含まれます
- 各スライドには、AIが生成したタイトル、サブタイトル、説明文が装飾付きで配置されます

---

## 設計者目線の詳細仕様

### コンポーネント構成

```
image-captioner/
├── (pages)/
│   ├── page.tsx                    # メインページ（クライアントコンポーネント）
│   └── test-generate/
│       └── page.tsx                # 画像生成テスト用ページ
├── components/
│   ├── Stepper.tsx                  # ステップナビゲーション
│   ├── ImageUploader.tsx           # 画像アップロード（ドラッグ&ドロップ対応）
│   ├── ContextInput.tsx            # シナリオ入力コンポーネント
│   ├── ImageCard.tsx               # 画像カード表示（編集・再生成機能付き）
│   └── ProcessLog.tsx              # 処理ログ表示
├── hooks/
│   └── useImageCaptioner.tsx       # アプリケーション状態管理フック
├── types/
│   └── index.ts                     # 型定義
├── utils/
│   └── generatePptx.ts             # PPTXスライド生成ユーティリティ
└── api/
    ├── analyze/
    │   └── route.ts                 # 画像分析API（クライアント側）
    └── generate/
        └── route.ts                 # 画像生成API（クライアント側）
```

**APIルート**
```
/api/image-captioner/
├── analyze/
│   └── route.ts                    # Gemini 2.5 Flash 画像分析API
├── generate/
│   └── route.ts                    # Gemini 3 Pro Image Preview 画像生成API
└── generate-slide-structure/
    └── route.ts                    # スライド構成生成API
```

### データフロー

```
page.tsx (RCC)
↓ [useImageCaptioner Hook で状態管理]
├── Step 1: 画像アップロード
│   └── ImageUploader.tsx
│       ↓ [addImages で画像を追加、Canvas APIでリサイズ]
│       └── ImageItem[] (state.images)
│
├── Step 2: シナリオ入力
│   └── ContextInput.tsx
│       ↓ [setScenario でシナリオを設定]
│       └── handleAnalyze()
│           ↓ [並列処理: Promise.allSettled]
│           └── /api/image-captioner/analyze
│               ↓ [Gemini 2.5 Flash API]
│               └── AnalyzeResponse (annotation)
│
├── Step 3: 注釈内容確認・編集
│   └── ImageCard.tsx
│       ↓ [updateImage で注釈内容を更新]
│       └── handleGenerate()
│           ↓ [並列処理: Promise.allSettled]
│           └── /api/image-captioner/generate
│               ↓ [Gemini 3 Pro Image Preview API]
│               └── GenerateResponse (imageUrl)
│
└── Step 4: 最終生成
    ├── 画像ダウンロード
    │   └── handleDownloadAll()
    │       └── file-saver でダウンロード
    │
    └── スライド生成
        └── handleGeneratePptx()
            ↓ [generateSlideStructure()]
            └── /api/image-captioner/generate-slide-structure
                ↓ [Gemini 2.5 Flash API]
                └── SlideStructure
                    ↓ [generatePptx()]
                    └── pptxgenjs でPPTX生成
```

### URLクエリパラメータ

本アプリケーションは、クエリパラメータを使用しません。すべての状態はReactの状態管理（`useImageCaptioner`フック）で管理されます。

### 主要な型定義

```typescript
// 画像アイテム
interface ImageItem {
  id: string
  file: File
  preview: string                    // base64 data URL（プレビュー用、低解像度）
  originalBase64?: string            // 元のファイルのBase64（API送信用、高解像度）
  annotation: string                 // 注釈内容（簡潔な説明）
  annotationPrompt: string           // AIが生成した注釈プロンプト（画像生成用の詳細な指示）
  generatedImageUrl?: string         // 生成された画像のURL
  status: 'pending' | 'analyzing' | 'analyzed' | 'generating' | 'completed' | 'error'
  error?: string
}

// アプリケーション設定
interface AppSettings {
  aspectRatio: '16:9' | '4:3' | '1:1' | '21:9'
  resolution: '1024' | '2048' | '3072' | '4K'
}

// アプリケーション状態
interface AppState {
  step: 1 | 2 | 3 | 4
  settings: AppSettings
  images: ImageItem[]
  scenario: string                   // 画面操作の流れを説明したテキスト（シナリオ）
  isProcessing: boolean
  logs: LogEntry[]
}

// スライド構成
interface SlideStructure {
  presentationTitle: string
  chapters: Array<{
    title: string
    slides: SlideContent[]
  }>
}

interface SlideContent {
  title: string
  subtitle?: string
  description?: string
  imageIndex: number                // 対応する画像のインデックス（1ベース）
}
```

### API仕様

#### POST /api/image-captioner/analyze

**リクエスト**
```json
{
  "imageBase64": "data:image/png;base64,...",
  "scenario": "画面操作のシナリオ..."
}
```

**レスポンス**
```json
{
  "success": true,
  "annotation": "ボタンをクリックして次の画面に遷移"
}
```

**処理内容**
- Gemini 2.5 Flash APIを使用して画像を分析
- シナリオを文脈として、各画像に必要な注釈内容を生成
- リトライ機能付き（最大2回）
- 空レスポンスを防ぐためのフォールバック処理あり

#### POST /api/image-captioner/generate

**リクエスト**
```json
{
  "imageBase64": "data:image/png;base64,...",
  "annotation": "ボタンをクリックして次の画面に遷移",
  "aspectRatio": "16:9",
  "resolution": "2048"
}
```

**レスポンス**
```json
{
  "success": true,
  "imageUrl": "data:image/png;base64,..."
}
```

**処理内容**
- Gemini 3 Pro Image Preview APIを使用して画像を生成
- 注釈内容を基に、AIが詳細なスタイル情報（色、位置、装飾）を決定
- 注釈は現代的でスタイリッシュなデザインで生成
- 吹き出しには色のティントと強いボーダー・シャドウを適用
- リトライ機能付き（最大2回）

#### POST /api/image-captioner/generate-slide-structure

**リクエスト**
```json
{
  "scenario": "画面操作のシナリオ...",
  "images": [
    {
      "annotation": "ボタンをクリックして次の画面に遷移"
    }
  ]
}
```

**レスポンス**
```json
{
  "success": true,
  "structure": {
    "presentationTitle": "ユーザーマニュアル",
    "chapters": [
      {
        "title": "基本操作",
        "slides": [
          {
            "title": "ログイン画面",
            "subtitle": "ユーザー認証",
            "description": "ユーザー名とパスワードを入力してログインします",
            "imageIndex": 1
          }
        ]
      }
    ]
  }
}
```

**処理内容**
- Gemini 2.5 Flash APIを使用してスライド構成を生成
- シナリオと画像の注釈内容を分析
- 資料のタイトル、章立て、各スライドのタイトル・サブタイトル・説明文を生成

### 計算ロジック・ビジネスロジック

#### 画像リサイズ処理

```typescript
// useImageCaptioner.tsx 内
const resizeImageForPreview = (file: File): Promise<{preview: string, originalBase64: string}> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 800
        let width = img.width
        let height = img.height

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width
            width = maxSize
          } else {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        const preview = canvas.toDataURL('image/png')
        const originalBase64 = e.target?.result as string
        resolve({ preview, originalBase64 })
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}
```

**処理内容**
- プレビュー用に画像を最大800pxにリサイズ
- 元の高解像度画像は`originalBase64`として保持
- API送信時は`originalBase64`を使用して分析精度を向上

#### 並列処理

```typescript
// page.tsx 内
const results = await Promise.allSettled(
  imagesToProcess.map((image, index) => processImage(image, index))
)
```

**処理内容**
- 画像分析、画像生成、再生成処理はすべて並列実行
- `Promise.allSettled`を使用して、一部の画像が失敗しても他の画像の処理を継続
- エラーが発生した画像は個別に再処理可能

### テーブル定義

本アプリケーションはデータベースを使用しません。すべてのデータはクライアント側の状態管理（React State）で管理されます。

---

## 機能間の関連性・影響範囲

**他機能との関連**

| 関連機能 | 影響内容 |
| -------- | -------- |
| **なし** | 本アプリケーションは独立した機能で、他の機能との連携はありません |

**外部API依存**

| 外部サービス | 用途 | 影響内容 |
| ----------- | ---- | -------- |
| **Google Gemini API** | 画像分析・画像生成・スライド構成生成 | `GEMINI_API_KEY`環境変数が必須。APIキーが設定されていない場合、すべての機能が動作しません |

**依存ライブラリ**

| ライブラリ | 用途 | バージョン |
| ---------- | ---- | ---------- |
| **pptxgenjs** | PPTXスライド生成 | 4.0.1 |
| **file-saver** | ファイルダウンロード | 2.0.5 |
| **react-dropzone** | ドラッグ&ドロップ画像アップロード | 14.2.3 |
| **lucide-react** | アイコン表示 | 0.511.0 |

---

## ナビゲーション構造

```
アプリ
└── Image Captioner ← 本ページ
```

---

## チェックリスト

### ドキュメント全体の構成

- [x] README.md（索引）が作成されている
- [x] 機能別にドキュメントが分割されている
- [x] 類似機能は適切にまとめられている（または分割されている）

### 各ドキュメントの内容

- [x] アクセス方法（URL + ナビゲーション経路）が記載されている
- [x] 各データ項目に特別な事情・注意点が記載されている
- [x] 他機能との関連性が表形式で明記されている
- [x] 入力フォーマットやバリデーションルールが記載されている
- [x] 必須項目が明確にマークされている
- [x] データが未設定の場合の影響が記載されている
- [x] ビジネスロジックへの影響が記載されている

### 設計者向け情報

- [x] コンポーネント構成が記載されている
- [x] データフローが記載されている
- [x] URLクエリパラメータが記載されている
- [x] 重要な計算ロジックがコード例付きで記載されている
- [x] 主要な型定義が記載されている
- [x] テーブル定義（カラム、制約、リレーション）が記載されている（データベース不使用のため該当なし）

### 運用・導入支援

- [x] 導入時の確認事項がチェックリスト形式で記載されている
- [x] 運用時の注意事項が記載されている
- [x] よくあるトラブルと対処法が記載されている（該当する場合）

---

## 導入時の確認事項

### 環境変数設定

- [ ] `GEMINI_API_KEY`が設定されている
  - Google AI StudioからAPIキーを取得
  - `.env.local`または環境変数に設定

### 依存ライブラリのインストール

- [ ] `pptxgenjs`がインストールされている
  ```bash
  npm install pptxgenjs
  ```
- [ ] `file-saver`がインストールされている（既存プロジェクトに含まれている場合）

### 動作確認

- [ ] 画像アップロードが正常に動作する
- [ ] 画像分析APIが正常に動作する（Gemini APIキーが有効）
- [ ] 画像生成APIが正常に動作する（Gemini APIキーが有効）
- [ ] スライド生成が正常に動作する
- [ ] エラーハンドリングが適切に動作する

---

## 運用時の注意事項

### API制限

- **Gemini API**: リクエスト数やトークン数に制限がある場合があります
- 大量の画像を処理する場合は、API制限に注意してください

### パフォーマンス

- 画像の解像度が高いほど、処理時間が長くなります
- 並列処理により、複数の画像を同時に処理できますが、API制限に達する可能性があります

### エラーハンドリング

- 画像分析や画像生成が失敗した場合、個別に再処理できます
- 「失敗した画像を再生成」ボタンを使用して、エラーが発生した画像のみを再処理できます

---

## よくあるトラブルと対処法

### 問題: 画像分析が失敗する

**原因**
- Gemini APIキーが設定されていない
- APIキーが無効
- 画像のサイズが大きすぎる

**対処法**
1. `GEMINI_API_KEY`環境変数を確認
2. Google AI StudioでAPIキーの有効性を確認
3. 画像のサイズを確認（非常に大きな画像の場合はリサイズを検討）

### 問題: 画像生成が失敗する

**原因**
- Gemini 3 Pro Image Preview APIの制限
- ネットワークエラー
- 画像データの形式が不正

**対処法**
1. 「失敗した画像を再生成」ボタンで再処理
2. ネットワーク接続を確認
3. 画像ファイルの形式を確認（PNG、JPEG、GIF等）

### 問題: スライド生成が失敗する

**原因**
- 生成済みの画像が存在しない
- スライド構成生成APIのエラー

**対処法**
1. Step 4で生成済みの画像が存在することを確認
2. ブラウザのコンソールでエラーログを確認
3. 必要に応じて、画像生成を再実行

### 問題: 注釈内容が空になる

**原因**
- AIが画像を認識できない
- シナリオが不十分

**対処法**
1. シナリオをより詳細に記述
2. 画像の品質を確認（解像度が低すぎないか）
3. 「この画像だけ再分析」ボタンで再処理

---

## 今後の拡張可能性

- **画像形式の拡張**: SVG、WebP等の形式に対応
- **スライドテンプレート**: カスタムテンプレートの選択機能
- **バッチ処理**: 大量の画像を効率的に処理する機能
- **エクスポート形式の拡張**: PDF、HTMLスライド形式でのエクスポート
- **コラボレーション機能**: 複数ユーザーでの共同編集機能

