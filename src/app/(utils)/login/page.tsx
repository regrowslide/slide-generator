import React from 'react'

import Redirector from 'src/cm/components/utils/Redirector'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import LogInFormWrapper from '@app/(utils)/login/components/LogInFormWrapper'

const LoginPage = async props => {
  const query = await props.searchParams
  const { session } = await initServerComopnent({ query })
  const { rootPath } = query

  let redirectRoot = ''
  if (rootPath === 'undefined' || rootPath === undefined) {
    redirectRoot = '/'
  } else {
    redirectRoot = rootPath
  }

  const REDIRECT_CON1_redirectBySession = session?.id && redirectRoot
  const REDIRECT_CON2_NO_LOGIN = process.env.NEXT_PUBLIC_NO_LOGIN === 'true' && redirectRoot
  const doRedirect = REDIRECT_CON2_NO_LOGIN || REDIRECT_CON1_redirectBySession

  if (doRedirect && session?.id) {
    const path = `${process.env.NEXT_PUBLIC_BASEPATH}/${redirectRoot}`
    return <Redirector redirectPath={path} />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-primary-light p-4">
      <div className="w-full max-w-[420px] rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
        {/* ヘッダー */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
            <svg
              className="h-6 w-6 text-primary-main"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">ログイン</h1>
          <p className="mt-1 text-sm text-gray-500">アカウントにログインしてください</p>
        </div>

        {/* ログインフォーム */}
        <div className="flex justify-center">
          <LogInFormWrapper callbackUrl={`/${redirectRoot}`} />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
