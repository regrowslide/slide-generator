'use client'

import React from 'react'
import { Star } from 'lucide-react'

interface RatingStarsProps {
  rating: number | null
}

/**
 * 星評価を表示するコンポーネント
 */
export const RatingStars: React.FC<RatingStarsProps> = ({ rating }) => {
  if (!rating) return null

  const stars: React.ReactNode[] = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <div key={i} className="relative">
          <Star className="w-3.5 h-3.5 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
        </div>
      )
    } else {
      stars.push(<Star key={i} className="w-3.5 h-3.5 text-gray-300" />)
    }
  }

  return <div className="flex gap-0.5">{stars}</div>
}

