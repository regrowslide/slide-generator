'use client'
import useRedirect from 'src/cm/hooks/useRedirect'

import Loader from '@cm/components/utils/loader/Loader'
import { isDev } from '@cm/lib/methods/common'

const Redirector = ({ redirectPath }) => {
  useRedirect(true, redirectPath)

  return <Loader>{isDev ? 'Redirecting' : '...'}</Loader>
}

export default Redirector
