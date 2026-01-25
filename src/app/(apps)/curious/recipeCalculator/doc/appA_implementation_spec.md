食品製造原価計算システム 実装仕様書

1. プロジェクト概要

本ドキュメントは、食品製造業（OEM）向けの見積・原価計算アプリケーションの実装仕様を定義するものである。本仕様書に基づき、生成AIを用いてアプリケーションコードを自動生成することを目的とする。

1.1 目的

顧客から受領したレシピ（PDF / テキスト / 画像）をAIで解析し、社内マスタとの照合、外部価格データの取得を経て、製造原価および見積価格を迅速に算出する。
与えられるレシピはさまざまなフォーマットで、その一例を「src/app/(apps)/curious/docs/appA/recipeSampleImage」に記載してある。
基本的には「画像」や「PDF」によってファイルがインプットされ、それをAIで解析して、材料一覧を把握する。

1.2 技術スタック（推奨）

Framework: Next.js 16+ (App Router)
Language: TypeScript
Styling: Tailwind CSS
Icons: Lucide React
UI Components: Shadcn/ui (optional but recommended)

2. データモデル定義 (TypeScript Interfaces)

AIによるコード生成の精度を高めるため、以下の型定義を厳守すること。

2.1 原材料マスタ (MasterIngredient)

社内で管理する標準原価データ。（商品名 輸入/国産 分類 メーカー名 仕入れ先 重量（ｋｇ） 仕入れ価格 キロ単価 歩留率）

2.2 レシピ内食材 (RecipeIngredient)
解析中および計算用にレシピ内で管理される食材データ。

type AnalysisStatus = 'pending' | 'searching' | 'done' | 'error';

interface RecipeIngredient {
id: string;
name: string; // 現在の表示名 (マスタ名 or 解析された名前)
originalName?: string; // OCR解析時の元表記 (例: "北海道産 玉葱")

// 分量・単位
amount: number; // レシピ記載の数値
unit: string; // レシピ記載の単位 ('g', 'kg', 'l', 'ml', 'cc', 'pks' etc.)
weightKg: number; // 計算用換算重量 (kg)

// 単価・コスト
pricePerKg: number; // 適用単価 (円/kg)
yieldRate: number; // 適用歩留まり (%)
cost: number; // 原価小計 (円)

// メタデータ
isExternal: boolean; // true: 外部検索データ, false: 社内マスタ
source: string; // データソース名 (例: "社内マスタ", "楽天市場", "手動入力")
status: AnalysisStatus;// 解析・検索ステータス

// マッチング情報
matchReason?: string; // マスタ照合の理由 (例: "完全一致", "揺らぎ補正")
}

2.3 レシピ設定・計算結果 (RecipeSettings)

interface RecipeSettings {
lossRate: number; // 製造ロス率 (%)
packWeightG: number; // 1パックあたりの充填量 (g)
packagingCost: number; // 包材費 (円/パック)
processingCost: number;// 加工費 (円/パック)
profitMargin: number; // 目標粗利額 (円/パック)
}

interface CostCalculationResult {
totalMaterialCost: number; // 原材料費合計
totalWeightKg: number; // 原材料総重量
productionWeightKg: number; // 製造可能重量 (総重量 \* (1 - ロス率))
packCount: number; // 製造パック数
materialCostPerPack: number; // 1パックあたり原材料費
totalCostPerPack: number; // 1パックあたり製造原価
sellingPrice: number; // 見積提示価格 (税抜)
}

interface Recipe {
id: string;
name: string;
ingredients: RecipeIngredient[];
settings: RecipeSettings;
}

3. コア機能ロジック詳細

3.1 単位変換ロジック (convertToKg)

ユーザー入力またはAI解析された amount と unit を kg に正規化する。

比重の扱い: 本バージョンでは、液体の比重はすべて 1.0 (水換算) と仮定する。

変換ルール:

kg -> そのまま

g -> amount / 1000

l -> amount (比重1.0)

ml, cc -> amount / 1000 (比重1.0)

その他不明単位 -> amount / 1000 (g扱い) または アラート表示

3.2 AI解析・マスタ照合フロー

