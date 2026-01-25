'use client'
import CredintialLoginForm from '@app/(utils)/login/components/CredintialLoginForm'
import { GoogleLoginButton } from '@app/(utils)/login/components/GoogleLoginForm'
import { C_Stack } from '@cm/components/styles/common-components/common-components'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import React, { useState } from 'react'

export default function LogInFormWrapper({ callbackUrl }) {
  const [mode, setMode] = useState<'google' | 'email'>('google')
  const { query } = useGlobal()
  const { rootPath, error } = query



  if (process.env.NEXT_PUBLIC_ALLOW_GOOGLE_LOGIN !== 'true') {

    return (
      <C_Stack className="gap-4 items-center">
        <CredintialLoginForm {...{ rootPath, error, callbackUrl }} />
      </C_Stack>
    )
  }

  if (mode === 'email') {
    return (
      <C_Stack className="gap-4 items-center">
        <CredintialLoginForm {...{ rootPath, error, callbackUrl }} />
        <button
          type="button"
          className="text-blue-600 underline text-sm"
          onClick={() => setMode('google')}
        >
          Googleでログインする方はこちら
        </button>
      </C_Stack>
    )
  }

  return (
    <C_Stack className="gap-4">
      <GoogleLoginButton callbackUrl={callbackUrl} />
      <button
        type="button"
        className="text-blue-600 underline text-sm"
        onClick={() => setMode('email')}
      >
        メールアドレスとパスワードでログイン
      </button>
    </C_Stack>
  )
}

