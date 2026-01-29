import { Suspense } from 'react'
import { FacilityMasterClient } from './FacilityMasterClient'
import { getFacilities } from '../../../_actions/facility-actions'

export default async function FacilityMasterPage() {
  const facilities = await getFacilities({ where: {} }) // すべて取得（非アクティブ含む）

  return (
    <Suspense fallback={<div className="animate-pulse">読み込み中...</div>}>
      <FacilityMasterClient initialFacilities={facilities} />
    </Suspense>
  )
}
