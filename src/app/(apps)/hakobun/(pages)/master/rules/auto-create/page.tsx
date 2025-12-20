'use client'

import React from 'react'
import { C_Stack } from '@cm/components/styles/common-components/common-components'
import useSelectedClient from '../../../../(globalHooks)/useSelectedClient'
import RuleAutoCreateModal from '../../../../components/RuleAutoCreateModal'

export default function AutoCreateRulesPage() {
  const { selectedClient } = useSelectedClient()
  const globalClientId = selectedClient?.clientId

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-7xl mx-auto gap-6">
        {globalClientId ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <RuleAutoCreateModal clientId={globalClientId} />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-500 text-center">クライアントを選択してください</p>
          </div>
        )}
      </C_Stack>
    </div>
  )
}
