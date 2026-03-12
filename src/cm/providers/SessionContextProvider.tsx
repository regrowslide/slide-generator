'use client'
import React, {createContext, useContext, ReactNode} from 'react'
import useMySession from '@cm/hooks/globalHooks/useMySession'
import {SessionContextType} from '@cm/providers/types'
import Loader from '@cm/components/utils/loader/Loader'

const SessionContext = createContext<SessionContextType | null>(null)

const SessionContextProvider = ({children}: {children: ReactNode}) => {
  const sessionData = useMySession()

  if (sessionData.sessionLoading) {
    return <Loader></Loader>
  }

  return <SessionContext.Provider value={sessionData}>{children}</SessionContext.Provider>
}

export function useSessionContext() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSessionContext must be used within SessionProvider')
  }
  return context
}

export default SessionContextProvider
