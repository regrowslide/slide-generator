import React, { useState, useCallback, useContext, createContext } from 'react'
import type {
  Owner, Property, Tenant, ActionItem, RepairRecord, RepairVendor,
  RepairRequest, ChatMessage, BlobFile, CurrentUser, PortalType,
} from '../lib/types'
import {
  OWNERS, PROPERTIES, TENANTS, ACTION_ITEMS, REPAIR_RECORDS,
  REPAIR_VENDORS, REPAIR_REQUESTS, CHAT_MESSAGES, PORTAL_USERS,
} from '../lib/mockData'

export type DataContextType = {
  owners: Owner[]
  setOwners: React.Dispatch<React.SetStateAction<Owner[]>>
  properties: Property[]
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>
  tenants: Tenant[]
  setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>
  actionItems: ActionItem[]
  setActionItems: React.Dispatch<React.SetStateAction<ActionItem[]>>
  repairRecords: RepairRecord[]
  setRepairRecords: React.Dispatch<React.SetStateAction<RepairRecord[]>>
  repairVendors: RepairVendor[]
  setRepairVendors: React.Dispatch<React.SetStateAction<RepairVendor[]>>
  repairRequests: RepairRequest[]
  setRepairRequests: React.Dispatch<React.SetStateAction<RepairRequest[]>>
  chatMessages: ChatMessage[]
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  blobFiles: BlobFile[]
  setBlobFiles: React.Dispatch<React.SetStateAction<BlobFile[]>>
  currentUser: CurrentUser
  setPortal: (p: PortalType) => void
  portal: PortalType
  activePage: string
  setActivePage: (p: string) => void
  workspacePropertyId: string | null
  setWorkspacePropertyId: (id: string | null) => void
}

const DataContext = createContext<DataContextType>({} as DataContextType)

export const useData = () => useContext(DataContext)

export const EarthDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [portal, setPortalState] = useState<PortalType>('staff')
  const [activePage, setActivePage] = useState('dashboard')
  const [workspacePropertyId, setWorkspacePropertyId] = useState<string | null>(null)
  const [owners, setOwners] = useState<Owner[]>(OWNERS)
  const [properties, setProperties] = useState<Property[]>(PROPERTIES)
  const [tenants, setTenants] = useState<Tenant[]>(TENANTS)
  const [actionItems, setActionItems] = useState<ActionItem[]>(ACTION_ITEMS)
  const [repairVendors, setRepairVendors] = useState<RepairVendor[]>(REPAIR_VENDORS)
  const [repairRecords, setRepairRecords] = useState<RepairRecord[]>(REPAIR_RECORDS)
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>(REPAIR_REQUESTS)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(CHAT_MESSAGES)
  const [blobFiles, setBlobFiles] = useState<BlobFile[]>([])

  const setPortal = useCallback((p: PortalType) => {
    setPortalState(p)
    setActivePage(p === 'staff' ? 'dashboard' : p === 'owner' ? 'ownerPortal' : 'vendorPortal')
    setWorkspacePropertyId(null)
  }, [])

  const currentUser = PORTAL_USERS[portal]

  const ctx: DataContextType = {
    owners, setOwners, properties, setProperties, tenants, setTenants,
    actionItems, setActionItems, repairRecords, setRepairRecords,
    repairVendors, setRepairVendors, repairRequests, setRepairRequests,
    chatMessages, setChatMessages, blobFiles, setBlobFiles,
    currentUser, setPortal, portal, activePage, setActivePage,
    workspacePropertyId, setWorkspacePropertyId,
  }

  return <DataContext.Provider value={ctx}>{children}</DataContext.Provider>
}
