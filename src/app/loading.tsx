'use client'
import { isDev } from '@cm/lib/methods/common'
import React from 'react'
import Loader from 'src/cm/components/utils/loader/Loader'

export default function Loading({ children }) {
  return (
    <div>
      <Loader>
        {isDev ? 'Loading Server Data' : 'Loading...'}
      </Loader>
      {children}
    </div>
  )
}
