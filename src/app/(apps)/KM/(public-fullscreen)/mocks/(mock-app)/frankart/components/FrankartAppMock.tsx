'use client'

import React from 'react'
import type { PageId } from './types'
import DashboardPage from './DashboardPage'
import DealListPage from './DealListPage'
import DealRoomPage from './DealRoomPage'
import ContactsPage from './ContactsPage'
import SettingsPage from './SettingsPage'

type Props = {
  externalPage: PageId
  onPageChange: (page: string) => void
}

const FrankartAppMock: React.FC<Props> = ({ externalPage, onPageChange }) => {
  switch (externalPage) {
    case 'dashboard':
      return <DashboardPage onNavigate={onPageChange} />
    case 'deal-list':
      return <DealListPage onNavigate={onPageChange} />
    case 'deal-room':
      return <DealRoomPage onNavigate={onPageChange} />
    case 'contacts':
      return <ContactsPage />
    case 'settings':
      return <SettingsPage />
    default:
      return <DashboardPage onNavigate={onPageChange} />
  }
}

export default FrankartAppMock
