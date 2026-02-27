'use client'

import type { RoleMaster } from '@prisma/generated/prisma/client'
import { Filter } from 'lucide-react'
import { C_Stack } from '@cm/components/styles/common-components/common-components'

type RoleFilterSectionProps = {
  roles: RoleMaster[]
  selectedRoleFilter: string
  onFilterChange: (value: string) => void
  minWidthClassName?: string
}

const LABEL_CLASS = 'flex items-center gap-2 cursor-pointer w-[25%] border-b p-1  border-gray-200'

const RoleFilterSection = ({ roles, selectedRoleFilter, onFilterChange, minWidthClassName }: RoleFilterSectionProps) => {
  return (
    <C_Stack className={minWidthClassName}>

      <div className="flex flex-wrap gap-0 gap-y-2">
        {[
          <label key="all" className={LABEL_CLASS}>
            <input
              type="radio"
              name="roleFilter"
              value="all"
              checked={selectedRoleFilter === 'all'}
              onChange={e => onFilterChange(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-700 font-semibold">すべて</span>
          </label>,
          <label key="no-role" className={LABEL_CLASS}>
            <input
              type="radio"
              name="roleFilter"
              value="no-role"
              checked={selectedRoleFilter === 'no-role'}
              onChange={e => onFilterChange(e.target.value)}
              className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
            />
            <span className="text-xs">役割なし</span>
          </label>,
          ...roles.map(role => (
            <label key={role.id} className={LABEL_CLASS}>
              <input
                type="radio"
                name="roleFilter"
                value={role.id}
                checked={selectedRoleFilter === String(role.id)}
                onChange={e => onFilterChange(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700">{role.description || role.name}</span>
            </label>
          )),
        ]}
      </div>
    </C_Stack>
  )
}

export default RoleFilterSection
