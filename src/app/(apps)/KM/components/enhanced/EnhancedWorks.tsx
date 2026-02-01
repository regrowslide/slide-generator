'use client'

import { useState, useMemo, useCallback } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Padding } from '@cm/components/styles/common-components/common-components'
import { CompactWorkCard } from './works/CompactWorkCard'
import { WorkDetailModal } from './works/WorkDetailModal'
import { useWorksFilter } from '../../hooks/useWorksFilter'
import { getUniqueValues, isPopularCategory } from '../../utils/worksUtils'
import { INTERSECTION_OBSERVER_CONFIG } from '../../constants/worksConstants'
import type { CategoryType } from '../../types/works'

// 初期表示件数
const INITIAL_DISPLAY_COUNT = 6

export const EnhancedWorks = ({ works }: { works: any[] }) => {
  const { ref, inView } = useInView({
    triggerOnce: INTERSECTION_OBSERVER_CONFIG.TRIGGER_ONCE,
    threshold: INTERSECTION_OBSERVER_CONFIG.THRESHOLD,
  })

  const publicWorks = useMemo(() => works.filter((row) => row.isPublic && row.description), [works])
  const [selectedWork, setSelectedWork] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const {
    filteredWorks,
    searchQuery,
    selectedCategory,
    selectedCategoryType,
    setSearchQuery,
    handleCategoryClick,
    resetFilters,
  } = useWorksFilter({ works: publicWorks })

  const jobCategories = useMemo(() => getUniqueValues(publicWorks, 'jobCategory'), [publicWorks])
  const systemCategories = useMemo(() => getUniqueValues(publicWorks, 'systemCategory'), [publicWorks])

  const handleWorkClick = useCallback((work: any) => {
    setSelectedWork(work)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedWork(null)
  }, [])

  // 表示するworks（展開状態によって変わる）
  const displayedWorks = useMemo(() => {
    if (isExpanded) {
      return filteredWorks
    }
    return filteredWorks.slice(0, INITIAL_DISPLAY_COUNT)
  }, [filteredWorks, isExpanded])

  // 残り件数
  const remainingCount = filteredWorks.length - INITIAL_DISPLAY_COUNT

  // フィルターが変わったら折りたたむ
  const handleResetFilters = useCallback(() => {
    resetFilters()
    setIsExpanded(false)
  }, [resetFilters])

  // カテゴリークリック時も折りたたむ
  const handleCategoryClickWithCollapse = useCallback(
    (category: string, type: CategoryType) => {
      handleCategoryClick(category, type)
      setIsExpanded(false)
    },
    [handleCategoryClick]
  )

  return (
    <div className="w-full">
      <Padding className="relative">
        <div ref={ref} className="py-8">
          {/* ヘッダー */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-2">
              <span className="text-sm font-semibold uppercase tracking-wide text-blue-700">Works</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">実績・制作物</h2>
            <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg">様々な業界・業種で業務改善を実現してきました</p>
          </div>

          {/* 検索バー */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setIsExpanded(false)
                }}
                placeholder="キーワードで検索（タイトル、説明など）"
                className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setIsExpanded(false)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* カテゴリータブ */}
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-700">すべてのカテゴリー</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* 業界・業種タブ */}
              {jobCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {jobCategories.map((category) => {
                    const isPopular = isPopularCategory(publicWorks, category, 'jobCategory')
                    const isSelected = selectedCategory === category && selectedCategoryType === 'jobCategory'
                    return (
                      <button
                        key={`job-${category}`}
                        onClick={() => handleCategoryClickWithCollapse(category, 'jobCategory' as CategoryType)}
                        className={`group relative inline-flex items-center gap-2 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200 opacity-50'
                        }`}
                      >
                        <span>{category}</span>
                        {isPopular && (
                          <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-xs font-bold text-white">
                            人気
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* ツール種類タブ */}
              {systemCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {systemCategories.map((category) => {
                    const isPopular = isPopularCategory(publicWorks, category, 'systemCategory')
                    const isSelected = selectedCategory === category && selectedCategoryType === 'systemCategory'
                    return (
                      <button
                        key={`system-${category}`}
                        onClick={() => handleCategoryClickWithCollapse(category, 'systemCategory' as CategoryType)}
                        className={`group relative inline-flex items-center gap-2 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 opacity-50'
                        }`}
                      >
                        <span>{category}</span>
                        {isPopular && (
                          <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-xs font-bold text-white">
                            人気
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* フィルターリセット */}
          {(searchQuery || selectedCategory) && (
            <div className="mb-6 flex items-center gap-2">
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                フィルターをリセット
              </button>
              <span className="text-sm text-gray-600">{filteredWorks.length}件の実績が見つかりました</span>
            </div>
          )}

          {/* 実績カード一覧 */}
          <div className="w-full">
            {filteredWorks.length > 0 ? (
              <>
                <motion.div layout className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {displayedWorks.map((work, index) => (
                      <motion.div
                        key={work.id || index}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: index >= INITIAL_DISPLAY_COUNT ? (index - INITIAL_DISPLAY_COUNT) * 0.05 : 0 }}
                      >
                        <CompactWorkCard work={work} onClick={() => handleWorkClick(work)} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* 続きを見るボタン / 表示件数 */}
                <div className="mt-8 text-center">
                  {!isExpanded && remainingCount > 0 ? (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setIsExpanded(true)}
                      className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl active:scale-95"
                    >
                      <span>続きを見る（残り {remainingCount} 件）</span>
                      <ChevronDown className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
                    </motion.button>
                  ) : (
                    <div className="inline-block rounded-full bg-blue-100 px-6 py-3">
                      <span className="text-base font-semibold text-blue-700">
                        {filteredWorks.length}件の実績を表示中
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-gray-50 p-12 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-lg text-gray-600">該当する実績が見つかりませんでした</p>
                <p className="mt-2 text-sm text-gray-500">別の条件で検索してみてください</p>
                {(searchQuery || selectedCategory) && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-all hover:bg-blue-700"
                  >
                    フィルターをリセット
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </Padding>

      {/* 実績詳細モーダル */}
      <WorkDetailModal work={selectedWork} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  )
}
