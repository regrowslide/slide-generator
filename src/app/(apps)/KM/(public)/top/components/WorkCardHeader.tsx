'use client'

import { SparklesIcon } from 'lucide-react'
import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { Tags } from './Tags'
import { ReviewScore } from './ReviewScore'

interface WorkCardHeaderProps {
  title: string
  subtitle?: string | null
  KaizenClient?: any
  allowShowClient: boolean
  work: any
  dealPoint?: number | null
  toolPoint?: number | null
  isMobile: boolean
}

export const WorkCardHeader = ({
  title,
  subtitle,
  KaizenClient,
  allowShowClient,
  work,
  dealPoint,
  toolPoint,
  isMobile,
}: WorkCardHeaderProps) => {
  return (
    <div className="relative bg-gradient-to-r from-gray-600 to-gray-500 p-4 sm:p-6">
      <R_Stack className="justify-between items-end   gap-4">
        <div className="flex-1 w-full">
          {/* 装飾的な背景パターン */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-4 text-2xl sm:text-4xl">✨</div>
          </div>

          <div className="relative flex items-start justify-between gap-3">
            <R_Stack className={` justify-between w-full`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 animate-pulse flex-shrink-0" />
                  <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Case Study</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-lg break-words">{title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-white/90 font-medium break-words">{subtitle}</p>
              </div>

              <div>

              </div>
            </R_Stack>




          </div>

          {/* タグ */}
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
            <Tags work={work} isHeader />
          </div>
        </div>

        {/* 評価 - ヘッダー内に配置 */}
        {(dealPoint || toolPoint) && (
          <div className="w-full sm:w-auto">
            <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3">
              <ReviewScore dealPoint={dealPoint} toolPoint={toolPoint} />
            </div>
          </div>
        )}




      </R_Stack>
    </div>
  )
}
