'use client'
import {getSession, signOut} from 'next-auth/react'
import {useEffect} from 'react'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

const LogoutForm = () => {
  const {router, toggleLoad, session, query} = useGlobal()

  useEffect(() => {
    if (session?.id) {
      const logout = async () => {
        toggleLoad(async () => {
          const res = await signOut({redirect: false})
          const session = await getSession()
          if (res.url) {
            // toast.success('ログアウトしました。')
            router.refresh()
          }
        })
      }
      logout()
    }
  }, [session?.id])

  return <></>
}

export default LogoutForm
