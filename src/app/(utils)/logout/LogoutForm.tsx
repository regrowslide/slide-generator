'use client'
import { useEffect } from 'react'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { authClient } from 'src/lib/auth-client'

const LogoutForm = () => {
  const { router, toggleLoad, session } = useGlobal()

  useEffect(() => {
    if (session?.id) {
      const logout = async () => {
        toggleLoad(async () => {
          await authClient.signOut()
          router.refresh()
        })
      }
      logout()
    }
  }, [session?.id])

  return <></>
}

export default LogoutForm
