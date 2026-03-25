'use client'

import { useEffect, useState } from 'react'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { authClient } from 'src/lib/auth-client'

const LogoutForm = ({ rootPath }: { rootPath?: string }) => {
  const { session } = useGlobal()
  const [done, setDone] = useState(false)

  useEffect(() => {

    if (session?.id) {
      const logout = async () => {
        await authClient.signOut()
        setDone(true)
      }
      logout()
    }
  }, [session?.id])

  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => {
        // ハードナビゲーションでセッション状態を完全リセット
        window.location.href = '/login' + '?rootPath=' + rootPath
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [done])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-primary-light p-4">
      <div className="w-full max-w-[360px] rounded-2xl border border-gray-100 bg-white p-8 shadow-lg text-center">
        {done ? (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-800 font-medium">ログアウトしました</p>
            <p className="mt-2 text-sm text-gray-500">ログインページに移動します...</p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-primary-main" />
            </div>
            <p className="text-gray-800 font-medium">ログアウト中...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default LogoutForm
