import {
  TbmBase,
  TbmDriveSchedule,
  TbmVehicle,
  TbmRouteGroup,
  OdometerInput,
  User,
  UserWorkStatus,
  TbmRouteGroupCalendar,
} from '@prisma/generated/prisma/client'
import {CSSProperties} from 'react'

// ============================================================================
// 基本的な型定義
// ============================================================================

/** 配車テーブルのモード */
export type HaishaTableMode = 'ROUTE' | 'DRIVER'

/** ソート方法 */
export type HaishaSortBy = 'departureTime' | 'routeCode' | 'customerCode'

/** 日付範囲クエリ */
export interface DateRangeQuery {
  gte?: Date
  lt?: Date
}

/** ページネーション設定 */
export interface PaginationConfig {
  take: number
  skip: number
}

// ============================================================================
// 拡張されたPrismaモデル型
// ============================================================================

/** 関連便情報（親便用） */
export interface RelatedRouteGroupInfo {
  id: number
  daysOffset: number
  childRouteGroupId: number
  childRouteGroup: {
    id: number
    name: string
    code: string | null
  }
}

/** 関連便情報（子便用） */
export interface RelatedRouteGroupChildInfo {
  id: number
  daysOffset: number
  tbmRouteGroupId: number
  TbmRouteGroup: {
    id: number
    name: string
    code: string | null
  }
}

/** カレンダー情報付きのルートグループ */
export type TbmRouteGroupWithCalendar = TbmRouteGroup & {
  TbmRouteGroupCalendar: TbmRouteGroupCalendar[]
  RelatedRouteGroupsAsParent?: RelatedRouteGroupInfo[]
  RelatedRouteGroupsAsChild?: RelatedRouteGroupChildInfo[]
}

/** 重複フラグ付きの配車スケジュール */
export type TbmDriveScheduleWithDuplicated = TbmDriveSchedule & {
  TbmRouteGroup: TbmRouteGroupWithCalendar
  TbmVehicle: TbmVehicle & {
    OdometerInput?: OdometerInput[] // 配車ページでは不要なのでオプショナルに
  }
  User: {
    id: number
    name: string
  }
  duplicated: boolean
}

/** 勤務状況付きのユーザー */
export type UserWithWorkStatus = User & {
  UserWorkStatus: UserWorkStatus[]
}

/** 勤務状況集計 */
export interface UserWorkStatusCount {
  userId: number
  workStatus: string
  _count: {
    _all: number
  }
}

// ============================================================================
// データ取得関連の型
// ============================================================================

/** getListData関数の戻り値型 */
export interface HaishaListData {
  tbmBase: TbmBase & {
    id: number
    name: string
  }
  TbmDriveSchedule: TbmDriveScheduleWithDuplicated[]
  userList: UserWithWorkStatus[]
  tbmRouteGroup: TbmRouteGroupWithCalendar[]
  carList: TbmVehicle[]
  maxCount: number
  userWorkStatusCount: UserWorkStatusCount[]
}

/** getListData関数のパラメータ */
export interface GetListDataParams {
  tbmBaseId: number
  whereQuery: DateRangeQuery
  mode: HaishaTableMode
  takeSkip: PaginationConfig
  sortBy?: HaishaSortBy
  tbmCustomerId?: number
}

// ============================================================================
// フック関連の型
// ============================================================================

/** useHaishaDataフックのパラメータ */
export interface UseHaishaDataParams {
  tbmBaseId: number
  whereQuery: DateRangeQuery
  mode: HaishaTableMode
  currentPage: number
  itemsPerPage: number
}

/** useHaishaDataフックの戻り値 */
export interface UseHaishaDataReturn {
  listDataState: HaishaListData | null
  maxRecord: number
  LocalLoader: React.ComponentType
  fetchData: () => void
  updateScheduleInState: (updatedSchedule: TbmDriveScheduleWithDuplicated) => void
  removeScheduleFromState: (scheduleId: number) => void
}

/** usePaginationフックのパラメータ */
export interface UsePaginationParams {
  initialPage?: number
  initialItemsPerPage?: number
}

/** usePaginationフックの戻り値 */
export interface UsePaginationReturn {
  currentPage: number
  itemsPerPage: number
  handlePageChange: (page: number) => void
  handleItemsPerPageChange: (itemsPerPage: number) => void
}

// ============================================================================
// スケジュールデータ整理用の型
// ============================================================================

/** 日付とユーザーIDでグループ化されたスケジュール */
export type ScheduleByDateAndUser = Record<string, Record<string, TbmDriveScheduleWithDuplicated[]>>

