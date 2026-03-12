'use client'

import { useState } from 'react'
import { Card, CardContent } from '@shadcn/ui/card'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Button } from '@cm/components/styles/common-components/Button'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import { upsertUser } from '../../_actions/user-actions'

const UserSetupTab = () => {
  const { toggleLoad } = useGlobal()
  const [form, setForm] = useState({
    email: '',
    name: '',
    role: 'user' as 'user' | 'admin',
    password: '',
  })
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSubmit = async () => {
    if (!form.email.trim() || !form.name.trim()) {

      setResult({ type: 'error', message: 'メールアドレスと名前は必須です' })
      return
    }

    await toggleLoad(async () => {
      try {

        const user = await upsertUser({
          email: form.email.trim(),
          name: form.name.trim(),
          role: form.role,
          password: form.password.trim() || undefined,
        })

        console.log(user)  //logs

        setResult({ type: 'success', message: `${user.name}（${user.email}）を設定しました（ID: ${user.id}）` })
      } catch (e: any) {
        setResult({ type: 'error', message: e.message })
      }
    }, { refresh: false })
  }

  return (
    <div className="space-y-4 max-w-lg">
      <Card>
        <CardContent className="pt-4 space-y-4">
          <p className="text-sm text-gray-500">
            メールアドレス基準で User + Account を作成/更新します。
            既存ユーザーの場合は名前・ロール・パスワードを上書きします。
          </p>

          <div className="space-y-2">
            <Label htmlFor="setupEmail">メールアドレス *</Label>
            <Input
              id="setupEmail"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="test@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="setupName">名前 *</Label>
            <Input
              id="setupName"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="山田太郎"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="setupRole">ロール</Label>
            <select
              id="setupRole"
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as 'user' | 'admin' })}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="setupPassword">パスワード（空欄の場合、既存ユーザーはパスワード変更なし）</Label>
            <Input
              id="setupPassword"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="パスワードを入力"
            />
          </div>

          <Button onClick={handleSubmit}>Upsert 実行</Button>

          {result && (
            <div className={`text-sm p-3 rounded ${result.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
              {result.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default UserSetupTab
