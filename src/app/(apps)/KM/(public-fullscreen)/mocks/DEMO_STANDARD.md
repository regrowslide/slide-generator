# デモアプリ共通水準ルール

新規デモアプリ作成時・既存デモアプリ改修時に準拠すべき必須要件。

## 必須要件チェックリスト

### 1. ヘッダー（統一スタイル）

- [ ] `bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-30`
- [ ] 高さ `h-16`、`max-w-7xl mx-auto` で中央寄せ
- [ ] **左側**: アイコン（テーマグラデーション背景 `rounded-xl shadow-lg`） + タイトル（グラデーションテキスト） + サブタイトル + **対象月/期間バッジ**
- [ ] **右側**: ガイダンスボタン → リセットボタン → タブナビゲーション
- [ ] タブスタイル:
  - アクティブ: `bg-gradient-to-r from-{theme}-500 to-{theme}-600 text-white shadow-lg shadow-{theme}-500/25 rounded-lg`
  - 非アクティブ: `text-stone-600 hover:bg-stone-50 border border-transparent hover:border-{theme}-200 rounded-lg`
  - アイコン（16px） + ラベル（モバイルでは `hidden md:inline`）
- [ ] 各タブに `data-guidance="tab-{id}"` 属性を付与

### 2. InfoSidebar（機能説明サイドバー）

- [ ] `_components` から `InfoSidebar` をインポート
- [ ] 以下のデータを全て定義:
  - `FEATURES: Feature[]` — 主要機能（icon, title, description, benefit）
  - `TIME_EFFICIENCY: TimeEfficiencyItem[]` — 時間効率化（task, before, after, saved）
  - `CHALLENGES: string[]` — 解決する課題
  - `OVERVIEW: OverviewInfo` — 概要（description, automationPoints, userBenefits）
  - `OPERATION_STEPS: OperationStep[]` — 操作手順（step, action, detail）
- [ ] InfoSidebarに `overview` と `operationSteps` を渡す

### 3. 「機能説明」ボタン（ヘッダー右側）

- [ ] ヘッダー右側のタブナビゲーションの最後に配置
- [ ] `data-guidance="info-button"` 属性を付与
- [ ] `ml-2 p-2.5 bg-gradient-to-r from-{theme}-500 to-{theme2}-600 text-white rounded-xl`
- [ ] `PanelRightOpen` アイコン + 「機能説明」テキスト（`hidden sm:inline`）
- [ ] title属性: `"このシステムでできること"`

### 4. テーマカラー

- [ ] `themeConfig` から選択（rose, teal, blue, violet, amber, emerald）
- [ ] InfoSidebar, GuidanceOverlay, ヘッダー, フローティングボタンで統一

### 5. localStorage CRUD（データ永続化）

- [ ] `usePersistedState` で全データ状態を管理
- [ ] `STORAGE_KEYS` 定数を定義（`mock-{app-name}-{entity}` 形式）
- [ ] CRUD操作（追加・編集・削除）が可能
- [ ] ページリロードでデータが保持される

### 6. ResetButton（初期値リセット）

- [ ] ヘッダー右側に配置（ガイダンスボタンの隣）
- [ ] `RotateCcw` アイコン、`text-stone-400 hover:text-{theme}-600 hover:bg-{theme}-50`
- [ ] `resetPersistedData(STORAGE_KEYS)` でlocalStorageをクリア

### 7. GuidanceOverlay（ガイダンス）

- [ ] `GUIDANCE_STEPS: GuidanceStep[]` を定義
- [ ] 主要操作フローをカバー（最低3ステップ推奨）
- [ ] 対象要素に `data-guidance` 属性を付与
- [ ] `HelpCircle` アイコンでヘッダー右側に配置

### 8. seedデータ

- [ ] `currentDate` を起点に前後の日付を動的生成
- [ ] ハードコードされた日付を使わない

## ファイル構成

```
mocks/
├── _components/
│   └── index.tsx          # 共通コンポーネント・フック
├── {app-name}/
│   └── page.tsx           # デモアプリ本体
└── DEMO_STANDARD.md       # 本ファイル
```

## アーキテクチャパターン

### A. スタンドアロン方式（推奨: 小〜中規模）

page.tsxに全UIを記述。localStorage + usePersistedStateでデータ永続化。

### B. ラッパー方式（推奨: 既存アプリのデモ化）

