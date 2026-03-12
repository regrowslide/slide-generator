'use client'

import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Button } from '@cm/components/styles/common-components/Button'
import { authClient } from 'src/lib/auth-client'
import useGlobal from 'src/cm/hooks/globalHooks/useGlobal'

export default function CredintialLoginForm({
  callbackUrl,
}: {
  callbackUrl: string
}) {
  const { toggleLoad } = useGlobal()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const loginKeyLabel = process.env.NEXT_PUBLIC_LOGIN_KEY_FIELD_LABEL ?? 'メールアドレス'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('必須項目を入力してください。')
      return
    }
    toggleLoad(
      async () => {
        const result = await authClient.signIn.email({
          email,
          password,
        })
        if (result.data) {
          toast.success('ログインしました。')
          window.location.href = callbackUrl || '/'
          return
        } else if (result.error) {
          toast.error(`正しい認証情報を入力してください。: ${result.error.message}`)
        }
      },
      { refresh: false, mutate: false }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{loginKeyLabel}</Label>
        <Input
          id="email"
          type="text"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={loginKeyLabel}
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">パスワード</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="パスワード"
          autoComplete="current-password"
        />
      </div>

      <Button color="primary" className="w-full justify-center py-3">
        ログイン
      </Button>
    </form>
  )
}
