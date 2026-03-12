'use client'

import useGlobal from "@cm/hooks/globalHooks/useGlobal"




export default function Template(props: { children: React.ReactNode }) {
  const { children } = props
  const { session, accessScopes } = useGlobal()
  if (!session.dentalClinicId && !accessScopes().admin) {
    return <div>クリニックが見つかりません</div>
  }

  return (

    <div>{children}</div>

  )
}
