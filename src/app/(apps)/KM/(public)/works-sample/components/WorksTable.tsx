'use client'

import { useState, useMemo } from 'react'
import {
  ChevronUp,
  ChevronDown,
  Star,
  Building2,
  Clock,
  Search,
  Filter,
  X,
  ArrowUpDown,
} from 'lucide-react'
import { WorkSampleData, sampleWorks, jobCategories, systemCategories, companyScales } from './sampleData'

type SortKey = keyof WorkSampleData | null
type SortOrder = 'asc' | 'desc'

interface FilterState {
  keyword: string
  jobCategory: string
  systemCategory: string
  companyScale: string
}

export const WorksTable = () => {
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedWork, setSelectedWork] = useState<WorkSampleData | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    jobCategory: '',
    systemCategory: '',
    companyScale: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  // ソート処理
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('desc')
    }
  }

  // フィルタリング & ソート
  const filteredAndSortedWorks = useMemo(() => {
    let result = [...sampleWorks]

    // フィルタリング
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      result = result.filter(
        work =>
          work.title.toLowerCase().includes(keyword) ||
          work.description.toLowerCase().includes(keyword) ||
          work.beforeChallenge.toLowerCase().includes(keyword) ||
          work.clientName.toLowerCase().includes(keyword)
      )
    }
    if (filters.jobCategory) {
      result = result.filter(work => work.jobCategory === filters.jobCategory)
    }
    if (filters.systemCategory) {
      result = result.filter(work => work.systemCategory === filters.systemCategory)
    }
    if (filters.companyScale) {
      result = result.filter(work => work.companyScale === filters.companyScale)
    }

    // ソート
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [filters, sortKey, sortOrder])

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="ml-1 h-4 w-4 text-blue-600" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4 text-blue-600" />
    )
  }

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      <span className="font-semibold text-amber-600">{rating}</span>
      <div className="flex">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < Math.ceil(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
          />
        ))}
      </div>
    </div>
  )

  const clearFilters = () => {
    setFilters({ keyword: '', jobCategory: '', systemCategory: '', companyScale: '' })
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  return (
    <div className="space-y-4">
      {/* フィルターセクション */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* キーワード検索 */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="キーワードで検索..."
              value={filters.keyword}
              onChange={e => setFilters({ ...filters, keyword: e.target.value })}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* フィルタートグル */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${showFilters || hasActiveFilters
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Filter className="h-4 w-4" />
            フィルター
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                {Object.values(filters).filter(v => v !== '').length}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              クリア
            </button>
          )}
        </div>

        {/* 詳細フィルター */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-200 pt-4 sm:grid-cols-3">
            <select
              value={filters.jobCategory}
              onChange={e => setFilters({ ...filters, jobCategory: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">業種・業界（すべて）</option>
              {jobCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={filters.systemCategory}
              onChange={e => setFilters({ ...filters, systemCategory: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">ソリューション（すべて）</option>
              {systemCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={filters.companyScale}
              onChange={e => setFilters({ ...filters, companyScale: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">企業規模（すべて）</option>
              {companyScales.map(scale => (
                <option key={scale} value={scale}>
                  {scale}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 件数表示 */}
      <div className="text-sm text-gray-600">
        {filteredAndSortedWorks.length}件の実績を表示中
        {hasActiveFilters && `（全${sampleWorks.length}件中）`}
      </div>

      {/* テーブル */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
              <tr>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-semibold hover:bg-blue-700/50"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    日付
                    <SortIcon columnKey="date" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">お客様名</th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-semibold hover:bg-blue-700/50"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                    案件名
                    <SortIcon columnKey="title" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">業種</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">ソリューション</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">課題</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">成果</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">期間</th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-semibold hover:bg-blue-700/50"
                  onClick={() => handleSort('toolPoint')}
                >
                  <div className="flex items-center">
                    評価
                    <SortIcon columnKey="toolPoint" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAndSortedWorks.map(work => (
                <tr
                  key={work.id}
                  className="cursor-pointer transition-colors hover:bg-blue-50"
                  onClick={() => setSelectedWork(work)}
                >
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(work.date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {work.allowShowClient ? (
                        <>
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">{work.clientName}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">非公開</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{work.title}</div>
                      <div className="text-xs text-gray-500">{work.subtitle}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                      {work.jobCategory}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                      {work.systemCategory}
                    </span>
                  </td>
                  <td className="max-w-[200px] px-4 py-3">
                    <p className="truncate text-sm text-gray-600">{work.beforeChallenge}</p>
                  </td>
                  <td className="max-w-[200px] px-4 py-3">
                    <p className="truncate text-sm font-medium text-blue-600">
                      {work.quantitativeResult.split('\n')[0]}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {work.projectDuration}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StarRating rating={work.toolPoint} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 詳細モーダル */}
      {selectedWork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedWork(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-800 to-blue-900 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedWork.title}</h2>
                  <p className="mt-1 text-blue-200">{selectedWork.subtitle}</p>
                </div>
                <button
                  onClick={() => setSelectedWork(null)}
                  className="rounded-full p-2 hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm">{selectedWork.jobCategory}</span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm">{selectedWork.systemCategory}</span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm">{selectedWork.collaborationTool}</span>
              </div>
            </div>

            {/* モーダル本文 */}
            <div className="p-6 space-y-6">
              {/* 顧客情報 */}
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">お客様</div>
                    <div className="font-medium">
                      {selectedWork.allowShowClient ? selectedWork.clientName : '非公開'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">企業規模</div>
                  <div className="font-medium">{selectedWork.companyScale}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">期間</div>
                  <div className="font-medium">{selectedWork.projectDuration}</div>
                </div>
              </div>

              {/* Before/After */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                  <div className="mb-2 text-sm font-semibold text-red-700">Before（導入前の課題）</div>
                  <p className="text-gray-700">{selectedWork.beforeChallenge}</p>
                </div>
                <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                  <div className="mb-2 text-sm font-semibold text-green-700">After（導入効果）</div>
                  <p className="whitespace-pre-line font-medium text-gray-700">
                    {selectedWork.quantitativeResult}
                  </p>
                </div>
              </div>

              {/* ソリューション詳細 */}
              <div>
                <h3 className="mb-2 font-semibold text-gray-900">提供ソリューション</h3>
                <p className="text-gray-700">{selectedWork.description}</p>
              </div>

              {/* 技術的工夫 */}
              {selectedWork.points && (
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">技術的工夫・ポイント</h3>
                  <p className="text-gray-700">{selectedWork.points}</p>
                </div>
              )}

              {/* 顧客の声 */}
              {selectedWork.customerVoice && (
                <div className="rounded-lg bg-amber-50 p-4">
                  <h3 className="mb-2 font-semibold text-amber-800">お客様の声</h3>
                  <p className="italic text-gray-700">「{selectedWork.customerVoice}」</p>
                  {selectedWork.reply && (
                    <div className="mt-3 border-t border-amber-200 pt-3">
                      <div className="text-sm font-medium text-amber-700">改善マニアより</div>
                      <p className="text-sm text-gray-600">{selectedWork.reply}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 評価 */}
              <div className="flex items-center gap-6 rounded-lg bg-gray-50 p-4">
                <div>
                  <div className="text-sm text-gray-500">取引評価</div>
                  <StarRating rating={selectedWork.dealPoint} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">成果物評価</div>
                  <StarRating rating={selectedWork.toolPoint} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
