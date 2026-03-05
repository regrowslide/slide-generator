'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Calculator,
  Search,
  Plus,
  Upload,
  Sparkles,
  Loader2,
  ChevronRight,
  TrendingUp,
  Package,
  Settings,
  Brain,
  Camera,
  DollarSign,
  RotateCcw,
  Trash2,
  Save,
  BookOpen,
  LucideIcon,
} from 'lucide-react'
import {
  SplashScreen,
  InfoSidebar,
  Modal,
  GuidanceOverlay,
  GuidanceStartButton,
  MockHeader,
  MockHeaderTitle,
  MockHeaderTab,
  MockHeaderInfoButton,
  usePersistedState,
  useEditModal,
  generateId,
  resetPersistedData,
  type Feature,
  type TimeEfficiencyItem,
  type OverviewInfo,
  type OperationStep,
  type GuidanceStep,
} from '../../_components'

// ==========================================
// 機能説明データ
// ==========================================

const FEATURES: Feature[] = [
  {
    icon: Brain,
    title: 'AI原価解析',
    description:
      'レシピ画像・手書きメモ・テキストからAIが食材を自動認識。食材マスタと照合して瞬時に原価を算出します。',
    benefit: '原価計算時間を1品30分→30秒に短縮',
  },
  {
    icon: Package,
    title: '食材マスタ管理',
    description:
      '仕入先ごとの食材単価を一元管理。価格変動の履歴も記録し、最適な仕入先の選定を支援します。',
    benefit: '仕入コストを平均8%削減',
  },
  {
    icon: DollarSign,
    title: '粗利基準管理',
    description:
      'メニューカテゴリごとの目標粗利率を設定。原価計算結果と連動して、基準を下回るメニューを自動でアラート表示。',
    benefit: '粗利率改善で利益率5%向上',
  },
  {
    icon: Camera,
    title: '画像認識入力',
    description:
      'スマホで撮影したレシピ写真から食材と分量を自動読み取り。手入力の手間を大幅に削減します。',
    benefit: '入力工数を90%削減',
  },
]

const TIME_EFFICIENCY: TimeEfficiencyItem[] = [
  { task: 'レシピ原価計算', before: '30分/品', after: '30秒/品', saved: '29.5分/品' },
  { task: '食材価格の調査', before: '1時間/週', after: '自動更新', saved: '1時間/週' },
  { task: 'メニュー粗利分析', before: '3時間/月', after: '即時確認', saved: '3時間/月' },
  { task: '原価率レポート作成', before: '2時間', after: '自動生成', saved: '2時間/月' },
]

const CHALLENGES = [
  'レシピごとの原価計算に時間がかかる',
  '食材の価格変動を追えていない',
  'メニューの粗利率が把握できていない',
  '新メニュー開発時の収益性が判断しにくい',
  '手書きレシピのデジタル化ができていない',
]

const OVERVIEW: OverviewInfo = {
  description: 'AIでレシピ画像や手書きメモから食材を自動認識し、原価を瞬時に算出するシステムです。食材マスタと粗利基準の管理で収益性の向上を支援します。',
  automationPoints: [
    'レシピ画像・テキストからAIが食材を自動認識',
    '食材マスタと照合して原価を瞬時に算出',
    'カテゴリ別の粗利基準と連動した自動アラート',
    '保存レシピの原価変動を自動追跡',
  ],
  userBenefits: [
    '原価計算時間を1品30分→30秒に大幅短縮',
    'データに基づくメニュー価格設定が可能に',
    '粗利率の可視化で利益率を改善',
  ],
}

const OPERATION_STEPS: OperationStep[] = [
  { step: 1, action: 'AI原価計算を実行', detail: 'レシピ画像やテキストをアップロードしてAIに解析させる' },
  { step: 2, action: '解析結果を確認・保存', detail: '食材と原価の解析結果を確認し、レシピとして保存' },
  { step: 3, action: '食材マスタを管理', detail: '食材の単価・仕入先情報を更新して原価精度を向上' },
  { step: 4, action: '粗利基準を設定', detail: 'カテゴリ別の目標粗利率を設定してアラートを管理' },
]

