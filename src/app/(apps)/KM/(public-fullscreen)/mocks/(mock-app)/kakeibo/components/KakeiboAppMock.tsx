'use client'

import { useEffect, useState } from 'react'
import type { PageId } from './types'
import InputPage from './InputPage'
import MasterCategoryPage from './MasterCategoryPage'
import MasterPaymentPage from './MasterPaymentPage'
import AnnualTransitionPage from './AnnualTransitionPage'
import IncomeExpenseVisualization from './IncomeExpenseVisualization'
import PaymentManagementPage from './PaymentManagementPage'
import SatisfactionReviewPage from './SatisfactionReviewPage'
import LifePlanPage from './LifePlanPage'
import AssetProjectionPage from './AssetProjectionPage'
import CalendarPage from './CalendarPage'

// ==========================================
// 型定義
// ==========================================

type Props = {
  externalPage: PageId
  onPageChange: (page: PageId) => void
}

// ==========================================
// 入力履歴ページ（簡易）
// ==========================================

import { useKakeiboMockData } from '../context/MockDataContext'

const HistoryPage = () => {
  const { transactions, categories, paymentMethods, selectedYear, selectedMonth, deleteTransaction } = useKakeiboMockData()

  // 選択中の月のトランザクションを取得
  const monthTxs = transactions.filter((tx) => {
    const d = new Date(tx.date)
    return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth
  })

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id
  const getPaymentName = (id: string) => paymentMethods.find((p) => p.id === id)?.name ?? id

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        {selectedYear}年{selectedMonth}月 入力履歴（{monthTxs.length}件）
      </h2>
      {monthTxs.length === 0 ? (
        <p className="text-gray-400 text-center py-12">この月のデータはありません</p>
      ) : (
        <div className="space-y-2">
          {monthTxs.map((tx) => (
            <div key={tx.id} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{tx.date.slice(5)}</span>
                <span className="font-medium text-sm">{getCategoryName(tx.categoryId)}</span>
                {tx.satisfaction && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${tx.satisfaction === '〇' ? 'bg-green-50 text-green-600' : tx.satisfaction === '△' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                    {tx.satisfaction}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{getPaymentName(tx.paymentMethodId)}</span>
                <span className="font-bold text-sm">¥{tx.amount.toLocaleString()}</span>
                <button onClick={() => { if (confirm('削除しますか？')) deleteTransaction(tx.id) }} className="text-red-300 hover:text-red-500 text-xs">削除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==========================================
// メインコンポーネント
// ==========================================

export default function KakeiboAppMock({ externalPage, onPageChange }: Props) {
  const [currentPage, setCurrentPage] = useState<PageId>(externalPage)

  // 外部からのページ変更を反映
  useEffect(() => {
    if (externalPage !== currentPage) {
      setCurrentPage(externalPage)
    }
  }, [externalPage])

  // ページルーティング
  const renderPage = () => {
    switch (currentPage) {
      case 'input':
        return <InputPage />
      case 'history':
        return <HistoryPage />
      case 'calendar':
        return <CalendarPage />
      case 'master-category':
        return <MasterCategoryPage />
      case 'master-payment':
        return <MasterPaymentPage />
      case 'annual-transition':
        return <AnnualTransitionPage />
      case 'income-expense-viz':
        return <IncomeExpenseVisualization />
      case 'payment-management':
        return <PaymentManagementPage />
      case 'satisfaction-review':
        return <SatisfactionReviewPage />
      case 'life-plan':
        return <LifePlanPage />
      case 'asset-projection':
        return <AssetProjectionPage />
      default:
        return <div className="flex items-center justify-center h-96 text-gray-400"><p>ページが見つかりません</p></div>
    }
  }

  return (
    <main className="flex-1 overflow-auto">
      {renderPage()}
    </main>
  )
}
