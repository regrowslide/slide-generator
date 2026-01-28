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
    where: { id: selectedClientId },
    include: {
      HakobunClientStage: {
        where: { enabled: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  // 有効なステージ名の配列を取得
  const stageOptions = useMemo(() => {
    if (!client?.HakobunClientStage || client.HakobunClientStage.length === 0) {
      // ステージ未設定の場合はデフォルト値を返す
      return []
    }
    return client.HakobunClientStage.map((stage: { name: string }) => stage.name)
  }, [client])

  return {
    selectedClient: client,
    selectedClientId,
    stageOptions,
  }
}