const getGuidanceSteps = (setActiveTab: (tab: TabId) => void): GuidanceStep[] => [
  { targetSelector: '[data-guidance="calculator-tab"]', title: 'AI原価計算', description: 'レシピ画像やテキストをAIに解析させ、食材と原価を自動算出します。', position: 'bottom', action: () => setActiveTab('calculator') },
  { targetSelector: '[data-guidance="upload-area"]', title: 'レシピのアップロード', description: 'レシピ画像をドラッグ＆ドロップ、またはファイル選択でアップロードします。', position: 'bottom', action: () => setActiveTab('calculator') },
  { targetSelector: '[data-guidance="analyze-button"]', title: 'AI解析の実行', description: '「AI解析を実行」ボタンでAIがレシピを分析し、食材・分量・原価を自動算出します。', position: 'top', action: () => setActiveTab('calculator') },
  { targetSelector: '[data-guidance="ingredients-tab"]', title: '食材マスタ', description: '食材の単価・仕入先情報を管理。原価計算の基礎データです。', position: 'bottom', action: () => setActiveTab('calculator') },
  { targetSelector: '[data-guidance="add-ingredient-button"]', title: '食材の追加', description: '「食材追加」ボタンで新しい食材を登録します。単価・カテゴリ・仕入先を入力。', position: 'bottom', action: () => setActiveTab('ingredients') },
  { targetSelector: '[data-guidance="category-filter"]', title: 'カテゴリ絞り込み', description: 'カテゴリを選択して食材を絞り込めます。', position: 'bottom', action: () => setActiveTab('ingredients') },
  { targetSelector: '[data-guidance="profit-standards-tab"]', title: '粗利基準', description: 'カテゴリ別の目標粗利率を設定し、基準を下回るメニューを検知。', position: 'bottom', action: () => setActiveTab('ingredients') },
  { targetSelector: '[data-guidance="add-standard-button"]', title: 'カテゴリの追加', description: '「カテゴリ追加」ボタンで粗利基準カテゴリを登録します。', position: 'bottom', action: () => setActiveTab('profit-standards') },
  { targetSelector: '[data-guidance="info-button"]', title: '機能説明', description: 'システムの概要や操作手順、時間削減効果を確認できます。右下のボタンからいつでも開けます。', position: 'top', action: () => setActiveTab('profit-standards') },
]

// ==========================================
// 型定義
// ==========================================

interface Ingredient {
  id: string
  name: string
  category: string
  unit: string
  unitPrice: number
  supplier: string
  lastUpdated: string
}

interface ProfitStandard {
  id: string
  category: string
  targetGrossMargin: number
  currentAvgMargin: number
  menuCount: number
  alertCount: number
}

type DataSource = '食材マスタ' | 'A-Price' | '楽天市場'

interface AnalyzedItem {
  name: string
  amount: string
  unitPrice: number
  cost: number
  source: DataSource
}

interface SavedRecipe {
  id: string
  name: string
  sellingPrice: number
  totalCost: number
  grossMargin: number
  items: AnalyzedItem[]
  savedAt: string
}

// ==========================================
// 初期データ
// ==========================================

const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: 'I001', name: '鶏もも肉', category: '肉類', unit: 'g', unitPrice: 0.25, supplier: 'A食品', lastUpdated: '2026-02-20' },
  { id: 'I002', name: '豚バラ肉', category: '肉類', unit: 'g', unitPrice: 0.30, supplier: 'A食品', lastUpdated: '2026-02-20' },
  { id: 'I003', name: 'サーモン', category: '魚介類', unit: 'g', unitPrice: 0.50, supplier: 'B水産', lastUpdated: '2026-02-19' },
  { id: 'I004', name: '玉ねぎ', category: '野菜', unit: 'g', unitPrice: 0.05, supplier: 'C青果', lastUpdated: '2026-02-21' },
  { id: 'I005', name: 'にんじん', category: '野菜', unit: 'g', unitPrice: 0.06, supplier: 'C青果', lastUpdated: '2026-02-21' },
  { id: 'I006', name: 'じゃがいも', category: '野菜', unit: 'g', unitPrice: 0.04, supplier: 'C青果', lastUpdated: '2026-02-21' },
  { id: 'I007', name: '米', category: '穀類', unit: 'g', unitPrice: 0.08, supplier: 'D商店', lastUpdated: '2026-02-18' },
  { id: 'I008', name: '卵', category: '卵・乳', unit: '個', unitPrice: 25, supplier: 'E農園', lastUpdated: '2026-02-20' },
  { id: 'I009', name: '牛乳', category: '卵・乳', unit: 'ml', unitPrice: 0.20, supplier: 'F乳業', lastUpdated: '2026-02-19' },
  { id: 'I010', name: '小麦粉', category: '穀類', unit: 'g', unitPrice: 0.03, supplier: 'D商店', lastUpdated: '2026-02-18' },
  { id: 'I011', name: 'バター', category: '調味料', unit: 'g', unitPrice: 0.80, supplier: 'F乳業', lastUpdated: '2026-02-19' },
  { id: 'I012', name: 'オリーブオイル', category: '調味料', unit: 'ml', unitPrice: 0.50, supplier: 'G商事', lastUpdated: '2026-02-17' },
]

