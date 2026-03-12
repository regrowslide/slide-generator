'use client'
import React from 'react'
import useGlobal from 'src/cm/hooks/globalHooks/useGlobal'

import { toast } from 'react-toastify'
import useBasicFormProps from 'src/cm/hooks/useBasicForm/useBasicFormProps'
import { Fields } from 'src/cm/class/Fields/Fields'
import { Button } from '@cm/components/styles/common-components/Button'
import { authClient } from 'src/lib/auth-client'

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


                    const result = await authClient.signIn.email({
                      email: data.loginKeyField,
                      password: data.password,
                    })



                    if (result.data) {
                      toast.success(`ログインしました。`)
                      router.refresh()
                    } else if (result.error) {
                      toast.error(`正しい認証情報を入力してください。: ${result.error.message}`)
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
