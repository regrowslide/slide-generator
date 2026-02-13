'use client'
import React from 'react'
import { signIn } from 'next-auth/react'
import useGlobal from 'src/cm/hooks/globalHooks/useGlobal'
import { sleep } from 'src/cm/lib/methods/common'

import { toast } from 'react-toastify'
import useBasicFormProps from 'src/cm/hooks/useBasicForm/useBasicFormProps'
import { Fields } from 'src/cm/class/Fields/Fields'
import { Button } from '@cm/components/styles/common-components/Button'
import { CheckLogin } from '@app/api/prisma/login/checkLogin'

export default function CredintialLoginForm(props) {
  const { error, callbackUrl } = props
  const { toggleLoad, router } = useGlobal()
  const columns = Fields.transposeColumns([
    {
      id: 'loginKeyField',
      label: process.env.NEXT_PUBLIC_LOGIN_KEY_FIELD_LABEL ?? 'メールアドレス',
      form: { register: { required: '必須項目です' } },
    },
    {
      id: 'password',
      label: 'パスワード',
      form: {
        register: { required: '必須項目です' },
      },
    },
  ])
  const { BasicForm, latestFormData } = useBasicFormProps({ columns, focusOnMount: false })

  return (
    <>
      <section>
        <div className={`t-paper mx-auto  p-4 `}>
          <BasicForm
            {...{
              alignMode: 'col',
              latestFormData,
              wrapperClass: 'col-stack gap-4  text-xl items-center',
              ControlOptions: {
                ControlStyle: { width: 250 },
              },
              onSubmit: async data => {
                toggleLoad(
                  async () => {
                    const user = await CheckLogin({
                      authId: data.loginKeyField, authPw: data.password
                    })

                    if (!user) {
                      toast.error(`正しい認証情報を入力してください。`)
                      return
                    }
                    // const result = await toggleLoad(async () => {
                    const result = await signIn('credentials', {
                      loginKeyField: data.loginKeyField,
                      password: data.password,
                      redirect: false,
                    })

                    if (result?.ok) {
                      // const session = await getSession()
                      toast.success(`ログインしました。`)

                      router.refresh()
                    } else if (result?.error) {
                      toast.error(`ログインに失敗しました。:${result.error}`)
                    }
                  },
                  { refresh: false, mutate: false }
                )
              },
            }}
          >
            <Button color={`primary`}>ログイン</Button>
          </BasicForm>

          {error && <p className={`text-error-main my-4`}>ログイン情報が 正しくありません。</p>}
        </div>
      </section>
      <section>
        {process.env.NEXT_PUBLIC_NO_LOGIN !== 'false' && (
          <button
            type="button"
            className="text-blue-600 underline text-sm"
            onClick={() => {
              const path = prompt('パスワードを入力してください。')
              if (!path) return
              router.push(`/${path}`)
            }}
          >
            ログインせずに利用
          </button>

        )}
      </section>
    </>
  )
}
