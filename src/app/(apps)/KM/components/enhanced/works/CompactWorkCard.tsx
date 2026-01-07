'use client'

import React, { useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Star, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { COMPACT_CARD_ANIMATION } from '../../../constants/animationConstants'
import { DESCRIPTION_PREVIEW_MAX_LENGTH } from '../../../constants/worksConstants'
import { getDescriptionPreview } from '../../../utils/worksUtils'

interface CompactWorkCardProps {
  work: any
  onClick: () => void
}

/**
 * コンパクトな実績カードコンポーネント
 */
const CompactWorkCardComponent: React.FC<CompactWorkCardProps> = ({ work, onClick }) => {
  const descriptionPreview = useMemo(
    () => getDescriptionPreview(work.description, DESCRIPTION_PREVIEW_MAX_LENGTH),
    [work.description]
  )

  const handleClick = useCallback(() => {
    onClick()
  }, [onClick])

  return (
    <motion.div
      {...COMPACT_CARD_ANIMATION}
      onClick={handleClick}
      className="group cursor-pointer rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
    >
      {/* ヘッダー */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex gap-1 items-center">
            {work.allowShowClient && work.KaizenClient?.iconUrl && (
              <div>
                <Image
                  height={40}
                  width={40}
                  src={work.KaizenClient?.iconUrl}
                  alt={work.KaizenClient?.name}
                />
              </div>
            )}
            <h3 className="mb-1 font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
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

export const CompactWorkCard = React.memo(CompactWorkCardComponent)

