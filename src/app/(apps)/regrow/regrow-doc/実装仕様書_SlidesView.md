# Regrow アプリ - スライド資料実装仕様書

## 概要

月次業績レポートを16枚のスライドで表示するアプリケーション。店舗ごとの業績データを可視化し、前月比較や年間推移を確認できる。

**最終更新日**: 2026-02-10

---

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **UI**: React (Client Components)
- **グラフライブラリ**: Recharts
- **スタイリング**: Tailwind CSS
- **データ管理**: React Context (DataContext)
- **モックデータ**: 定数ベース（mockData.ts）

---

## 主要ファイル構成

```
src/app/(apps)/regrow/
├── components/
│   └── views/
│       ├── SlidesView.tsx          # メインスライド表示コンポーネント（16スライド）
│       └── GuidanceView.tsx        # データ入力・ガイダンス画面
├── context/
│   └── DataContext.tsx             # データ管理コンテキスト
├── lib/
│   ├── storage.ts                  # データ保存・読み込み
│   └── mockData.ts                 # 12ヶ月分のモックデータ定義
└── doc/
    ├── MTG資料スライド.pdf         # 元となる仕様書（PDF）
    └── 実装仕様書_SlidesView.md    # 本ファイル
```

---

## スライド構成（全16スライド）

### スライド1: タイトルスライド

- 月次業績レポートのタイトル表示
- 対象年月を表示（例: 2026年2月）

### スライド2: 目次

- 各セクションの概要を列挙
- 全体サマリー、年間推移、スタッフパフォーマンス、前月比較など

### スライド3: 全体サマリー

- **表示内容**: 6つの主要指標
  - 売上金額
  - 稼働率
  - 客単価
  - 再来率
  - 失客率
  - 店舗コメント
- **フィルタリング**: グローバル店舗フィルタkが適用される
- **レイアウト**: グリッドレイアウト（2x3）

### スライド4-7: 指標別年間推移

各スライドで1指標の年間推移（12ヶ月）を折れ線グラフで表示

- **スライド4**: 客単価の年間推移
- **スライド5**: 稼働率の年間推移
- **スライド6**: 再来率の年間推移
- **スライド7**: 失客率の年間推移

**グラフ仕様**:

- X軸: 月（1月〜12月）
- Y軸: 各指標の値
- 店舗ごとに異なる色のLine（新潟西店: 赤、三条店: 青、新潟中央店: 緑）
- ResponsiveContainer固定高さ: 500px

### スライド8: 全指標統合グラフ（新規追加）

