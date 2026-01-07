/**
 * Works関連の共通型定義
 */

export type CategoryType = 'jobCategory' | 'systemCategory'

export interface Work {
  id?: number
  title?: string
  subtitle?: string | null
  description?: string | null
  jobCategory?: string | null
  systemCategory?: string | null
  collaborationTool?: string | null
  isPublic?: boolean
  allowShowClient?: boolean
  KaizenClient?: KaizenClient | null
  beforeChallenge?: string | null
  quantitativeResult?: string | null
  points?: string | null
  impression?: string | null
  reply?: string | null
  dealPoint?: number | null
  toolPoint?: number | null
  companyScale?: string | null
  projectDuration?: string | null
  sortOrder?: number | null
  kaizenClientId?: number | null
  date?: Date | string | null
  status?: string | null
  KaizenWorkImage?: Array<{ url: string }>
  [key: string]: any
}

export interface KaizenClient {
  id: number
  name: string
  organization?: string | null
  iconUrl?: string | null
  public?: boolean
  [key: string]: any
}

export interface CategoryInfo {
  category: string
  type: CategoryType
  count: number
}

export interface WorkFormData {
  id?: number
  title: string
  subtitle: string
  date: string
  status: string
  kaizenClientId: string
  allowShowClient: boolean
  isPublic: boolean
  jobCategory: string
  systemCategory: string
  collaborationTool: string
  companyScale: string
  projectDuration: string
  beforeChallenge: string
  description: string
  quantitativeResult: string
  points: string
  impression: string
  reply: string
  dealPoint: string
  toolPoint: string
}

