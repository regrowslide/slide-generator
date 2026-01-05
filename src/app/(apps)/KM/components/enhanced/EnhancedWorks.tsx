'use client'

import { Padding } from '@cm/components/styles/common-components/common-components'
import { WorkCard } from '@app/(apps)/KM/(public)/top/WorkCard'
import { useState, useMemo } from 'react'
import { Search, Filter, X, Sparkles, ExternalLink, Star, TrendingUp } from 'lucide-react'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import Image from 'next/image'

// コンパクトな実績カードコンポーネント
const CompactWorkCard = ({
  work,
  onClick
}: {
  work: any
  onClick: () => void
}) => {

  const descriptionPreview = work.description
    ? (work.description.length > 120 ? work.description.substring(0, 120) + '...' : work.description)
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="group cursor-pointer rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
    >
      {/* ヘッダー */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1">

          <div className={`flex gap-1 items-center`}>
            {work.allowShowClient && work.KaizenClient?.iconUrl && (
              <div >
                <Image
                  height={40}
                  width={40}

                  src={work.KaizenClient?.iconUrl}
                  alt={work.KaizenClient?.name}
                // className="w-full h-full object-cover"

                />
              </div>
            )}
            <h3 className="mb-1  font-bold text-gray-900 group-hover:text-blue-600 transition-colors ">
              {work.title}
            </h3>
          </div>
          {work.subtitle && (
            <p className="text-sm text-gray-600">{work.subtitle}</p>
          )}
        </div>
        <ExternalLink className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>

      {/* カテゴリーと評価 */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {work.jobCategory && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            {work.jobCategory}
          </span>
        )}
        {work.systemCategory && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            {work.systemCategory}
          </span>
        )}
        {(work.dealPoint || work.toolPoint) && (
          <div className="ml-auto flex items-center gap-2">
            {work.dealPoint && (
              <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1">
                <Star className="h-3 w-3 text-amber-600" />
                <span className="text-xs font-bold text-amber-700">{work.dealPoint}</span>
              </div>
            )}
            {work.toolPoint && (
              <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1">
                <TrendingUp className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-bold text-blue-700">{work.toolPoint}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 説明プレビュー */}
      {descriptionPreview && (
        <p className="text-sm text-gray-600 line-clamp-2">{descriptionPreview}</p>
      )}

      {/* ホバー時のインジケーター */}
      <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="font-semibold">詳細を見る</span>
        <ExternalLink className="h-3 w-3" />
      </div>
    </motion.div>
  )
}

// モーダルコンポーネント
const WorkDetailModal = ({
  work,
  isOpen,
  onClose
}: {
  work: any | null
  isOpen: boolean
  onClose: () => void
}) => {
  if (!work) return null

  return (
    <ShadModal
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) onClose()
      }}
      title="実績詳細"
      className="p-0"
      style={{
        maxWidth: '90vw',
        width: '100%',
        maxHeight: '90vh',
      }}
      childrenProps={{
        className: 'p-6 max-h-[calc(90vh-120px)] overflow-y-auto',
      }}
    >
      <WorkCard work={work} />
    </ShadModal>
  )
}

