'use client'

import { ArrowDownIcon } from 'lucide-react'
import { cl } from '@cm/lib/methods/common'

interface StepArrowProps {
  color?: 'indigo-400' | 'emerald-400'
}

export const StepArrow = ({ color = 'indigo-400' }: StepArrowProps) => {
  return (
    <div className="flex justify-center  absolute center-x ">
      <div className="flex flex-col items-center">
        <ArrowDownIcon
          className={cl(
            'h-6 w-6 sm:h-8 sm:w-8 animate-bounce',
            color === 'indigo-400' ? 'text-indigo-400' : 'text-emerald-400'
          )}
        />
      </div>
    </div>
  )
}
