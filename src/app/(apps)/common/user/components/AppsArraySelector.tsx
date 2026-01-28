'use client'

import React, {useEffect} from 'react'
import {ControlProps} from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control'
import {C_Stack} from '@cm/components/styles/common-components/common-components'

const AVAILABLE_APPS = [
  {id: 'newCar', name: 'newCar'},
  {id: 'ucar', name: 'ucar'},
  {id: 'QRBP', name: 'QRBP'},
] as const

const AppsArraySelector: React.FC<ControlProps> = props => {
  const {col, ReactHookForm, currentValue, controlContextValue} = props
  const {setValue, watch} = ReactHookForm

  const currentApps = watch(col.id) || currentValue || []
  const appsArray = Array.isArray(currentApps) ? currentApps : []

  const handleAppToggle = (appId: string) => {
    const newApps = appsArray.includes(appId) ? appsArray.filter(a => a !== appId) : [...appsArray, appId]
    setValue(col.id, newApps, {shouldValidate: true, shouldDirty: true})
  }

  useEffect(() => {
    if (currentValue && Array.isArray(currentValue)) {
      setValue(col.id, currentValue, {shouldValidate: false})
    }
  }, [currentValue, col.id, setValue])

  return (
    <C_Stack className="gap-2">
      <div className="text-sm font-medium mb-1">利用可能なアプリ</div>
      <div className="flex flex-wrap gap-3">
        {AVAILABLE_APPS.map(app => {
          const isChecked = appsArray.includes(app.id)
          return (
            <label key={app.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleAppToggle(app.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={!!col?.form?.disabled}
              />
              <span className="text-sm">{app.name}</span>
            </label>
          )
        })}
      </div>
    </C_Stack>
  )
}

export default AppsArraySelector













