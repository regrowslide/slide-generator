'use client'

type Props = {
  label: string
  value: string
  subLabel?: string
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple'
}

const colorMap = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
}

const KpiCard = ({ label, value, subLabel, color = 'blue' }: Props) => {
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {subLabel && <p className="text-xs mt-1 opacity-60">{subLabel}</p>}
    </div>
  )
}

export default KpiCard