const INITIAL_PROFIT_STANDARDS: ProfitStandard[] = [
  { id: 'PS001', category: 'メイン料理', targetGrossMargin: 65, currentAvgMargin: 62, menuCount: 24, alertCount: 3 },
  { id: 'PS002', category: 'サラダ・前菜', targetGrossMargin: 70, currentAvgMargin: 72, menuCount: 16, alertCount: 0 },
  { id: 'PS003', category: 'スープ', targetGrossMargin: 75, currentAvgMargin: 78, menuCount: 8, alertCount: 0 },
  { id: 'PS004', category: 'デザート', targetGrossMargin: 70, currentAvgMargin: 68, menuCount: 12, alertCount: 2 },
  { id: 'PS005', category: 'ドリンク', targetGrossMargin: 80, currentAvgMargin: 82, menuCount: 20, alertCount: 0 },
  { id: 'PS006', category: 'セットメニュー', targetGrossMargin: 60, currentAvgMargin: 57, menuCount: 6, alertCount: 2 },
]

const INITIAL_SAVED_RECIPES: SavedRecipe[] = []

// AI解析のダミー結果（3つのデータソースに分散）
const AI_RESULT: AnalyzedItem[] = [
  { name: '鶏もも肉', amount: '200g', unitPrice: 0.25, cost: 50, source: '食材マスタ' },
  { name: '玉ねぎ', amount: '150g', unitPrice: 0.05, cost: 7.5, source: '食材マスタ' },
  { name: 'にんじん', amount: '100g', unitPrice: 0.06, cost: 6, source: '食材マスタ' },
  { name: 'じゃがいも', amount: '200g', unitPrice: 0.04, cost: 8, source: 'A-Price' },
  { name: 'バター', amount: '20g', unitPrice: 0.80, cost: 16, source: 'A-Price' },
  { name: '小麦粉', amount: '30g', unitPrice: 0.03, cost: 0.9, source: '食材マスタ' },
  { name: '牛乳', amount: '100ml', unitPrice: 0.20, cost: 20, source: 'A-Price' },
  { name: '塩・胡椒', amount: '適量', unitPrice: 0, cost: 2, source: '楽天市場' },
]

// データソース検索フェーズ定義
interface SearchPhase {
  source: DataSource
  label: string
  description: string
  icon: 'database' | 'store' | 'globe'
  color: string
  bgColor: string
  borderColor: string
  duration: number
}

