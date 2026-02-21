'use client'

import React, {useState, useEffect} from 'react'
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
  PanelRightOpen,
  Brain,
  Camera,
  DollarSign,
  LucideIcon,
} from 'lucide-react'
import {SplashScreen, InfoSidebar, type Feature, type TimeEfficiencyItem} from '../_components'

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
  {task: 'レシピ原価計算', before: '30分/品', after: '30秒/品', saved: '29.5分/品'},
  {task: '食材価格の調査', before: '1時間/週', after: '自動更新', saved: '1時間/週'},
  {task: 'メニュー粗利分析', before: '3時間/月', after: '即時確認', saved: '3時間/月'},
  {task: '原価率レポート作成', before: '2時間', after: '自動生成', saved: '2時間/月'},
]

const CHALLENGES = [
  'レシピごとの原価計算に時間がかかる',
  '食材の価格変動を追えていない',
  'メニューの粗利率が把握できていない',
  '新メニュー開発時の収益性が判断しにくい',
  '手書きレシピのデジタル化ができていない',
]

// ==========================================
// ダミーデータ
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

interface AnalyzedItem {
  name: string
  amount: string
  unitPrice: number
  cost: number
}

const INGREDIENTS: Ingredient[] = [
  {id: 'I001', name: '鶏もも肉', category: '肉類', unit: 'g', unitPrice: 0.25, supplier: 'A食品', lastUpdated: '2026-02-20'},
  {id: 'I002', name: '豚バラ肉', category: '肉類', unit: 'g', unitPrice: 0.30, supplier: 'A食品', lastUpdated: '2026-02-20'},
  {id: 'I003', name: 'サーモン', category: '魚介類', unit: 'g', unitPrice: 0.50, supplier: 'B水産', lastUpdated: '2026-02-19'},
  {id: 'I004', name: '玉ねぎ', category: '野菜', unit: 'g', unitPrice: 0.05, supplier: 'C青果', lastUpdated: '2026-02-21'},
  {id: 'I005', name: 'にんじん', category: '野菜', unit: 'g', unitPrice: 0.06, supplier: 'C青果', lastUpdated: '2026-02-21'},
  {id: 'I006', name: 'じゃがいも', category: '野菜', unit: 'g', unitPrice: 0.04, supplier: 'C青果', lastUpdated: '2026-02-21'},
  {id: 'I007', name: '米', category: '穀類', unit: 'g', unitPrice: 0.08, supplier: 'D商店', lastUpdated: '2026-02-18'},
  {id: 'I008', name: '卵', category: '卵・乳', unit: '個', unitPrice: 25, supplier: 'E農園', lastUpdated: '2026-02-20'},
  {id: 'I009', name: '牛乳', category: '卵・乳', unit: 'ml', unitPrice: 0.20, supplier: 'F乳業', lastUpdated: '2026-02-19'},
  {id: 'I010', name: '小麦粉', category: '穀類', unit: 'g', unitPrice: 0.03, supplier: 'D商店', lastUpdated: '2026-02-18'},
  {id: 'I011', name: 'バター', category: '調味料', unit: 'g', unitPrice: 0.80, supplier: 'F乳業', lastUpdated: '2026-02-19'},
  {id: 'I012', name: 'オリーブオイル', category: '調味料', unit: 'ml', unitPrice: 0.50, supplier: 'G商事', lastUpdated: '2026-02-17'},
]

const PROFIT_STANDARDS: ProfitStandard[] = [
  {id: 'PS001', category: 'メイン料理', targetGrossMargin: 65, currentAvgMargin: 62, menuCount: 24, alertCount: 3},
  {id: 'PS002', category: 'サラダ・前菜', targetGrossMargin: 70, currentAvgMargin: 72, menuCount: 16, alertCount: 0},
  {id: 'PS003', category: 'スープ', targetGrossMargin: 75, currentAvgMargin: 78, menuCount: 8, alertCount: 0},
  {id: 'PS004', category: 'デザート', targetGrossMargin: 70, currentAvgMargin: 68, menuCount: 12, alertCount: 2},
  {id: 'PS005', category: 'ドリンク', targetGrossMargin: 80, currentAvgMargin: 82, menuCount: 20, alertCount: 0},
  {id: 'PS006', category: 'セットメニュー', targetGrossMargin: 60, currentAvgMargin: 57, menuCount: 6, alertCount: 2},
]

