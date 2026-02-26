'use client'

import useGlobal from "@cm/hooks/globalHooks/useGlobal"




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