const SEARCH_PHASES: SearchPhase[] = [
  { source: '食材マスタ', label: '食材マスタ', description: '自社登録食材データベースを検索中...', icon: 'database', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', duration: 3000 },
  { source: 'A-Price', label: 'A-Price', description: '業務用食品スーパーの価格情報を取得中...', icon: 'store', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', duration: 3500 },
  { source: '楽天市場', label: '楽天市場', description: 'オンラインマーケットの最安値を検索中...', icon: 'globe', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', duration: 3500 },
]

// データソースバッジ
const SourceBadge = ({ source }: { source: DataSource }) => {
  const config: Record<DataSource, { bg: string; text: string; border: string }> = {
    '食材マスタ': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'A-Price': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    '楽天市場': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  }
  const c = config[source]
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${c.bg} ${c.text} ${c.border}`}>
      {source}
    </span>
  )
}

// ==========================================
// ストレージキー
// ==========================================

const STORAGE_KEYS = {
  ingredients: 'mock-recipe-calculator-ingredients',
  profitStandards: 'mock-recipe-calculator-profit-standards',
  savedRecipes: 'mock-recipe-calculator-saved-recipes',
}

// ==========================================
// タブ定義
// ==========================================

type TabId = 'calculator' | 'ingredients' | 'profit-standards'

interface Tab {
  id: TabId
  label: string
  icon: LucideIcon
}

const TABS: Tab[] = [
  { id: 'calculator', label: '原価計算', icon: Calculator },
  { id: 'ingredients', label: '食材マスタ', icon: Package },
  { id: 'profit-standards', label: '粗利基準マスタ', icon: Settings },
]

// ==========================================
// フォーム入力ヘルパー
// ==========================================

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs text-stone-500 block mb-1">{label}</label>
    {children}
  </div>
)

const inputClass = 'w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
const selectClass = inputClass

const INGREDIENT_CATEGORIES = ['肉類', '魚介類', '野菜', '穀類', '卵・乳', '調味料']

// ==========================================
// 原価計算ビュー
// ==========================================

const CalculatorView = ({
  savedRecipes,
  setSavedRecipes,
}: {
  savedRecipes: SavedRecipe[]
  setSavedRecipes: React.Dispatch<React.SetStateAction<SavedRecipe[]>>
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(-1)
  const [phaseResults, setPhaseResults] = useState<{ source: DataSource; count: number; done: boolean }[]>([])
  const [result, setResult] = useState<AnalyzedItem[] | null>(null)
  const [recipeName, setRecipeName] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setResult(null)
    setCurrentPhase(0)
    setPhaseResults(SEARCH_PHASES.map((p) => ({ source: p.source, count: 0, done: false })))

    // フェーズ1: 食材マスタ
    const phase1Items = AI_RESULT.filter((i) => i.source === '食材マスタ')
    const phase2Items = AI_RESULT.filter((i) => i.source === 'A-Price')
    const phase3Items = AI_RESULT.filter((i) => i.source === '楽天市場')

    setTimeout(() => {
      setPhaseResults((prev) => prev.map((p) => p.source === '食材マスタ' ? { ...p, count: phase1Items.length, done: true } : p))
      setCurrentPhase(1)

      // フェーズ2: A-Price
      setTimeout(() => {
        setPhaseResults((prev) => prev.map((p) => p.source === 'A-Price' ? { ...p, count: phase2Items.length, done: true } : p))
        setCurrentPhase(2)

        // フェーズ3: 楽天市場
        setTimeout(() => {
          setPhaseResults((prev) => prev.map((p) => p.source === '楽天市場' ? { ...p, count: phase3Items.length, done: true } : p))

          // 完了表示後に結果を出す
          setTimeout(() => {
            setIsAnalyzing(false)
            setCurrentPhase(-1)
            setResult(AI_RESULT.map((item) => ({ ...item })))
            setRecipeName('チキンクリームシチュー')
            setSellingPrice('980')
          }, 800)
        }, SEARCH_PHASES[2].duration)
      }, SEARCH_PHASES[1].duration)
    }, SEARCH_PHASES[0].duration)
  }

  const totalCost = result ? result.reduce((sum, item) => sum + item.cost, 0) : 0
  const selling = parseFloat(sellingPrice) || 0
  const grossMargin = selling > 0 ? ((selling - totalCost) / selling) * 100 : 0

  const handleUpdateItem = (idx: number, field: 'amount' | 'cost', value: string) => {
    if (!result) return
    setResult((prev) => {
      if (!prev) return prev
      const updated = [...prev]
      if (field === 'amount') {
        updated[idx] = { ...updated[idx], amount: value }
      } else {
        updated[idx] = { ...updated[idx], cost: Number(value) || 0 }
      }
      return updated
    })
  }

  const handleSaveRecipe = () => {
    if (!result || !recipeName) return
    const newRecipe: SavedRecipe = {
      id: generateId('SR'),
      name: recipeName,
      sellingPrice: selling,
      totalCost,
      grossMargin,
      items: result,
      savedAt: new Date().toISOString().slice(0, 10),
    }
    setSavedRecipes((prev) => [newRecipe, ...prev])
  }

  const handleDeleteRecipe = (recipeId: string) => {
    setSavedRecipes((prev) => prev.filter((r) => r.id !== recipeId))
  }

  const handleLoadRecipe = (recipe: SavedRecipe) => {
    setResult(recipe.items.map((item) => ({ ...item })))
    setRecipeName(recipe.name)
    setSellingPrice(String(recipe.sellingPrice))
  }

  return (
    <div className="space-y-6">
      {/* AI解析エリア */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-stone-800">AI原価解析</h3>
        </div>

        <div data-guidance="upload-area" className="border-2 border-dashed border-amber-200 rounded-xl p-8 text-center bg-amber-50/30 mb-4">
          <Upload className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-stone-600 mb-1">レシピ画像をドラッグ＆ドロップ</p>
          <p className="text-xs text-stone-400 mb-4">または クリックしてファイルを選択</p>
          <div className="flex justify-center gap-3">
            <button onClick={handleAnalyze} className="px-4 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-600 hover:border-amber-400 transition-colors">
              <Camera className="w-4 h-4 inline mr-1" />
              写真を撮影
            </button>
            <button onClick={handleAnalyze} className="px-4 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-600 hover:border-amber-400 transition-colors">
              <Upload className="w-4 h-4 inline mr-1" />
              ファイル選択
            </button>
          </div>
        </div>

        <button
          data-guidance="analyze-button"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className={`w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all duration-200 ${isAnalyzing
              ? 'bg-stone-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-lg shadow-amber-500/25'
            }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI解析中...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              AI解析を実行（デモ）
            </>
          )}
        </button>
      </div>

      {/* 検索アニメーション */}
      {isAnalyzing && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
            <h3 className="font-bold text-stone-800">食材価格を検索中...</h3>
          </div>

          <div className="space-y-3">
            {SEARCH_PHASES.map((phase, idx) => {
              const phaseResult = phaseResults[idx]
              const isActive = currentPhase === idx
              const isDone = phaseResult?.done
              const isPending = currentPhase < idx

              return (
                <div
                  key={phase.source}
                  className={`rounded-xl border p-4 transition-all duration-500 ${isActive ? `${phase.bgColor} ${phase.borderColor} shadow-md` :
                      isDone ? `${phase.bgColor} ${phase.borderColor} opacity-80` :
                        'bg-stone-50 border-stone-200 opacity-50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive || isDone ? phase.bgColor : 'bg-stone-100'
                        }`}>
                        {phase.icon === 'database' && (
                          <Package className={`w-4 h-4 ${isActive || isDone ? phase.color : 'text-stone-400'}`} />
                        )}
                        {phase.icon === 'store' && (
                          <DollarSign className={`w-4 h-4 ${isActive || isDone ? phase.color : 'text-stone-400'}`} />
                        )}
                        {phase.icon === 'globe' && (
                          <Search className={`w-4 h-4 ${isActive || isDone ? phase.color : 'text-stone-400'}`} />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isActive || isDone ? phase.color : 'text-stone-400'}`}>
                          {phase.label}
                        </p>
                        <p className="text-xs text-stone-500">
                          {isDone ? `${phaseResult.count}件の食材がヒット` :
                            isActive ? phase.description :
                              '待機中...'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {isDone && (
                        <div className="flex items-center gap-1 text-emerald-600 animate-in fade-in duration-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xs font-bold">{phaseResult.count}件</span>
                        </div>
                      )}
                      {isActive && (
                        <Loader2 className={`w-5 h-5 animate-spin ${phase.color}`} />
                      )}
                      {isPending && (
                        <div className="w-5 h-5 rounded-full border-2 border-stone-300" />
                      )}
                    </div>
                  </div>

                  {/* プログレスバー */}
                  {isActive && (
                    <div className="mt-3 w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${phase.source === '食材マスタ' ? 'bg-emerald-500' :
                            phase.source === 'A-Price' ? 'bg-blue-500' : 'bg-red-500'
                          }`}
                        style={{
                          animation: `progressBar ${phase.duration}ms ease-in-out forwards`,
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 進捗サマリ */}
          <div className="flex items-center justify-center gap-4 pt-2 text-xs text-stone-500">
            <span>検索データソース: {phaseResults.filter((p) => p.done).length} / {SEARCH_PHASES.length}</span>
            <span>|</span>
            <span>発見食材: {phaseResults.reduce((sum, p) => sum + p.count, 0)}件</span>
          </div>

          <style>{`
            @keyframes progressBar {
              0% { width: 0%; }
              100% { width: 100%; }
            }
          `}</style>
        </div>
      )}

      {/* 解析結果 */}
      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-800">解析結果</h3>
              <button
                onClick={handleSaveRecipe}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors"
              >
                <Save size={14} />
                レシピを保存
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-stone-500 block mb-1">レシピ名</label>
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">販売価格（税抜）</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="bg-stone-50 rounded-xl overflow-hidden border border-stone-200">
              <table className="w-full text-sm">
                <thead className="bg-stone-100 text-stone-500">
                  <tr>
                    <th className="px-4 py-2 text-left">食材名</th>
                    <th className="px-4 py-2 text-left">データソース</th>
                    <th className="px-4 py-2 text-right">使用量</th>
                    <th className="px-4 py-2 text-right">単価</th>
                    <th className="px-4 py-2 text-right">原価</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {result.map((item, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-4 py-2 text-stone-700">{item.name}</td>
                      <td className="px-4 py-2">
                        <SourceBadge source={item.source} />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <input
                          type="text"
                          value={item.amount}
                          onChange={(e) => handleUpdateItem(idx, 'amount', e.target.value)}
                          className="w-20 text-right px-2 py-1 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                      </td>
                      <td className="px-4 py-2 text-right text-stone-600">{item.unitPrice > 0 ? `¥${item.unitPrice}` : '-'}</td>
                      <td className="px-4 py-2 text-right">
                        <input
                          type="number"
                          value={item.cost}
                          onChange={(e) => handleUpdateItem(idx, 'cost', e.target.value)}
                          className="w-20 text-right px-2 py-1 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-amber-50 border-t-2 border-amber-200">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 font-bold text-amber-800">原価合計</td>
                    <td className="px-4 py-3 text-right font-bold text-amber-800 text-lg">¥{totalCost.toFixed(1)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
              <p className="text-xs text-stone-500 mb-1">原価率</p>
              <p className={`text-2xl font-bold ${selling > 0 && (totalCost / selling) * 100 > 35 ? 'text-red-600' : 'text-green-600'}`}>
                {selling > 0 ? ((totalCost / selling) * 100).toFixed(1) : '---'}%
              </p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
              <p className="text-xs text-stone-500 mb-1">粗利額</p>
              <p className="text-2xl font-bold text-stone-800">¥{selling > 0 ? (selling - totalCost).toFixed(0) : '---'}</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
              <p className="text-xs text-stone-500 mb-1">粗利率</p>
              <p className={`text-2xl font-bold ${grossMargin >= 65 ? 'text-green-600' : grossMargin >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                {selling > 0 ? grossMargin.toFixed(1) : '---'}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 保存済みレシピ一覧 */}
      {savedRecipes.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-stone-800">保存済みレシピ ({savedRecipes.length}件)</h3>
          </div>
          <div className="space-y-3">
            {savedRecipes.map((recipe) => (
              <div key={recipe.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-100 hover:border-amber-200 transition-colors">
                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => handleLoadRecipe(recipe)}>
                  <div>
                    <p className="font-medium text-stone-800">{recipe.name}</p>
                    <p className="text-xs text-stone-500">{recipe.savedAt} 保存</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-stone-600">原価: ¥{recipe.totalCost.toFixed(0)}</span>
                    <span className="text-stone-600">販売: ¥{recipe.sellingPrice}</span>
                    <span className={`font-medium ${recipe.grossMargin >= 65 ? 'text-green-600' : recipe.grossMargin >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                      粗利: {recipe.grossMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteRecipe(recipe.id)}
                  className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 食材マスタビュー
// ==========================================

const IngredientsView = ({
  ingredients,
  setIngredients,
}: {
  ingredients: Ingredient[]
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [...new Set(ingredients.map((i) => i.category))]
  const filtered = ingredients.filter(
    (i) =>
      (!searchTerm || i.name.includes(searchTerm) || i.supplier.includes(searchTerm)) &&
      (!selectedCategory || i.category === selectedCategory)
  )

  const modal = useEditModal<Ingredient, { name: string; category: string; unit: string; unitPrice: number; supplier: string; lastUpdated: string }>(
    { name: '', category: INGREDIENT_CATEGORIES[0], unit: 'g', unitPrice: 0, supplier: '', lastUpdated: '' },
    (item) => ({ name: item.name, category: item.category, unit: item.unit, unitPrice: item.unitPrice, supplier: item.supplier, lastUpdated: item.lastUpdated }),
  )

  const handleSave = () => {
    const today = new Date().toISOString().slice(0, 10)
    modal.setForm((p) => ({ ...p, lastUpdated: today }))
    // setFormは非同期のため、直接saveの前にlastUpdatedをセットする代わりに手動でupsert
    if (modal.editingItem) {
      setIngredients((prev) => prev.map((i) => (i.id === modal.editingItem!.id ? { ...i, ...modal.form, lastUpdated: today } : i)))
    } else {
      setIngredients((prev) => [...prev, { id: generateId('I'), ...modal.form, lastUpdated: today }])
    }
    modal.close()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-stone-800">食材マスタ ({ingredients.length}件)</h3>
        <button data-guidance="add-ingredient-button" onClick={modal.openNew} className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">
          <Plus size={14} />
          食材追加
        </button>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-stone-400" size={16} />
          <input
            type="text"
            placeholder="食材名・仕入先で検索..."
            className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div data-guidance="category-filter" className="flex gap-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!selectedCategory ? 'bg-amber-500 text-white border-transparent' : 'bg-white text-stone-500 border-stone-200 hover:border-amber-200'
              }`}
          >
            全て
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedCategory === cat ? 'bg-amber-500 text-white border-transparent' : 'bg-white text-stone-500 border-stone-200 hover:border-amber-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3 text-left">食材名</th>
                <th className="px-4 py-3 text-left">カテゴリ</th>
                <th className="px-4 py-3 text-right">単価</th>
                <th className="px-4 py-3 text-left">単位</th>
                <th className="px-4 py-3 text-left">仕入先</th>
                <th className="px-4 py-3 text-left">最終更新</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-amber-50/30 transition-colors cursor-pointer" onClick={() => modal.openEdit(item)}>
                  <td className="px-4 py-3 font-medium text-stone-800">{item.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">{item.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-stone-800">¥{item.unitPrice}</td>
                  <td className="px-4 py-3 text-stone-600">/{item.unit}</td>
                  <td className="px-4 py-3 text-stone-600">{item.supplier}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs">{item.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modal.modalOpen} onClose={modal.close} title={modal.editingItem ? '食材編集' : '食材追加'}>
        <div className="space-y-4">
          <FormField label="食材名">
            <input type="text" className={inputClass} value={modal.form.name} onChange={(e) => modal.setForm((p) => ({ ...p, name: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="カテゴリ">
              <select className={selectClass} value={modal.form.category} onChange={(e) => modal.setForm((p) => ({ ...p, category: e.target.value }))}>
                {INGREDIENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="単位">
              <input type="text" className={inputClass} value={modal.form.unit} onChange={(e) => modal.setForm((p) => ({ ...p, unit: e.target.value }))} placeholder="g, ml, 個" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="単価（円）">
              <input type="number" step="0.01" className={inputClass} value={modal.form.unitPrice} onChange={(e) => modal.setForm((p) => ({ ...p, unitPrice: Number(e.target.value) }))} />
            </FormField>
            <FormField label="仕入先">
              <input type="text" className={inputClass} value={modal.form.supplier} onChange={(e) => modal.setForm((p) => ({ ...p, supplier: e.target.value }))} />
            </FormField>
          </div>
          <div className="flex justify-between pt-2">
            {modal.editingItem ? (
              <button onClick={() => modal.remove(setIngredients)} className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors">
                <Trash2 size={14} />
                削除
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button onClick={modal.close} className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">キャンセル</button>
              <button onClick={handleSave} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">保存</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ==========================================
// 粗利基準マスタビュー
// ==========================================

const ProfitStandardsView = ({
  profitStandards,
  setProfitStandards,
}: {
  profitStandards: ProfitStandard[]
  setProfitStandards: React.Dispatch<React.SetStateAction<ProfitStandard[]>>
}) => {
  const modal = useEditModal<ProfitStandard, { category: string; targetGrossMargin: number; currentAvgMargin: number; menuCount: number; alertCount: number }>(
    { category: '', targetGrossMargin: 65, currentAvgMargin: 65, menuCount: 0, alertCount: 0 },
    (item) => ({ category: item.category, targetGrossMargin: item.targetGrossMargin, currentAvgMargin: item.currentAvgMargin, menuCount: item.menuCount, alertCount: item.alertCount }),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-stone-800">粗利基準マスタ</h3>
        <button data-guidance="add-standard-button" onClick={modal.openNew} className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">
          <Plus size={14} />
          カテゴリ追加
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profitStandards.map((standard) => {
          const isBelow = standard.currentAvgMargin < standard.targetGrossMargin
          return (
            <div
              key={standard.id}
              onClick={() => modal.openEdit(standard)}
              className={`bg-white rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer ${isBelow ? 'border-red-200 hover:border-red-300' : 'border-stone-200 hover:border-amber-200'
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-bold text-stone-800">{standard.category}</h4>
                  <span className="text-xs text-stone-500">{standard.menuCount}メニュー</span>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400" />
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-500">現在の平均粗利率</span>
                  <span className={`font-bold ${isBelow ? 'text-red-600' : 'text-green-600'}`}>
                    {standard.currentAvgMargin}%
                  </span>
                </div>
                <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden relative">
                  <div
                    className="absolute top-0 h-full w-0.5 bg-stone-400 z-10"
                    style={{ left: `${standard.targetGrossMargin}%` }}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isBelow ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-green-400 to-green-500'}`}
                    style={{ width: `${standard.currentAvgMargin}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                  <span>0%</span>
                  <span>目標: {standard.targetGrossMargin}%</span>
                  <span>100%</span>
                </div>
              </div>

              {standard.alertCount > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-700 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  基準未達メニュー: {standard.alertCount}件
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Modal isOpen={modal.modalOpen} onClose={modal.close} title={modal.editingItem ? 'カテゴリ編集' : 'カテゴリ追加'}>
        <div className="space-y-4">
          <FormField label="カテゴリ名">
            <input type="text" className={inputClass} value={modal.form.category} onChange={(e) => modal.setForm((p) => ({ ...p, category: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="目標粗利率（%）">
              <input type="number" className={inputClass} value={modal.form.targetGrossMargin} onChange={(e) => modal.setForm((p) => ({ ...p, targetGrossMargin: Number(e.target.value) }))} />
            </FormField>
            <FormField label="現在の平均粗利率（%）">
              <input type="number" className={inputClass} value={modal.form.currentAvgMargin} onChange={(e) => modal.setForm((p) => ({ ...p, currentAvgMargin: Number(e.target.value) }))} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="メニュー数">
              <input type="number" className={inputClass} value={modal.form.menuCount} onChange={(e) => modal.setForm((p) => ({ ...p, menuCount: Number(e.target.value) }))} />
            </FormField>
            <FormField label="基準未達メニュー数">
              <input type="number" className={inputClass} value={modal.form.alertCount} onChange={(e) => modal.setForm((p) => ({ ...p, alertCount: Number(e.target.value) }))} />
            </FormField>
          </div>
          <div className="flex justify-between pt-2">
            {modal.editingItem ? (
              <button onClick={() => modal.remove(setProfitStandards)} className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors">
                <Trash2 size={14} />
                削除
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button onClick={modal.close} className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">キャンセル</button>
              <button onClick={() => modal.save(setProfitStandards, 'PS')} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">保存</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ==========================================
// メインコンポーネント
// ==========================================

export default function RecipeCalculatorMockPage() {
  const [activeTab, setActiveTab] = useState<TabId>('calculator')
  const [showSplash, setShowSplash] = useState(true)
  const [showInfoSidebar, setShowInfoSidebar] = useState(false)
  const [showGuidance, setShowGuidance] = useState(false)

  const [ingredients, setIngredients] = usePersistedState<Ingredient[]>(STORAGE_KEYS.ingredients, INITIAL_INGREDIENTS)
  const [profitStandards, setProfitStandards] = usePersistedState<ProfitStandard[]>(STORAGE_KEYS.profitStandards, INITIAL_PROFIT_STANDARDS)
  const [savedRecipes, setSavedRecipes] = usePersistedState<SavedRecipe[]>(STORAGE_KEYS.savedRecipes, INITIAL_SAVED_RECIPES)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleReset = useCallback(() => {
    resetPersistedData(STORAGE_KEYS)
  }, [])

  if (showSplash) {
    return <SplashScreen theme="amber" systemName="AI食品原価計算システム" subtitle="Smart Recipe Cost Calculator" />
  }

  const TAB_VIEWS: Record<TabId, React.ReactNode> = {
    calculator: <CalculatorView savedRecipes={savedRecipes} setSavedRecipes={setSavedRecipes} />,
    ingredients: <IngredientsView ingredients={ingredients} setIngredients={setIngredients} />,
    'profit-standards': <ProfitStandardsView profitStandards={profitStandards} setProfitStandards={setProfitStandards} />,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/30 font-sans">
      <MockHeader>
        <MockHeaderTitle icon={Calculator} title="AI食品原価計算" subtitle="Smart Recipe Cost Calculator" theme="amber" />

        <div className="flex items-center gap-2">
          <GuidanceStartButton onClick={() => setShowGuidance(true)} theme="amber" />
          <button
            onClick={handleReset}
            className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="データ初期化"
          >
            <RotateCcw size={16} />
          </button>
          {TABS.map((tab) => (
            <MockHeaderTab
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
              theme="amber"
              data-guidance={`${tab.id}-tab`}
            />
          ))}
          <MockHeaderInfoButton onClick={() => setShowInfoSidebar(true)} theme="amber" />
        </div>
      </MockHeader>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {TAB_VIEWS[activeTab]}
      </main>

      <InfoSidebar
        isOpen={showInfoSidebar}
        onClose={() => setShowInfoSidebar(false)}
        theme="amber"
        systemIcon={Calculator}
        systemName="AI食品原価計算システム"
        systemDescription="AIでレシピ画像や手書きメモから食材を自動認識し、原価を瞬時に算出するシステムです。食材マスタと粗利基準の管理で収益性の向上を支援します。"
        features={FEATURES}
        timeEfficiency={TIME_EFFICIENCY}
        challenges={CHALLENGES}
        overview={OVERVIEW}
        operationSteps={OPERATION_STEPS}
      />

      <GuidanceOverlay
        steps={getGuidanceSteps(setActiveTab)}
        isActive={showGuidance}
        onClose={() => setShowGuidance(false)}
        theme="amber"
      />
    </div>
  )
}