「AI解析実行」ボタン押下時の処理フロー。非同期処理(async/await)を用いて段階的にUIを更新する。

Phase 1: テキスト解析 (Mock: OCR Simulation)

入力されたテキスト/画像から rawName, amount, unit を抽出。

RecipeIngredient オブジェクトを生成。ステータスは pending。

Phase 2: マスタ照合 (Fuzzy Matching)

rawName と MasterIngredient.name を比較。

完全一致: 即時適用。

揺らぎ一致 (例: "玉葱" == "玉ねぎ"): 適用し、matchReason に "表記揺れ" を記録。

不一致: ステータスを pending のまま維持し、外部検索対象とする。

Phase 3: 外部Web検索 (Mock: Web Crawling Simulation)

マスタ不一致のアイテムに対し、順番に外部検索シミュレーションを実行。

ステータスを searching (ローディング表示) -> done (結果反映) へ遷移。

isExternal: true をセット。

3.3 原価計算ロジック (useCostCalculator hook)

以下の数式に基づいて再計算を行うカスタムフックを実装する。

食材ごとのコスト算出:
$$ \text{実質単価} = \frac{\text{キロ単価}}{(\text{歩留まり} / 100)} $$
$$ \text{食材原価} = \text{実質単価} \times \text{換算重量(kg)} $$

製造全体:
$$ \text{製造可能重量(kg)} = \text{総重量(kg)} \times (1 - \frac{\text{ロス率}}{100}) $$
$$ \text{製造パック数} = \lfloor \frac{\text{製造可能重量(kg)}}{(\text{充填量(g)} / 1000)} \rfloor $$

単価算出:
$$ \text{1パック原価} = \frac{\sum\text{食材原価}}{\text{製造パック数}} + \text{包材費} + \text{加工費} $$
$$ \text{見積提示価格} = \text{1パック原価} + \text{粗利額} $$

注意: パック数が0になる場合（充填量が0または製造可能重量が不足）のゼロ除算エラーを回避すること。

4. UI/UX 実装仕様

4.1 全体レイアウト

レスポンシブ: モバイル時はハンバーガーメニュー、デスクトップ時は左サイドバー固定。

ナビゲーション:

AI原価計算 (Calculator)

原材料マスタ (Ingredient Master)

4.2 画面別仕様

A. AI原価計算画面 (/calculator)

ヘッダー:

レシピ名（編集可能）

「AI解析実行」ボタン（解析中はLoading Spinnerと進捗バーを表示）

ステータスログ表示エリア（「Web検索中: ガラムマサラ...」など）

原材料リスト (Table):

カラム: 食材名, 分量/単位(Select), 換算重量(自動), キロ単価, ソース, 歩留まり, 小計, 削除。

インタラクション:

AIが取得した値（オレンジ色ハイライト）はクリックで編集可能。

行追加ボタンで手動追加可能。

単位変更時に換算重量を即時再計算。

計算結果パネル (Grid):

左側: 製造パラメータ（ロス率、充填量）入力。

右側: 見積サマリ（原価構成、粗利入力、最終価格）。

最終価格は大きく強調表示。

B. 原材料マスタ管理画面 (/master)

機能: 一覧表示、検索フィルター、新規登録モーダル、編集モーダル、削除。

データ連携: ここで更新された単価は、Calculator画面のマスタ照合ロジックに即座に反映されること（Global State推奨）。

5. 自動生成用プロンプトのヒント

AIにコード生成させる際は、以下の点を含めて指示すること。

「単一ファイルではなく、Next.jsの標準的なディレクトリ構成（components/hooks/types）で出力すること」

「Shadcn/ui または Tailwind CSS のクラスをフル活用し、配色は Slate(グレー), Blue(プライマリ), Orange(AI強調) を基調とすること」

「useCostCalculator カスタムフックを個別のファイル hooks/use-cost-calculator.ts に切り出し、ロジックを分離すること」

「デモ用のモックデータ (INITIAL_MASTER_DATA, AI_DEMO_SCENARIO) を定数ファイルに定義し、動作確認がすぐできるようにすること」
