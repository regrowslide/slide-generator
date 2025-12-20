'use client'

import { useState } from 'react'
import { Table, LayoutGrid, Columns, Info } from 'lucide-react'
import { WorksTable } from './components/WorksTable'
import { WorksCard } from './components/WorksCard'
import { WorksHybrid } from './components/WorksHybrid'

type ViewMode = 'table' | 'card' | 'hybrid'

const viewModes: { id: ViewMode; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'table',
    label: 'テーブル形式',
    icon: <Table className="h-5 w-5" />,
    description: '一覧性重視。ソート・フィルター機能付き。実績数が多い場合に最適。',
  },
  {
    id: 'card',
    label: 'カード形式',
    icon: <LayoutGrid className="h-5 w-5" />,
    description: 'ビジュアル重視。Before/After形式で成果を強調。訴求力が高い。',
  },
  {
    id: 'hybrid',
    label: 'ハイブリッド',
    icon: <Columns className="h-5 w-5" />,
    description: '一覧と詳細を同時表示。Notionライクな操作感。',
  },
]

export default function WorksSamplePage() {
  const [currentView, setCurrentView] = useState<ViewMode>('table')

  const currentMode = viewModes.find(m => m.id === currentView)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 py-8 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold">SAMPLE</span>
            <h1 className="text-2xl font-bold sm:text-3xl">実績一覧 UIパターン比較</h1>
          </div>
          <p className="mt-2 text-blue-200">
            3つのUIパターンを比較できます。タブを切り替えてお好みのデザインをご確認ください。
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* タブナビゲーション */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row">
            {viewModes.map(mode => (
              <button
                key={mode.id}
                onClick={() => setCurrentView(mode.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ${currentView === mode.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {mode.icon}
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* モード説明 */}
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <div className="font-medium text-blue-900">{currentMode?.label}</div>
            <p className="text-sm text-blue-700">{currentMode?.description}</p>
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
          {currentView === 'table' && <WorksTable />}
          {currentView === 'card' && <WorksCard />}
          {currentView === 'hybrid' && <WorksHybrid />}
        </div>

        {/* テーブル設計ドキュメント */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">推奨テーブル設計</h2>
          <p className="mb-4 text-sm text-gray-600">
            以下のフィールドを追加することで、集客効果・信頼性が向上します。
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">フィールド</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">型</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">目的・効果</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-2 font-medium text-blue-600">companyScale</td>
                  <td className="px-4 py-2 text-gray-600">String</td>
                  <td className="px-4 py-2 text-gray-600">企業規模で絞り込み可能に。「同規模の実績がある」安心感</td>
                </tr>
                <tr className="bg-amber-50">
                  <td className="px-4 py-2 font-medium text-amber-700">beforeChallenge</td>
                  <td className="px-4 py-2 text-gray-600">String</td>
                  <td className="px-4 py-2 text-gray-600">
                    <span className="font-semibold">【重要】</span>導入前の課題。共感を生み、問い合わせのきっかけに
                  </td>
                </tr>
                <tr className="bg-green-50">
                  <td className="px-4 py-2 font-medium text-green-700">quantitativeResult</td>
                  <td className="px-4 py-2 text-gray-600">String</td>
                  <td className="px-4 py-2 text-gray-600">
                    <span className="font-semibold">【最重要】</span>定量成果。具体的な数字が信頼に直結
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-blue-600">projectDuration</td>
                  <td className="px-4 py-2 text-gray-600">String</td>
                  <td className="px-4 py-2 text-gray-600">プロジェクト期間。費用感・スケジュール感の目安</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-blue-600">customerVoice</td>
                  <td className="px-4 py-2 text-gray-600">String</td>
                  <td className="px-4 py-2 text-gray-600">お客様の声。第三者評価による信頼性向上</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-800">集客効果を最大化するポイント</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600"></span>
                <span>
                  <strong>定量的な成果を必ず記載：</strong>「業務が効率化」→「月30時間を2時間に短縮（93%削減）」
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600"></span>
                <span>
                  <strong>Before/After形式：</strong>課題と成果を対比させ、変化を明確に
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600"></span>
                <span>
                  <strong>業種×課題のフィルタリング：</strong>「自分のケースに対応できる」という確信を与える
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600"></span>
                <span>
                  <strong>お客様の声：</strong>自社の宣伝文句より、実際の顧客の声の方が説得力が高い
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="mt-8 border-t border-gray-200 bg-gray-50 py-6 text-center text-sm text-gray-500">
        <p>このページはサンプル表示用です。実際のデータは含まれていません。</p>
      </footer>
    </div>
  )
}










