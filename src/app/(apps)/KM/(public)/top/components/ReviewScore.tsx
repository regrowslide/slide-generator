'use client'

import { StarIcon } from 'lucide-react'
import { cl } from '@cm/lib/methods/common'
import { C_Stack } from '@cm/components/styles/common-components/common-components'

interface ReviewScoreProps {
  dealPoint?: number | null
  toolPoint?: number | null
}

export const ReviewScore = ({ dealPoint, toolPoint }: ReviewScoreProps) => {
  if (!dealPoint && !toolPoint) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm text-slate-500 shadow-inner">
        <StarIcon className="h-5 w-5 text-slate-300" />
        <span className="font-medium">レビュー投稿待ち</span>
      </div>
    )
  }

  const StarRating = ({ rating, label }: { rating: number; label: string }) => (
    <C_Stack className=" gap-0 items-center bg-yellow-50 backdrop-blur-sm rounded-lg sm:rounded-xl px-2.5  py-0.5 sm:py-1.5 shadow-md border text-gray-600 border-yellow-400/30 ">


      <div className="flex items-center gap-1 text-xs font-bold ">

        <span className="text-xs sm:text-sm">{label}</span>
      </div>


      <div className="flex items-center gap-2">
        <span className="text-sm sm:text-xl font-black text-yellow-600 drop-shadow-md">{rating}</span>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <StarIcon
              key={i}
              className={cl(
                'h-2.5 w-2.5 sm:h-4 sm:w-4 transition-all',
                i < Math.ceil(rating)
                  ? 'fill-yellow-300 text-yellow-600 drop-shadow-sm'
                  : 'fill-white/30 text-white/30'
              )}
            />
          ))}
        </div>
      </div>
    </C_Stack>
  )

  return (
    <div className="flex justify-end flex-row sm:flex-col w-full  gap-1.5 sm:gap-4 ">
      {dealPoint && <StarRating rating={dealPoint} label="取引評価" />}
      {toolPoint && <StarRating rating={toolPoint} label="成果物評価" />}
    </div>
  )
}
