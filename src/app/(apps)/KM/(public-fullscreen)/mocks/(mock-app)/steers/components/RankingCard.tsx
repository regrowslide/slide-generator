'use client'

import type { KajiRankingItem } from '../types'

type Props = {
  title: string
  items: KajiRankingItem[]
  formatValue: (value: number) => string
}

const RankingCard = ({ title, items, formatValue }: Props) => {
  const maxValue = items.length > 0 ? items[0].value : 1

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-bold text-gray-800 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.rank} className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                item.rank <= 3
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {item.rank}
            </span>
            <span className="text-sm text-gray-700 w-16 truncate">{item.name}</span>
            <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs text-gray-600 w-20 text-right">
              {formatValue(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RankingCard
