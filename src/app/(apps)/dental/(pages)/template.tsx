'use client'
import Admin from '@cm/components/layout/Admin/Admin'
import { PageBuilder } from '@app/(apps)/dental/(builders)/PageBuilders/PageBuilder'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { redirect } from 'next/navigation'

export default function Template(props: { children: React.ReactNode }) {
  const { children } = props
  const { session } = useGlobal()
  if (!session.dentalClinicId) {
    return <div>クリニックが見つかりません</div>
  }

  return (

    <div>{children}</div>

  )
}
