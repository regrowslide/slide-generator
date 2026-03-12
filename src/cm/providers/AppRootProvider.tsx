'use client'
import 'src/cm/styles/globals.css'

import React from 'react'

import NavigationContextProvider from '@cm/providers/NavigationContextProvider'
import LoaderContextProvider from '@cm/providers/LoaderContextProvider'
import SessionContextProvider from '@cm/providers/SessionContextProvider'
import {SWRConfig} from 'swr'
import DeviceContextProvider from '@cm/providers/DeviceContextProvider'
const config = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
}

export default function AppRootProvider({children}: {children: React.ReactNode}) {
  return (
    <SWRConfig value={config}>
      <DeviceContextProvider>
        <SessionContextProvider>
          <NavigationContextProvider>
            <LoaderContextProvider>{children}</LoaderContextProvider>
          </NavigationContextProvider>
        </SessionContextProvider>
      </DeviceContextProvider>
    </SWRConfig>
  )
}