/** 日付とルートIDでグループ化されたスケジュール */
export type ScheduleByDateAndRoute = Record<string, Record<string, TbmDriveScheduleWithDuplicated[]>>

// ============================================================================
// コンポーネントのプロパティ型
// ============================================================================

/** HaishaTableコンポーネントのプロパティ */
export interface HaishaTableProps {
  tbmBase: TbmBase | null
  days: Date[]
  whereQuery: DateRangeQuery
}

/** HaishaCardコンポーネントのプロパティ */
export interface HaishaCardProps {
  fetchData: () => void
  scheduleListOnDate: TbmDriveScheduleWithDuplicated[]
  setModalOpen: (props: ModalOpenParams) => void
  user?: UserWithWorkStatus
  tbmRouteGroup?: TbmRouteGroupWithCalendar
  date: Date
  tbmBase: TbmBase | null
}

/** モーダルオープン時のパラメータ */
export interface ModalOpenParams {
  date?: Date
  tbmBase?: TbmBase | null
  user?: UserWithWorkStatus
  tbmRouteGroup?: TbmRouteGroupWithCalendar
  tbmDriveSchedule?: TbmDriveScheduleWithDuplicated
  isBulkAssignment?: boolean
}

/** 一括割り当てモーダルのパラメータ */
export interface BulkAssignmentModalProps {
  tbmRouteGroup: TbmRouteGroupWithCalendar
  tbmBase: TbmBase | null
  month: Date
  onClose: () => void
  onComplete: () => void
}

/** 一括割り当てフォームデータ */
export interface BulkAssignmentFormData {
  userId: number | null
  tbmVehicleId: number | null
  selectedDates: Date[]
}

/** HaishaTableContentコンポーネントのプロパティ */
export interface HaishaTableContentProps {
  userList: UserWithWorkStatus[]
  TbmDriveSchedule: TbmDriveScheduleWithDuplicated[]
  tbmRouteGroup: TbmRouteGroupWithCalendar[]
  userWorkStatusCount: UserWorkStatusCount[]
  mode: HaishaTableMode
  tbmBase: TbmBase | null
  days: Date[]
  holidays: any[] // TODO: 祝日の型を定義
  fetchData: () => void
  setModalOpen: (props: ModalOpenParams) => void
  admin: boolean
  query: any // TODO: クエリの型を定義
}

/** TableRowBuilderのプロパティ */
export interface TableRowBuilderProps {
  mode: HaishaTableMode
  tbmBase: TbmBase | null
  days: Date[]
  holidays: any[] // TODO: 祝日の型を定義
  fetchData: () => void
  setModalOpen: (props: ModalOpenParams) => void
  admin: boolean
  query: any // TODO: クエリの型を定義
  userWorkStatusCount: UserWorkStatusCount[]
  scheduleByDateAndUser?: ScheduleByDateAndUser
  scheduleByDateAndRoute?: ScheduleByDateAndRoute
}

/** DateCellビルダーのパラメータ */
export interface DateCellBuilderParams {
  date: Date
  scheduleListOnDate: TbmDriveScheduleWithDuplicated[]
  user?: UserWithWorkStatus
  tbmRouteGroup?: TbmRouteGroupWithCalendar
  mode: HaishaTableMode
  tbmBase: TbmBase | null
  holidays: any[] // TODO: 祝日の型を定義
  fetchData: () => void
  setModalOpen: (props: ModalOpenParams) => void
  query: any // TODO: クエリの型を定義
  cellStyle?: CSSProperties
}

// ============================================================================
// CellComponentsの型
// ============================================================================

/** WorkStatusSelectorコンポーネントのプロパティ */
export interface WorkStatusSelectorProps {
  userWorkStatus: UserWorkStatus | undefined
  user: UserWithWorkStatus
  date: Date
  fetchData: () => void
}

/** AddScheduleButtonコンポーネントのプロパティ */
export interface AddScheduleButtonProps {
  date: Date
  tbmBase: TbmBase | null
  user?: UserWithWorkStatus
  tbmRouteGroup?: TbmRouteGroupWithCalendar
  setModalOpen: (props: ModalOpenParams) => void
}

/** ScheduleCardコンポーネントのプロパティ */
export interface ScheduleCardProps {
  tbmDriveSchedule: TbmDriveScheduleWithDuplicated
  user?: {id: number; name: string} | UserWithWorkStatus
  date: Date
  setModalOpen: (props: ModalOpenParams) => void
  fetchData: () => void
  query: any // TODO: クエリの型を定義
  tbmBase: TbmBase | null
}

/** StatusButtonsコンポーネントのプロパティ */
export interface StatusButtonsProps {
  tbmDriveSchedule: TbmDriveScheduleWithDuplicated
  fetchData: () => void
}
