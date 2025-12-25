'use client'

import { BuildingIcon, ClockIcon } from 'lucide-react'

interface WorkCardClientInfoProps {
  KaizenClient?: any
  allowShowClient: boolean
  projectDuration?: string | null
  companyScale?: string | null
}

export const WorkCardClientInfo = ({
  KaizenClient,
  allowShowClient,
  projectDuration,
  companyScale,
}: WorkCardClientInfoProps) => {
  return (
    <div className="flex  items-start sm:items-center justify-between bg-gradient-to-r from-slate-100 to-blue-50 px-4 sm:px-6 py-3 sm:py-4 gap-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 flex-shrink-0">
          <BuildingIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600" />
        </div>
        <span className="text-lg sm:text-2xl font-semibold text-slate-700 break-words">
          {allowShowClient && KaizenClient?.name ? `${KaizenClient.name} 様` : '匿名'}
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {projectDuration && (
          <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-purple-100 text-purple-700">
            <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="text-sm sm:text-base font-bold whitespace-nowrap">{projectDuration}</span>
          </div>
        )}
        {companyScale && (
          <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-pink-100 text-pink-700 text-sm sm:text-base font-bold whitespace-nowrap">
            {companyScale}
          </span>
        )}
      </div>
    </div>
  )
}
