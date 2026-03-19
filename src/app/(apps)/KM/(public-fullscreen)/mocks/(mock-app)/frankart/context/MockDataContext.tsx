'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { Deal, Meeting, Estimate, ChatMessage, Todo, FileItem, Company, Contact, Advisor, Staff, DealStatus, EstimateStatus } from '../components/types'
import { DEFAULT_STAFF, DEFAULT_COMPANIES, DEFAULT_ADVISORS, DEFAULT_DEALS, DEFAULT_MEETINGS, DEFAULT_ESTIMATES, DEFAULT_CHAT_MESSAGES, DEFAULT_TODOS, DEFAULT_FILES } from '../components/mock-data'

// ── 型定義 ──

type MockDataState = {
  deals: Deal[]
  meetings: Meeting[]
  estimates: Estimate[]
  chatMessages: ChatMessage[]
  todos: Todo[]
  files: FileItem[]
  companies: Company[]
  advisors: Advisor[]
  staff: Staff[]
  selectedDealId: string | null
}

type MockDataActions = {
  // 案件
  addDeal: (deal: Deal) => void
  updateDeal: (id: string, updates: Partial<Deal>) => void
  deleteDeal: (id: string) => void
  updateDealStatus: (id: string, status: DealStatus) => void
  // 商談
  addMeeting: (meeting: Meeting) => void
  updateMeeting: (id: string, updates: Partial<Meeting>) => void
  deleteMeeting: (id: string) => void
  // 見積
  addEstimate: (estimate: Estimate) => void
  updateEstimate: (id: string, updates: Partial<Estimate>) => void
  deleteEstimate: (id: string) => void
  updateEstimateStatus: (id: string, status: EstimateStatus) => void
  // チャット
  addChatMessage: (message: ChatMessage) => void
  // ToDo
  addTodo: (todo: Todo) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  toggleTodoComplete: (id: string) => void
  // ファイル
  addFile: (file: FileItem) => void
  deleteFile: (id: string) => void
  // 取引先
  addCompany: (company: Company) => void
  updateCompany: (id: string, updates: Partial<Company>) => void
  deleteCompany: (id: string) => void
  addContact: (companyId: string, contact: Contact) => void
  updateContact: (companyId: string, contactId: string, updates: Partial<Contact>) => void
  deleteContact: (companyId: string, contactId: string) => void
  // 顧問
  addAdvisor: (advisor: Advisor) => void
  updateAdvisor: (id: string, updates: Partial<Advisor>) => void
  deleteAdvisor: (id: string) => void
  // 担当者
  addStaff: (s: Staff) => void
  updateStaff: (id: string, updates: Partial<Staff>) => void
  deleteStaff: (id: string) => void
  // 選択
  selectDeal: (id: string | null) => void
  // リセット
  resetAll: () => void
}

type MockDataContextValue = MockDataState & MockDataActions

// ── 定数 ──

const STORAGE_KEY = 'frankart-mock-data'

// ── 初期値生成 ──

function createInitialState(): MockDataState {
  return {
    deals: DEFAULT_DEALS,
    meetings: DEFAULT_MEETINGS,
    estimates: DEFAULT_ESTIMATES,
    chatMessages: DEFAULT_CHAT_MESSAGES,
    todos: DEFAULT_TODOS,
    files: DEFAULT_FILES,
    companies: DEFAULT_COMPANIES,
    advisors: DEFAULT_ADVISORS,
    staff: DEFAULT_STAFF,
    selectedDealId: null,
  }
}

// ── localStorage からの復元 ──

function loadFromStorage(): MockDataState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as MockDataState
  } catch {
    return null
  }
}

function saveToStorage(state: MockDataState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage が使えない場合は無視
  }
}

// ── Context ──

const MockDataContext = createContext<MockDataContextValue | null>(null)

// ── Provider ──