// AI解析のダミー結果
const AI_RESULT: AnalyzedItem[] = [
  {name: '鶏もも肉', amount: '200g', unitPrice: 0.25, cost: 50},
  {name: '玉ねぎ', amount: '150g', unitPrice: 0.05, cost: 7.5},
  {name: 'にんじん', amount: '100g', unitPrice: 0.06, cost: 6},
  {name: 'じゃがいも', amount: '200g', unitPrice: 0.04, cost: 8},
  {name: 'バター', amount: '20g', unitPrice: 0.80, cost: 16},
  {name: '小麦粉', amount: '30g', unitPrice: 0.03, cost: 0.9},
  {name: '牛乳', amount: '100ml', unitPrice: 0.20, cost: 20},
  {name: '塩・胡椒', amount: '適量', unitPrice: 0, cost: 2},
]

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
  {id: 'calculator', label: '原価計算', icon: Calculator},
  {id: 'ingredients', label: '食材マスタ', icon: Package},
  {id: 'profit-standards', label: '粗利基準マスタ', icon: Settings},
]

// ==========================================
// タブビュー
// ==========================================

const CalculatorView = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalyzedItem[] | null>(null)
  const [recipeName, setRecipeName] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setResult(null)
    // 2秒のシミュレーション
    setTimeout(() => {
      setIsAnalyzing(false)
      setResult(AI_RESULT)
      setRecipeName('チキンクリームシチュー')
      setSellingPrice('980')
    }, 2000)
  }

  const totalCost = result ? result.reduce((sum, item) => sum + item.cost, 0) : 0
  const selling = parseFloat(sellingPrice) || 0
  const grossMargin = selling > 0 ? ((selling - totalCost) / selling) * 100 : 0

  return (
    <div className="space-y-6">
      {/* AI解析エリア */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-stone-800">AI原価解析</h3>
        </div>

        {/* アップロードエリア */}
        <div className="border-2 border-dashed border-emerald-200 rounded-xl p-8 text-center bg-emerald-50/30 mb-4">
          <Upload className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-stone-600 mb-1">レシピ画像をドラッグ＆ドロップ</p>
          <p className="text-xs text-stone-400 mb-4">または クリックしてファイルを選択</p>
          <div className="flex justify-center gap-3">
            <button className="px-4 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-600 hover:border-emerald-400 transition-colors">
              <Camera className="w-4 h-4 inline mr-1" />
              写真を撮影
            </button>
            <button className="px-4 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-600 hover:border-emerald-400 transition-colors">
              <Upload className="w-4 h-4 inline mr-1" />
              ファイル選択
            </button>
          </div>
        </div>

        {/* AI解析ボタン */}
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className={`w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
            isAnalyzing
              ? 'bg-stone-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/25'
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

      {/* 解析結果 */}
      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* レシピ情報 */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="font-bold text-stone-800 mb-4">解析結果</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-stone-500 block mb-1">レシピ名</label>
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">販売価格（税抜）</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* 食材リスト */}
            <div className="bg-stone-50 rounded-xl overflow-hidden border border-stone-200">
              <table className="w-full text-sm">
                <thead className="bg-stone-100 text-stone-500">
                  <tr>
                    <th className="px-4 py-2 text-left">食材名</th>
                    <th className="px-4 py-2 text-right">使用量</th>
                    <th className="px-4 py-2 text-right">単価</th>
                    <th className="px-4 py-2 text-right">原価</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {result.map((item, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-4 py-2 text-stone-700">{item.name}</td>
                      <td className="px-4 py-2 text-right text-stone-600">{item.amount}</td>
                      <td className="px-4 py-2 text-right text-stone-600">{item.unitPrice > 0 ? `¥${item.unitPrice}` : '-'}</td>
                      <td className="px-4 py-2 text-right font-medium text-stone-800">¥{item.cost.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-emerald-50 border-t-2 border-emerald-200">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 font-bold text-emerald-800">原価合計</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-800 text-lg">¥{totalCost.toFixed(1)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 粗利分析 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
              <p className="text-xs text-stone-500 mb-1">原価率</p>
              <p className={`text-2xl font-bold ${selling > 0 && (totalCost / selling) * 100 > 35 ? 'text-red-600' : 'text-emerald-600'}`}>
                {selling > 0 ? ((totalCost / selling) * 100).toFixed(1) : '---'}%
              </p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
              <p className="text-xs text-stone-500 mb-1">粗利額</p>
              <p className="text-2xl font-bold text-stone-800">¥{selling > 0 ? (selling - totalCost).toFixed(0) : '---'}</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
              <p className="text-xs text-stone-500 mb-1">粗利率</p>
              <p className={`text-2xl font-bold ${grossMargin >= 65 ? 'text-emerald-600' : grossMargin >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                {selling > 0 ? grossMargin.toFixed(1) : '---'}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const IngredientsView = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [...new Set(INGREDIENTS.map((i) => i.category))]
  const filtered = INGREDIENTS.filter(
    (i) =>
      (!searchTerm || i.name.includes(searchTerm) || i.supplier.includes(searchTerm)) &&
      (!selectedCategory || i.category === selectedCategory)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-stone-800">食材マスタ ({INGREDIENTS.length}件)</h3>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors">
          <Plus size={14} />
          食材追加
        </button>
      </div>

      {/* フィルター */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-stone-400" size={16} />
          <input
            type="text"
            placeholder="食材名・仕入先で検索..."
            className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              !selectedCategory ? 'bg-emerald-500 text-white border-transparent' : 'bg-white text-stone-500 border-stone-200 hover:border-emerald-200'
            }`}
          >
            全て
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedCategory === cat ? 'bg-emerald-500 text-white border-transparent' : 'bg-white text-stone-500 border-stone-200 hover:border-emerald-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* テーブル */}
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
                <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-medium text-stone-800">{item.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">{item.category}</span>
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
    </div>
  )
}

const ProfitStandardsView = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-bold text-stone-800">粗利基準マスタ</h3>
      <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors">
        <Plus size={14} />
        カテゴリ追加
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {PROFIT_STANDARDS.map((standard) => {
        const isBelow = standard.currentAvgMargin < standard.targetGrossMargin
        return (
          <div
            key={standard.id}
            className={`bg-white rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer ${
              isBelow ? 'border-red-200 hover:border-red-300' : 'border-stone-200 hover:border-emerald-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-stone-800">{standard.category}</h4>
                <span className="text-xs text-stone-500">{standard.menuCount}メニュー</span>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400" />
            </div>

            {/* 粗利バー */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-stone-500">現在の平均粗利率</span>
                <span className={`font-bold ${isBelow ? 'text-red-600' : 'text-emerald-600'}`}>
                  {standard.currentAvgMargin}%
                </span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden relative">
                {/* 目標ライン */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-stone-400 z-10"
                  style={{left: `${standard.targetGrossMargin}%`}}
                />
                {/* 現在値バー */}
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isBelow ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'}`}
                  style={{width: `${standard.currentAvgMargin}%`}}
                />
              </div>
              <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                <span>0%</span>
                <span>目標: {standard.targetGrossMargin}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* アラート */}
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
  </div>
)

// ==========================================
// メインコンポーネント
// ==========================================

export default function RecipeCalculatorMockPage() {
  const [activeTab, setActiveTab] = useState<TabId>('calculator')
  const [showSplash, setShowSplash] = useState(true)
  const [showInfoSidebar, setShowInfoSidebar] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashScreen theme="emerald" systemName="AI食品原価計算システム" subtitle="Smart Recipe Cost Calculator" />
  }

  const TAB_VIEWS: Record<TabId, React.ReactNode> = {
    calculator: <CalculatorView />,
    ingredients: <IngredientsView />,
    'profit-standards': <ProfitStandardsView />,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-emerald-50/30 font-sans">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/20">
              <Calculator className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-600">
                AI食品原価計算
              </h1>
              <p className="text-xs text-stone-400 -mt-0.5">Smart Recipe Cost Calculator</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'text-stone-600 hover:bg-stone-50 border border-transparent hover:border-emerald-200'
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {TAB_VIEWS[activeTab]}
      </main>

      {/* フローティング「機能説明」ボタン */}
      <button
        onClick={() => setShowInfoSidebar(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-green-700 transition-all duration-200"
      >
        <PanelRightOpen className="w-4 h-4" />
        <span className="text-sm font-medium">機能説明</span>
      </button>

      {/* 機能説明サイドバー */}
      <InfoSidebar
        isOpen={showInfoSidebar}
        onClose={() => setShowInfoSidebar(false)}
        theme="emerald"
        systemIcon={Calculator}
        systemName="AI食品原価計算システム"
        systemDescription="AIでレシピ画像や手書きメモから食材を自動認識し、原価を瞬時に算出するシステムです。食材マスタと粗利基準の管理で収益性の向上を支援します。"
        features={FEATURES}
        timeEfficiency={TIME_EFFICIENCY}
        challenges={CHALLENGES}
      />
    </div>
  )
}
