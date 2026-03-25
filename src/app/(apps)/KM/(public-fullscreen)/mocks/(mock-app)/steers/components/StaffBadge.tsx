'use client'

type Props = {
  name: string
  roleId?: string
  variant?: 'default' | 'available' | 'assigned'
  onClick?: () => void
}

const roleColors: Record<string, string> = {
  DR: 'bg-purple-100 text-purple-800 border-purple-300',
  CH: 'bg-orange-100 text-orange-800 border-orange-300',
}

const variantColors = {
  default: 'bg-gray-100 text-gray-700 border-gray-300',
  available: 'bg-green-50 text-green-700 border-green-300',
  assigned: 'bg-blue-50 text-blue-700 border-blue-300',
}

const StaffBadge = ({ name, roleId, variant = 'default', onClick }: Props) => {
  // CLで始まる役割はデフォルトの青系
  const colorClass =
    roleId && roleColors[roleId]
      ? roleColors[roleId]
      : variant
        ? variantColors[variant]
        : variantColors.default

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${
        onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
      }`}
    >
      {roleId && (
        <span className="text-[10px] opacity-70">{roleId}</span>
      )}
      {name}
    </span>
  )
}

export default StaffBadge
