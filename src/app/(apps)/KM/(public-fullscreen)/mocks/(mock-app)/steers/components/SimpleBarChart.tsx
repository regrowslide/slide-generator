'use client'

type BarItem = {
  name: string
  value: number
}

type Props = {
  title: string
  items: BarItem[]
  formatValue?: (value: number) => string
  color?: string
}

const SimpleBarChart = ({
  title,
  items,
  formatValue = (v) => `¥${v.toLocaleString()}`,
  color = 'bg-blue-500',
}: Props) => {
  const maxValue = Math.max(...items.map((i) => Math.abs(i.value)), 1)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-bold text-gray-800 mb-3">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">{item.name}</span>
              <span className="font-medium text-gray-800">
                {formatValue(item.value)}
              </span>
            </div>
            <div className="h-6 bg-gray-100 rounded overflow-hidden">
              <div
                className={`h-full ${color} rounded transition-all`}
                style={{
                  width: `${(Math.abs(item.value) / maxValue) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SimpleBarChart