既存アプリコンポーネントをそのまま利用し、ガイダンス・機能説明を上からラップ。

```typescript
// 既存コンポーネントにオプショナルpropsを追加
interface ExistingComponentProps {
  externalSection?: SectionKey      // 外部からのタブ切替
  onSectionChange?: (s: SectionKey) => void  // タブ変更通知
  hideNavigation?: boolean          // 内部ナビを非表示にする
}

// page.tsx（KMモック側）
<ExistingComponent
  externalSection={activeSection}
  onSectionChange={setActiveSection}
  hideNavigation  // ヘッダーはpage.tsx側で統一スタイルを提供
/>
```

**ラッパー方式のルール:**
- 既存コンポーネントに破壊的変更を加えない（オプショナルpropsのみ追加）
- propsがない場合は従来通り動作（後方互換）
- 既存コンポーネントのビューファイルに `data-guidance` 属性を追加してガイダンスのターゲットにする
- localStorage化は既存コンポーネント側の仕組みをそのまま利用

## データ定義テンプレート

```typescript
// 定数名は APP_NAME_ プレフィックスなし（ファイルスコープで十分）
const TABS: {id: TabId; label: string; icon: LucideIcon}[] = [...]
const FEATURES: Feature[] = [...]
const TIME_EFFICIENCY: TimeEfficiencyItem[] = [...]
const CHALLENGES = [...]
const OVERVIEW: OverviewInfo = { description, automationPoints, userBenefits }
const OPERATION_STEPS: OperationStep[] = [...]
const STORAGE_KEYS = { key1: 'mock-{app-name}-key1', ... }

// ガイダンスステップはタブ切替actionを含む関数として定義
const getGuidanceSteps = (setTab: (tab: TabId) => void): GuidanceStep[] => [
  { targetSelector: '[data-guidance="tab-xxx"]', title: '...', description: '...', position: 'bottom', action: () => setTab('xxx') },
  ...
]
```

## InfoSidebar表示順序

1. 概要（overview）
2. 操作手順（operationSteps）
3. 主要機能（features）
4. 時間効率化（timeEfficiency）
5. 課題解決（challenges）

## ヘッダーテンプレート

```tsx
<header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-30">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    {/* 左: アイコン + タイトル + 対象月 */}
    <div className="flex items-center gap-3">
      <div className="p-2 bg-gradient-to-r from-{theme}-500 to-{theme}-600 rounded-xl shadow-lg shadow-{theme}-500/20">
        <AppIcon className="text-white w-5 h-5" />
      </div>
      <div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-{theme}-600 to-{theme2}-600">
          アプリ名
        </h1>
        <p className="text-xs text-stone-400 -mt-0.5">サブタイトル</p>
      </div>
      <span className="ml-2 px-2.5 py-1 bg-{theme}-50 text-{theme}-700 text-xs font-medium rounded-lg border border-{theme}-200">
        対象月/期間
      </span>
    </div>

    {/* 右: ガイダンス + リセット + タブ */}
    <div className="flex items-center gap-2">
      <button onClick={startGuidance} className="p-2 text-stone-400 hover:text-{theme}-600 hover:bg-{theme}-50 rounded-lg" title="ガイダンス開始">
        <HelpCircle size={16} />
      </button>
      <button onClick={reset} className="p-2 text-stone-400 hover:text-{theme}-600 hover:bg-{theme}-50 rounded-lg" title="初期値に戻す">
        <RotateCcw size={16} />
      </button>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          data-guidance={`tab-${tab.id}`}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-{theme}-500 to-{theme}-600 text-white shadow-lg shadow-{theme}-500/25'
              : 'text-stone-600 hover:bg-stone-50 border border-transparent hover:border-{theme}-200'
          }`}
        >
          <tab.icon size={16} />
          <span className="hidden md:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  </div>
</header>
```

## 注意事項

- ラッパー方式の場合、既存コンポーネントのhooks/contextをそのまま利用し、localStorage化は既存側で実施
- `.jsx` ファイルの場合は `type` キーワードを使わずインポート
- GuidanceStepの `targetSelector` は `[data-guidance="xxx"]` 形式を使用
- ガイダンスのactionでタブ切替を行い、次ステップの対象要素がDOM上に存在する状態にすること
- GuidanceOverlayは `scrollIntoView({ behavior: 'instant' })` + 描画後のクランプ補正で画面端での切れを防止
