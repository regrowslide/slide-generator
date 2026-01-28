'use client'

import useRoleGMF from '@cm/hooks/useRoleGMF'

const Template = ({children}) => {
  const RoleGMFReturn = useRoleGMF()
  return (
    <div>
      <RoleGMFReturn.Modal />
      {children}
    </div>
  )
}
export default Template
