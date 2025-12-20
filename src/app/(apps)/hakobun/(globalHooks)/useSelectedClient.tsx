'use client'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { globalIds } from 'src/non-common/searchParamStr'
import { useMemo } from 'react'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'

export default function useSelectedClient() {
  const { query } = useGlobal()
  const selectedClientId = useMemo(() => {
    return Number(query?.[globalIds.globalHakobunClientId] ?? '') as number | undefined
  }, [query])

  const { data: client } = useDoStandardPrisma('hakobunClient', 'findUnique', {
    where: { id: selectedClientId, },
  })

  return {
    selectedClient: client,
    selectedClientId,
  }
}