- **表示内容**: 4指標（客単価、稼働率、再来率、失客率）を1つのグラフに重ね合わせ
- **グラフ仕様**:
  - 選択された店舗 × 4指標の全組み合わせを表示
  - 各指標の色分け:
    - 客単価: 赤 (#DC3545)
    - 稼働率: 青 (#4285F4)
    - 再来率: 緑 (#34A853)
    - 失客率: オレンジ (#FFA500)
  - Legend表示: `店舗名 - 指標名` 形式
  - 注意書き: 各指標の単位が異なることを明示
- **用途**: 複数指標の相関関係や傾向を一目で把握

### スライド9: スタッフ別パフォーマンステーブル

- **表示項目**: 10列
  - 名前、店舗、売上、稼働率、客単価、施術時間、指名件数、指名率、再来率、CS登録率
- **表示件数**: 最大10件
- **フィルタリング**: 選択された店舗のスタッフのみ表示

### スライド10: スタッフ稼働率グラフ

- **グラフ種類**: 縦棒グラフ
- **独立月選択**: スライド内で独自の月選択UI
- **表示内容**: スタッフごとの稼働率（%）
- **ResponsiveContainer固定高さ**: 500px

### スライド11-14: 先月比較（テーブル・グラフ）

**スライド11**: スタッフ別先月比①テーブル（売上金額/指名件数）

- 今月・先月・差分を表形式で表示
- プラスは緑、マイナスは赤で色分け

**スライド12**: スタッフ別先月比①グラフ（売上金額/指名件数）

- ComposedChart（Bar + Line）
- 左Y軸: 売上金額（Bar）
- 右Y軸: 指名件数（Line）
- 今月・先月を色分け表示
- ResponsiveContainer固定高さ: 500px

**スライド13**: スタッフ別先月比②テーブル（再来率/客単価）

- 今月・先月・差分を表形式で表示
- プラスは緑、マイナスは赤で色分け

**スライド14**: スタッフ別先月比②グラフ（再来率/客単価）

- ComposedChart（Bar + Line）
- 左Y軸: 客単価（Bar）
- 右Y軸: 再来率（Line）
- 今月・先月を色分け表示
- ResponsiveContainer固定高さ: 500px

### スライド15: 予備ページ

- 将来的な追加コンテンツ用

### スライド16: お客様の声

- 顧客フィードバックやコメント表示用

---

## グローバル店舗フィルタ

### 概要

全スライドに共通適用される店舗選択フィルタ

### 実装詳細

- **位置**: 画面下部固定（`position: fixed`）
- **デフォルト**: 全店舗選択済み
- **UI**: チェックボックス形式
  - 新潟西店
  - 三条店
  - 新潟中央店
- **動作**: チェックを外すと該当店舗とその所属スタッフのデータが非表示

### 状態管理

```typescript
const allStores: StoreName[] = ['新潟西店', '三条店', '新潟中央店']
const [selectedStores, setSelectedStores] = useState<StoreName[]>(allStores)
```

---

## ResponsiveContainer描画最適化

### 背景

パーセンテージベースの高さ（`height="75%"`）を使用すると、親要素の高さが曖昧な場合にResponsiveContainerが正しく描画されない問題が発生。

### 解決策

全グラフスライドで以下の修正を実施：

1. **親divから `h-full` を削除**

   ```typescript
   // Before
   <div className="h-full p-8">

   // After
   <div className="p-8">
   ```

2. **ResponsiveContainerを固定高さに変更**

   ```typescript
   // Before
   <ResponsiveContainer width="100%" height="75%">

   // After
   <ResponsiveContainer width="100%" height={500}>
   ```

3. **空の状態表示も固定高さに統一**

   ```typescript
   // Before
   <div className="flex items-center justify-center h-3/4">

   // After (グラフ用)
   <div className="flex items-center justify-center" style={{height: '500px'}}>

   // After (テーブル用)
   <div className="flex items-center justify-center" style={{height: '400px'}}>
   ```

### 適用スライド

- スライド4-8: 年間推移グラフ（500px）
- スライド10: スタッフ稼働率グラフ（500px）
- スライド12, 14: 先月比グラフ（500px）
- スライド3, 9, 11, 13: テーブル空状態（400px）

---

## モックデータ仕様

### ファイル

`src/app/(apps)/regrow/lib/mockData.ts`

### データ期間

2026年1月〜12月（12ヶ月分）

### データ構造

```typescript
export const MOCK_DATA: Record<YearMonth, MonthlyData> = {
  '2026-01': { ... },
  '2026-02': { ... },
  ...
  '2026-12': { ... }
}
```

### 季節性の考慮

月ごとに以下の倍率を適用して現実的なデータを生成：

```typescript
const multipliers: Record<number, number> = {
  1: 0.9, // 1月: 閑散期
  2: 1.0, // 2月: 通常
  3: 1.1, // 3月: 繁忙期開始
  4: 1.2, // 4月: 繁忙期
  5: 1.3, // 5月: ピーク
  6: 1.0, // 6月: 通常
  7: 1.05, // 7月: やや繁忙
  8: 1.1, // 8月: 夏季
  9: 1.2, // 9月: 秋口繁忙
  10: 1.3, // 10月: 繁忙期
  11: 1.4, // 11月: 年末前
  12: 1.5, // 12月: 年末ピーク
}
```

### 生成データ内容

- **店舗別データ**: 売上、稼働率、客単価、再来率、失客率
- **スタッフ別データ**: 各スタッフの詳細パフォーマンス（30名分）
- **手動入力データ**: 店舗コメント、顧客の声、スタッフ稼働率
- **インポートデータ**: CSVから取り込む想定のデータ

---

## コンポーネント設計

### SlidesView（メインコンポーネント）

```typescript
export const SlidesView = () => {
  // グローバル店舗フィルタ状態
  const [selectedStores, setSelectedStores] = useState<StoreName[]>(allStores)

  return (
    <div>
      {/* グローバル店舗フィルタ（画面下部固定） */}
      <GlobalStoreFilter />

      {/* スライド1-16 */}
      <SlideContainer slideNumber={1}>
        <Slide1TitleSlide />
      </SlideContainer>
      {/* ... */}
    </div>
  )
}
```

### SlideContainer

- スライド番号表示（右上）
- 最小高さ: 600px
- 背景: 白、影付き、角丸

### 個別スライドコンポーネント

各スライドは独立したコンポーネントとして実装：

- `Slide1TitleSlide`
- `Slide2TableOfContents`
- `Slide3OverallSummary`
- `Slide4MetricComparison` (スライド4-7で共通利用)
- `Slide7_1AllMetricsComparison`（スライド8）
- `Slide8StaffPerformanceTable`（スライド9）
- `Slide9StaffUtilizationChart`（スライド10）
- `Slide10PreviousMonthComparison1Table`（スライド11）
- `Slide11PreviousMonthComparison1Chart`（スライド12）
- `Slide12PreviousMonthComparison2Table`（スライド13）
- `Slide13PreviousMonthComparison2Chart`（スライド14）
- `Slide14Spare`（スライド15）
- `Slide15CustomerVoice`（スライド16）

---

## データフロー

### 1. データ取得

```typescript
// DataContextから現在の月データを取得
const {monthlyData, currentYearMonth} = useDataContext()

// モックデータから過去月データを取得
const previousMonthData = getMonthlyData(previousMonth)
```

### 2. フィルタリング

```typescript
// 選択された店舗でフィルタリング
const filteredData = allData.filter(item => selectedStores.includes(item.storeName))
```

### 3. グラフ描画

```typescript
<ResponsiveContainer width="100%" height={500}>
  <ComposedChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line dataKey="売上" stroke="#DC3545" />
  </ComposedChart>
</ResponsiveContainer>
```

---

## スタイリング方針

### Tailwind CSSクラス

- **パディング**: `p-8`, `p-12`（スライドの種類によって調整）
- **テキスト**: `text-3xl font-bold`（見出し）、`text-sm`（小さい文字）
- **カラー**:
  - 紫系: `bg-purple-600`, `border-purple-600`（アクセント）
  - グレー系: `bg-gray-100`, `text-gray-700`（背景・テキスト）
  - 赤/緑: 差分表示の色分け

### グラフカラーパレット

- **新潟西店**: `#DC3545`（赤）
- **三条店**: `#4285F4`（青）
- **新潟中央店**: `#34A853`（緑）
- **失客率**: `#FFA500`（オレンジ）

---

## パフォーマンス最適化

### 1. メモ化

- 大きなデータセットの計算結果はuseMemoでキャッシュ
- コンポーネントの再レンダリングを最小化

### 2. データフィルタリングの最適化

- フィルタリングロジックは各スライドで実行（共通ロジック化を検討）
- 空データのチェックを事前に実施

### 3. 遅延ロード（今後の検討事項）

- スライドの表示時に初めてレンダリングする仕組み
- IntersectionObserverを使った実装

---

## 今後の拡張予定

### 1. データ入力機能の完成

- GuidanceViewからのCSVインポート
- 手動入力フォームの実装
- データ保存機能の強化

### 2. PDF出力機能

- react-pdfやjsPDFを使ったPDF生成
- 全スライドを一括でPDF化

### 3. 印刷最適化

- `@media print` によるレイアウト調整
- ページブレークの制御

### 4. データ比較機能

- 複数月のデータ比較
- 前年同月比の追加

### 5. スライド15, 16の実装

- 予備ページのコンテンツ決定
- お客様の声の表示形式確定

---

## トラブルシューティング

### グラフが表示されない場合

1. **データが存在するか確認**
   - `console.log`でデータを確認
   - モックデータが正しく読み込まれているか確認

2. **ResponsiveContainerの高さを確認**
   - 固定高さ（500px）が設定されているか
   - 親要素に `h-full` が残っていないか

3. **店舗フィルタの状態を確認**
   - `selectedStores` が空配列でないか
   - フィルタリングロジックが正しく動作しているか

### 文字化けが発生する場合

- UTF-8エンコーディングを確認
- 日本語フォントが正しく読み込まれているか確認

---

## 変更履歴

### 2026-02-10

- ResponsiveContainer高さ問題を修正（パーセンテージ → 固定px）
- スライド8「全指標統合グラフ」を追加
- 総スライド数を15 → 16に変更
- 未使用の `stores` 変数を削除
- 空状態表示の高さを統一（グラフ: 500px、テーブル: 400px）

### 2026-02-09（推定）

- 初回実装
- 15スライド構成
- モックデータ生成（12ヶ月分）
- グローバル店舗フィルタ実装

---

## 参考資料

- **元仕様書**: `MTG資料スライド.pdf`
- **サンプルデータ**: `担当者別分析表_asian relaxation villa新潟西店_20260209.xlsx`
- **MTG記録**: `0209MTG記録.txt`（エンコーディング問題あり）
- **Recharts公式ドキュメント**: https://recharts.org/

---

**作成者**: Claude Sonnet 4.5
**プロジェクト**: KMKM / Regrow アプリ
**ライセンス**: プロジェクトライセンスに準拠
