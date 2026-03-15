'use client'

import { useEffect, useState } from 'react'
import CredintialLoginForm from '@app/(utils)/login/components/CredintialLoginForm'
import { GoogleLoginButton } from '@app/(utils)/login/components/GoogleLoginForm'
import { LineLoginButton } from '@app/(utils)/login/components/LineLoginForm'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { useJotaiByKey } from '@cm/hooks/useJotai'

export default function LogInFormWrapper({ callbackUrl }: { callbackUrl: string }) {
  const { router } = useGlobal()
  const [done, setDone] = useJotaiByKey<boolean>('done', false)

  const allowGoogle = process.env.NEXT_PUBLIC_ALLOW_GOOGLE_LOGIN === 'true'
  const allowLine = process.env.NEXT_PUBLIC_ALLOW_LINE_LOGIN === 'true'
  const hasSocialLogin = allowGoogle || allowLine


  // ログイン完了後、ハードナビゲーションでセッションをリロードしてリダイレクト
  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => {
        window.location.href = callbackUrl || '/'
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [done, callbackUrl])

  if (done) {
    return (
      <div className="w-full max-w-[360px] text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-gray-800 font-medium">ログインしました</p>
        <p className="mt-2 text-sm text-gray-500">リダイレクトしています...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-[360px]">
      {/* ソーシャルログインボタン */}
      {hasSocialLogin && (
        <div className="flex flex-col gap-3">
          {allowGoogle && <GoogleLoginButton callbackUrl={callbackUrl} />}
          {allowLine && <LineLoginButton callbackUrl={callbackUrl} />}
        </div>
      )}

      {/* 区切り線 */}
      {hasSocialLogin && (
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400 select-none">または</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
      )}

      {/* メール/パスワードフォーム */}
      <CredintialLoginForm onSuccess={() => setDone(true)} />

      {/* ログインせずに利用 */}
      {process.env.NEXT_PUBLIC_NO_LOGIN !== 'false' && (
        <div className="text-center">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 text-xs underline underline-offset-2 transition cursor-pointer"
            onClick={() => {
              const path = prompt('パスワードを入力してください。')
              if (!path) return
              router.push(`/${path}`)
            }}
          >
            ログインせずに利用
          </button>
        </div>
      )}
    </div>
  )
}
