'use client'

import PlaceHolder from 'src/cm/components/utils/loader/PlaceHolder'
import {useEffect} from 'react'
import {authClient} from 'src/lib/auth-client'

const SignOuter = ({redirectPath}) => {
  useEffect(() => {
    authClient.signOut()
  }, [])

  return <PlaceHolder>Redirecting...</PlaceHolder>
}

export default SignOuter
