'use client'
import { Kaizen } from '@app/(apps)/KM/class/Kaizen'
import SlateEditor from '@cm/components/SlateEditor/SlateEditor'


import BasicCarousel from '@cm/components/utils/Carousel/BasicCarousel'
import ContentPlayer from '@cm/components/utils/ContentPlayer'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import {
  StarIcon,
  BuildingIcon,
  ClockIcon,
  TrendingUpIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  MessageCircleIcon,
  WrenchIcon,
  XIcon,
  UsersIcon,
  Maximize2Icon,
} from 'lucide-react'

import useWindowSize from '@cm/hooks/useWindowSize'
import { cl } from '@cm/lib/methods/common'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export const WorkCard = ({ work }) => {
  const { width } = useWindowSize()
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const {
    title,
    KaizenClient,
    subtitle,
    allowShowClient,
    description,
    beforeChallenge,
    quantitativeResult,
    points,
    impression,
    reply,
    KaizenWorkImage,
    dealPoint,
    toolPoint,
    jobCategory,
    systemCategory,
    collaborationTool,
    companyScale,
    projectDuration,
  } = work

  const [ready, setready] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setready(true)
    }, 300)
  }, [])
  if (!ready) return <PlaceHolder></PlaceHolder>

  const isMobile = width < 640

  // 定量成果の最初の行を取得（フォールバック対応）
  const mainResult = quantitativeResult?.split('\n')[0] || description?.substring(0, 50)

  return (
    <>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
          {/* ヘッダー */}
          <div className="relative bg-gradient-to-r from-blue-800 via-blue-900 to-blue-950 p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="mt-1 text-sm text-blue-200">{subtitle}</p>
              </div>
              {allowShowClient && KaizenClient?.iconUrl && (
                <div className="w-fit rounded-lg bg-white p-1 shadow-md">
                  <ContentPlayer
                    {...{
                      styles: { thumbnail: { width: isMobile ? 40 : 50, height: isMobile ? 40 : 50 } },
                      src: KaizenClient?.iconUrl,
                    }}
                  />
                </div>
              )}
            </div>

            {/* タグ */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Tags {...{ work }} isHeader />
            </div>
          </div>

          {/* 顧客・期間情報 */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
            <div className="flex items-center gap-2">
              <BuildingIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {allowShowClient && KaizenClient?.name ? KaizenClient.name : '匿名のお客様'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {projectDuration && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4" />
                  {projectDuration}
                </div>
              )}
              {companyScale && (
                <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600">{companyScale}</span>
              )}
            </div>
          </div>

          {/* 画像カルーセル */}
          {KaizenWorkImage?.length > 0 && (
            <div className="border-b border-gray-100 bg-gray-50 p-2 sm:p-3">
              <BasicCarousel
                {...{
                  imgStyle: {},
                  Images: KaizenWorkImage?.map(obj => ({ imageUrl: obj.url })),
                }}
              />
            </div>
          )}

          {/* メインコンテンツ */}
          <div className="p-5">
            {/* 成果ハイライト */}
            {mainResult && (
              <div className="mb-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                  <TrendingUpIcon className="h-5 w-5" />
                  導入効果
                </div>
                <div className="mt-2 text-lg font-bold text-green-800">{mainResult}</div>
              </div>
            )}

            {/* Before/After（サマリー） */}
            {(beforeChallenge || description) && (
              <div className="space-y-3">
                {/* Before */}
                {beforeChallenge && (
                  <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-red-600">
                      <AlertCircleIcon className="h-4 w-4" />
                      導入前の課題
                    </div>
                    <p className="mt-1 text-sm text-gray-700 line-clamp-2">{beforeChallenge}</p>
                  </div>
                )}

                {/* After */}
                {(quantitativeResult || description) && (
                  <div className="rounded-lg border border-green-200 bg-green-50/50 p-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-green-600">
                      <CheckCircle2Icon className="h-4 w-4" />
                      解決後の成果
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm font-medium text-gray-700 line-clamp-3">
                      {quantitativeResult || description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 詳細を見るボタン */}
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Maximize2Icon className="h-4 w-4" />
              詳細を見る
            </button>
          </div>

          {/* フッター - 評価 */}
          <div className="flex items-center justify-center gap-8 border-t border-gray-100 bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3">
            <ReviewScore {...{ dealPoint, toolPoint }} />
          </div>
        </div>
      </motion.div>

      {/* 詳細モーダル */}
      {showModal && <WorkDetailModal work={work} onClose={() => setShowModal(false)} />}
    </>
  )
}

// タグコンポーネント
const Tags = ({ work, isHeader = false }) => {
  const jobTags = Kaizen.KaizenWork.parseTags(work.jobCategory).flat()
  const systemTags = Kaizen.KaizenWork.parseTags(work.systemCategory).flat()
  const toolTags = Kaizen.KaizenWork.parseTags(work.collaborationTool).flat()

  if (isHeader) {
    return (
      <>
        {jobTags.map((tag, idx) => (
          <span
            key={`job-${idx}`}
            className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-200"
          >
            {tag}
          </span>
        ))}
        {systemTags.map((tag, idx) => (
          <span
            key={`sys-${idx}`}
            className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-purple-200"
          >
            {tag}
          </span>
        ))}
        {toolTags.map((tag, idx) => (
          <span
            key={`tool-${idx}`}
            className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-200"
          >
            {tag}
          </span>
        ))}
      </>
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {jobTags.map((tag, idx) => (
        <span
          key={`job-${idx}`}
          className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 shadow-sm sm:text-sm"
        >
          @{tag}
        </span>
      ))}
      {systemTags.map((tag, idx) => (
        <span
          key={`sys-${idx}`}
          className="inline-flex items-center rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 shadow-sm sm:text-sm"
        >
          {tag}
        </span>
      ))}
      {toolTags.map((tag, idx) => (
        <span
          key={`tool-${idx}`}
          className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 shadow-sm sm:text-sm"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

// レビュースコア
const ReviewScore = ({ dealPoint, toolPoint }) => {
  if (!dealPoint && !toolPoint) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-600 sm:text-sm">
        <StarIcon className="h-4 w-4 text-gray-400" />
        <span>レビュー投稿待ち</span>
      </div>
    )
  }

  const StarRating = ({ rating, label }: { rating: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="flex items-center gap-1">
        <span className="text-lg font-bold text-amber-600">{rating}</span>
        <div className="flex">
          {Array.from({ length: 5 }, (_, i) => (
            <StarIcon
              key={i}
              className={cl(
                'h-3 w-3',
                i < Math.ceil(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {dealPoint && <StarRating rating={dealPoint} label="取引評価" />}
      {dealPoint && toolPoint && <div className="h-8 w-px bg-amber-200"></div>}
      {toolPoint && <StarRating rating={toolPoint} label="成果物評価" />}
    </>
  )
}

// 詳細モーダル
const WorkDetailModal = ({ work, onClose }) => {
  const {
    title,
    subtitle,
    KaizenClient,
    allowShowClient,
    description,
    beforeChallenge,
    quantitativeResult,
    points,
    impression,
    reply,
    KaizenWorkImage,
    dealPoint,
    toolPoint,
    jobCategory,
    systemCategory,
    collaborationTool,
    companyScale,
    projectDuration,
  } = work

  const StarRating = ({ rating, label }: { rating: number; label: string }) => (
    <div className="text-center">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="flex items-center justify-center gap-1 mt-1">
        <span className="text-2xl font-bold text-amber-600">{rating}</span>
        <div className="flex">
          {Array.from({ length: 5 }, (_, i) => (
            <StarIcon
              key={i}
              className={`h-5 w-5 ${i < Math.ceil(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[95vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* モーダルヘッダー */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-800 via-blue-900 to-blue-950 p-6 lg:p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold text-white lg:text-3xl">{title}</h2>
              <p className="mt-2 text-lg text-blue-200">{subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* タグ */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Tags work={work} isHeader />
          </div>
        </div>

        {/* モーダル本文 */}
        <div className="max-h-[calc(95vh-200px)] overflow-y-auto p-6 lg:p-8">
          {/* メタ情報 */}
          <div className="mb-8 grid grid-cols-3 gap-4 rounded-2xl bg-gray-50 p-5">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <BuildingIcon className="h-5 w-5" />
                <span className="text-sm">お客様</span>
              </div>
              <div className="mt-2 text-base font-semibold text-gray-900">
                {allowShowClient && KaizenClient?.name ? KaizenClient.name : '非公開'}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <UsersIcon className="h-5 w-5" />
                <span className="text-sm">企業規模</span>
              </div>
              <div className="mt-2 text-base font-semibold text-gray-900">{companyScale || '-'}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <ClockIcon className="h-5 w-5" />
                <span className="text-sm">プロジェクト期間</span>
              </div>
              <div className="mt-2 text-base font-semibold text-gray-900">{projectDuration || '-'}</div>
            </div>
          </div>

          {/* 画像カルーセル */}
          {KaizenWorkImage?.length > 0 && (
            <div className="mb-8 rounded-2xl bg-gray-50 p-4">
              <BasicCarousel
                {...{
                  imgStyle: {},
                  Images: KaizenWorkImage?.map(obj => ({ imageUrl: obj.url })),
                }}
              />
            </div>
          )}

          {/* 成果ハイライト */}
          {(quantitativeResult || description) && (
            <div className="mb-8 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-2 border-green-200">
              <div className="flex items-center gap-3 text-lg font-bold text-green-700">
                <TrendingUpIcon className="h-6 w-6" />
                導入効果
              </div>
              <p className="mt-4 whitespace-pre-line text-xl font-bold leading-relaxed text-green-800">
                {quantitativeResult || description}
              </p>
            </div>
          )}

          {/* Before / After */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5">
              <div className="flex items-center gap-2 text-base font-bold text-red-700">
                <AlertCircleIcon className="h-5 w-5" />
                導入前の課題
              </div>
              <p className="mt-3 text-base leading-relaxed text-gray-700">{beforeChallenge || '-'}</p>
            </div>
            <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-5">
              <div className="flex items-center gap-2 text-base font-bold text-green-700">
                <CheckCircle2Icon className="h-5 w-5" />
                解決後の状態
              </div>
              <div className="mt-3 text-base leading-relaxed text-gray-700">
                {description ? <SlateEditor readOnly>{description}</SlateEditor> : '-'}
              </div>
            </div>
          </div>

          {/* 技術的工夫 */}
          {points && (
            <div className="mb-8">
              <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <WrenchIcon className="h-5 w-5 text-blue-600" />
                技術的工夫・ポイント
              </div>
              <div className="mt-3 text-base leading-relaxed text-gray-600">
                <SlateEditor readOnly>{points}</SlateEditor>
              </div>
            </div>
          )}

          {/* 顧客の声 */}
          {impression && (
            <div className="mb-8 rounded-2xl bg-amber-50 p-6 border-2 border-amber-200">
              <div className="flex items-center gap-2 text-lg font-bold text-amber-700">
                <MessageCircleIcon className="h-5 w-5" />
                お客様の声
              </div>
              <div className="mt-4 text-lg italic leading-relaxed text-gray-700">
                「<SlateEditor readOnly>{impression}</SlateEditor>」
              </div>
              {reply && (
                <div className="mt-4 border-t-2 border-amber-200 pt-4">
                  <div className="text-sm font-semibold text-amber-600">改善マニアより</div>
                  <div className="mt-2 text-base text-gray-600">
                    <SlateEditor readOnly>{reply}</SlateEditor>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 評価 */}
          {(dealPoint || toolPoint) && (
            <div className="flex items-center justify-center gap-12 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 p-6 border-2 border-amber-200">
              {dealPoint && <StarRating rating={dealPoint} label="取引評価" />}
              {dealPoint && toolPoint && <div className="h-16 w-px bg-amber-300"></div>}
              {toolPoint && <StarRating rating={toolPoint} label="成果物評価" />}
            </div>
          )}
        </div>

        {/* モーダルフッター */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 p-4">
          <button
            onClick={onClose}
            className="mx-auto flex items-center justify-center gap-2 rounded-xl bg-gray-200 px-8 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
