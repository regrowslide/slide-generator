export const dynamic = 'force-dynamic'
import 'src/cm/styles/globals.css'

import { Suspense } from 'react'
import { Metadata } from 'next'
import GlobalToast from '@cm/components/utils/GlobalToast'

import React from 'react'

import AppRootProvider from '@cm/providers/AppRootProvider'

const title = process.env.NEXT_PUBLIC_TITLE
export const metadata: Metadata = { title: title }

export default async function AppRootLayout(props) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/app-icon.png" />
        <link rel="apple-touch-icon" href="/app-icon.png" />
      </head>
      <body suppressHydrationWarning>
        <Suspense>
          <AppRootProvider>
            <GlobalToast></GlobalToast>
            <div className={`max-w-screen overflow-hidden`}>{props.children}</div>
          </AppRootProvider>
        </Suspense>
      </body>
    </html>
  )
}
