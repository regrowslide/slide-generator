import React from 'react'

import { Absolute, C_Stack } from 'src/cm/components/styles/common-components/common-components'

import Redirector from 'src/cm/components/utils/Redirector'
import PlaceHolder from 'src/cm/components/utils/loader/PlaceHolder'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import LogInForm from '@app/(utils)/login/components/LogInFormWrapper'

const AdminLogin = async props => {
  const query = await props.searchParams
  const { session } = await initServerComopnent({ query })
  const { rootPath, error } = query

  let redirectRoot = ''
  if (rootPath === 'undefined' || rootPath === undefined) {
    redirectRoot = '/'
  } else {
    redirectRoot = rootPath
  }

  const REDIRECT_CON1_redirectBySession = session?.id && redirectRoot
  const REDIRECT_CON2_NO_LOGIN = process.env.NEXT_PUBLIC_NO_LOGIN === 'true' && redirectRoot
  const doRedirect = REDIRECT_CON2_NO_LOGIN || REDIRECT_CON1_redirectBySession

  if (!session) {
    return <PlaceHolder />
  }

  if (doRedirect && session?.id) {
    return <Redirector redirectPath={`/${redirectRoot}`} />
  }

  return (
    <Absolute className={`w-full p-4`}>
      <C_Stack className={`items-center gap-4`}>
        <LogInForm callbackUrl={`/${redirectRoot}`} />
        <hr />
      </C_Stack>
    </Absolute>
  )
}

export default AdminLogin
