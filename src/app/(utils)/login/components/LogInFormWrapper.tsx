'use client'

import CredintialLoginForm from '@app/(utils)/login/components/CredintialLoginForm'
import { GoogleLoginButton } from '@app/(utils)/login/components/GoogleLoginForm'
import { LineLoginButton } from '@app/(utils)/login/components/LineLoginForm'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

export default function LogInFormWrapper({ callbackUrl }: { callbackUrl: string }) {
  const { router } = useGlobal()

  const allowGoogle = process.env.NEXT_PUBLIC_ALLOW_GOOGLE_LOGIN === 'true'
  const allowLine = process.env.NEXT_PUBLIC_ALLOW_LINE_LOGIN === 'true'
  const hasSocialLogin = allowGoogle || allowLine

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
      <CredintialLoginForm callbackUrl={callbackUrl} />

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