export const EnhancedWorks = ({ works }: { works: any[] }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.05,
  })

  const publicWorks = useMemo(() => works.filter((row) => row.isPublic && row.description), [works])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCategoryType, setSelectedCategoryType] = useState<'jobCategory' | 'systemCategory' | null>(null)
  const [selectedWork, setSelectedWork] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // カテゴリーの一意な値を取得
  const getUniqueValues = (key: string) => {
    return Array.from(new Set(publicWorks.map(work => work[key]).filter(Boolean)))
  }

  const jobCategories = getUniqueValues('jobCategory')
  const systemCategories = getUniqueValues('systemCategory')

  // カテゴリーごとの実績数をカウント
  const getCategoryCount = (category: string, type: 'jobCategory' | 'systemCategory') => {
    return publicWorks.filter(work => work[type] === category).length
  }

  // 人気カテゴリーを判定（3件以上）
  const isPopularCategory = (category: string, type: 'jobCategory' | 'systemCategory') => {
    return getCategoryCount(category, type) >= 3
  }

  // 人気カテゴリーを取得
  const popularCategories = useMemo(() => {
    const popular: Array<{ category: string; type: 'jobCategory' | 'systemCategory'; count: number }> = []

    jobCategories.forEach(cat => {
      const count = getCategoryCount(cat, 'jobCategory')
      if (count >= 3) popular.push({ category: cat, type: 'jobCategory', count })
    })

    systemCategories.forEach(cat => {
      const count = getCategoryCount(cat, 'systemCategory')
      if (count >= 3) popular.push({ category: cat, type: 'systemCategory', count })
    })

    // 実績数が多い順にソート
    return popular.sort((a, b) => b.count - a.count)
  }, [publicWorks, jobCategories, systemCategories])

  // フィルタリングされた実績
  const filteredWorks = useMemo(() => {
    return publicWorks.filter(work => {
      // 検索クエリでフィルタ
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const titleMatch = work.title?.toLowerCase().includes(query)
        const subtitleMatch = work.subtitle?.toLowerCase().includes(query)
        const descriptionMatch = work.description?.toLowerCase().includes(query)
        if (!titleMatch && !subtitleMatch && !descriptionMatch) return false
      }

      // カテゴリーでフィルタ
      if (selectedCategory && selectedCategoryType) {
        if (work[selectedCategoryType] !== selectedCategory) return false
      }

      return true
    })
  }, [publicWorks, searchQuery, selectedCategory, selectedCategoryType])

  const handleReset = () => {
    setSearchQuery('')
    setSelectedCategory(null)
    setSelectedCategoryType(null)
  }

  const handleCategoryClick = (category: string, type: 'jobCategory' | 'systemCategory') => {
    if (selectedCategory === category && selectedCategoryType === type) {
      // 同じカテゴリーをクリックしたら解除
      setSelectedCategory(null)
      setSelectedCategoryType(null)
    } else {
      setSelectedCategory(category)
      setSelectedCategoryType(type)
    }
  }

  const handleWorkClick = (work: any) => {
    setSelectedWork(work)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedWork(null)
  }





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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="キーワードで検索（タイトル、説明など）"
                className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
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
                    const isPopular = isPopularCategory(category, 'jobCategory')
                    const isSelected = selectedCategory === category && selectedCategoryType === 'jobCategory'
                    return (
                      <button
                        key={`job-${category}`}
                        onClick={() => handleCategoryClick(category, 'jobCategory')}
                        className={`group relative inline-flex items-center gap-2  cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-all ${isSelected
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
                    const isPopular = isPopularCategory(category, 'systemCategory')
                    const isSelected = selectedCategory === category && selectedCategoryType === 'systemCategory'
                    return (
                      <button
                        key={`system-${category}`}
                        onClick={() => handleCategoryClick(category, 'systemCategory')}
                        className={`group relative inline-flex items-center gap-2  cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-all ${isSelected
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
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                フィルターをリセット
              </button>
              <span className="text-sm text-gray-600">
                {filteredWorks.length}件の実績が見つかりました
              </span>
            </div>
          )}

          {/* 実績カード一覧 */}
          <div className="w-full">
            {filteredWorks.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredWorks.map((work, index) => (
                    <CompactWorkCard
                      key={work.id || index}
                      work={work}
                      onClick={() => handleWorkClick(work)}
                    />
                  ))}
                </div>

                {/* 表示件数 */}
                {filteredWorks.length > 0 && (
                  <div className="mt-8 text-center">
                    <div className="inline-block rounded-full bg-blue-100 px-6 py-3">
                      <span className="text-base font-semibold text-blue-700">
                        {filteredWorks.length}件の実績を表示中
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl bg-gray-50 p-12 text-center"
              >
                <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-lg text-gray-600">該当する実績が見つかりませんでした</p>
                <p className="mt-2 text-sm text-gray-500">別の条件で検索してみてください</p>
                {(searchQuery || selectedCategory) && (
                  <button
                    onClick={handleReset}
                    className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white font-semibold transition-all hover:bg-blue-700"
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
      <WorkDetailModal
        work={selectedWork}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