export function FrankartMockDataProvider({ children }: { children: React.ReactNode }) {
  // SSR対応: マウント前は初期値で表示し、hydration mismatch を回避
  const [state, setState] = useState<MockDataState>(createInitialState)
  const [mounted, setMounted] = useState(false)
  const initializedRef = useRef(false)

  // マウント時に localStorage から復元
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    const saved = loadFromStorage()
    if (saved) {
      setState(saved)
    }
    setMounted(true)
  }, [])

  // state 変更時に localStorage へ保存（マウント後のみ）
  useEffect(() => {
    if (!mounted) return
    saveToStorage(state)
  }, [state, mounted])

  // ── 案件 CRUD ──

  const addDeal = useCallback((deal: Deal) => {
    setState((prev) => ({ ...prev, deals: [...prev.deals, deal] }))
  }, [])

  const updateDeal = useCallback((id: string, updates: Partial<Deal>) => {
    setState((prev) => ({
      ...prev,
      deals: prev.deals.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }))
  }, [])

  const deleteDeal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      deals: prev.deals.filter((d) => d.id !== id),
    }))
  }, [])

  const updateDealStatus = useCallback((id: string, status: DealStatus) => {
    setState((prev) => ({
      ...prev,
      deals: prev.deals.map((d) => (d.id === id ? { ...d, status } : d)),
    }))
  }, [])

  // ── 商談 CRUD ──

  const addMeeting = useCallback((meeting: Meeting) => {
    setState((prev) => ({ ...prev, meetings: [...prev.meetings, meeting] }))
  }, [])

  const updateMeeting = useCallback((id: string, updates: Partial<Meeting>) => {
    setState((prev) => ({
      ...prev,
      meetings: prev.meetings.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }))
  }, [])

  const deleteMeeting = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      meetings: prev.meetings.filter((m) => m.id !== id),
    }))
  }, [])

  // ── 見積 CRUD ──

  const addEstimate = useCallback((estimate: Estimate) => {
    setState((prev) => ({ ...prev, estimates: [...prev.estimates, estimate] }))
  }, [])

  const updateEstimate = useCallback((id: string, updates: Partial<Estimate>) => {
    setState((prev) => ({
      ...prev,
      estimates: prev.estimates.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }))
  }, [])

  const deleteEstimate = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      estimates: prev.estimates.filter((e) => e.id !== id),
    }))
  }, [])

  const updateEstimateStatus = useCallback((id: string, status: EstimateStatus) => {
    setState((prev) => ({
      ...prev,
      estimates: prev.estimates.map((e) => (e.id === id ? { ...e, status } : e)),
    }))
  }, [])

  // ── チャット ──

  const addChatMessage = useCallback((message: ChatMessage) => {
    setState((prev) => ({ ...prev, chatMessages: [...prev.chatMessages, message] }))
  }, [])

  // ── ToDo ──

  const addTodo = useCallback((todo: Todo) => {
    setState((prev) => ({ ...prev, todos: [...prev.todos, todo] }))
  }, [])

  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
  }, [])

  const deleteTodo = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.filter((t) => t.id !== id),
    }))
  }, [])

  const toggleTodoComplete = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }))
  }, [])

  // ── ファイル ──

  const addFile = useCallback((file: FileItem) => {
    setState((prev) => ({ ...prev, files: [...prev.files, file] }))
  }, [])

  const deleteFile = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== id),
    }))
  }, [])

  // ── 取引先 CRUD ──

  const addCompany = useCallback((company: Company) => {
    setState((prev) => ({ ...prev, companies: [...prev.companies, company] }))
  }, [])

  const updateCompany = useCallback((id: string, updates: Partial<Company>) => {
    setState((prev) => ({
      ...prev,
      companies: prev.companies.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }))
  }, [])

  const deleteCompany = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      companies: prev.companies.filter((c) => c.id !== id),
    }))
  }, [])

  const addContact = useCallback((companyId: string, contact: Contact) => {
    setState((prev) => ({
      ...prev,
      companies: prev.companies.map((c) =>
        c.id === companyId ? { ...c, contacts: [...c.contacts, contact] } : c
      ),
    }))
  }, [])

  const updateContact = useCallback((companyId: string, contactId: string, updates: Partial<Contact>) => {
    setState((prev) => ({
      ...prev,
      companies: prev.companies.map((c) =>
        c.id === companyId
          ? { ...c, contacts: c.contacts.map((ct) => (ct.id === contactId ? { ...ct, ...updates } : ct)) }
          : c
      ),
    }))
  }, [])

  const deleteContact = useCallback((companyId: string, contactId: string) => {
    setState((prev) => ({
      ...prev,
      companies: prev.companies.map((c) =>
        c.id === companyId
          ? { ...c, contacts: c.contacts.filter((ct) => ct.id !== contactId) }
          : c
      ),
    }))
  }, [])

  // ── 顧問 CRUD ──

  const addAdvisor = useCallback((advisor: Advisor) => {
    setState((prev) => ({ ...prev, advisors: [...prev.advisors, advisor] }))
  }, [])

  const updateAdvisor = useCallback((id: string, updates: Partial<Advisor>) => {
    setState((prev) => ({
      ...prev,
      advisors: prev.advisors.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }))
  }, [])

  const deleteAdvisor = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      advisors: prev.advisors.filter((a) => a.id !== id),
    }))
  }, [])

  // ── 担当者 CRUD ──

  const addStaff = useCallback((s: Staff) => {
    setState((prev) => ({ ...prev, staff: [...prev.staff, s] }))
  }, [])

  const updateStaff = useCallback((id: string, updates: Partial<Staff>) => {
    setState((prev) => ({
      ...prev,
      staff: prev.staff.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }))
  }, [])

  const deleteStaff = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      staff: prev.staff.filter((s) => s.id !== id),
    }))
  }, [])

  // ── 選択 ──

  const selectDeal = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedDealId: id }))
  }, [])

  // ── リセット ──

  const resetAll = useCallback(() => {
    const initial = createInitialState()
    setState(initial)
    // localStorage も即時クリア
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 無視
    }
  }, [])

  // ── Context Value（メモ化） ──

  const value = useMemo<MockDataContextValue>(
    () => ({
      ...state,
      addDeal,
      updateDeal,
      deleteDeal,
      updateDealStatus,
      addMeeting,
      updateMeeting,
      deleteMeeting,
      addEstimate,
      updateEstimate,
      deleteEstimate,
      updateEstimateStatus,
      addChatMessage,
      addTodo,
      updateTodo,
      deleteTodo,
      toggleTodoComplete,
      addFile,
      deleteFile,
      addCompany,
      updateCompany,
      deleteCompany,
      addContact,
      updateContact,
      deleteContact,
      addAdvisor,
      updateAdvisor,
      deleteAdvisor,
      addStaff,
      updateStaff,
      deleteStaff,
      selectDeal,
      resetAll,
    }),
    [
      state,
      addDeal,
      updateDeal,
      deleteDeal,
      updateDealStatus,
      addMeeting,
      updateMeeting,
      deleteMeeting,
      addEstimate,
      updateEstimate,
      deleteEstimate,
      updateEstimateStatus,
      addChatMessage,
      addTodo,
      updateTodo,
      deleteTodo,
      toggleTodoComplete,
      addFile,
      deleteFile,
      addCompany,
      updateCompany,
      deleteCompany,
      addContact,
      updateContact,
      deleteContact,
      addAdvisor,
      updateAdvisor,
      deleteAdvisor,
      addStaff,
      updateStaff,
      deleteStaff,
      selectDeal,
      resetAll,
    ]
  )

  return <MockDataContext.Provider value={value}>{children}</MockDataContext.Provider>
}

// ── カスタムフック ──

export function useFrankartMockData(): MockDataContextValue {
  const ctx = useContext(MockDataContext)
  if (!ctx) {
    throw new Error('useFrankartMockData は FrankartMockDataProvider 内で使用してください')
  }
  return ctx
}
