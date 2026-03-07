'use client'

import {AVATAR_COLORS} from '../lib/constants'

type Props = {
  name: string
  avatar?: string | null
  userId?: number
  size?: 'xs' | 'sm' | 'md'
}

const SIZE_MAP = {
  xs: 'w-5 h-5 text-[8px]',
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
}

export default function UserAvatar({name, avatar, userId, size = 'sm'}: Props) {
  const sizeClass = SIZE_MAP[size]

  if (avatar) {
    return <img src={avatar} alt={name} className={`${sizeClass} rounded-full object-cover shrink-0`} />
  }

  const color = AVATAR_COLORS[(userId ?? name.charCodeAt(0)) % AVATAR_COLORS.length]
  return (
    <div className={`${color} ${sizeClass} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
      {name.slice(0, 1)}
    </div>
  )
}
