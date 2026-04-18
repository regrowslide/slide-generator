/**
 * Regrow アプリの純粋ユーティリティ関数
 */

import type {MonthlyData, YearMonth} from '../types'

/**
 * 空のMonthlyDataを生成
 */
export const createEmptyMonthlyData = (yearMonth: YearMonth): MonthlyData => {
  return {
    yearMonth,
    importedData: null,
    manualData: {
      storeKpis: [],
      staffManualData: [],
      customerVoice: {content: ''},
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    reportUpdatedAt: null,
  }
}

/**
 * 現在の月をYYYY-MM形式で取得
 */
export const getCurrentYearMonth = (): YearMonth => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * YYYY-MM形式の月から前月を取得
 */
export const getPreviousMonth = (yearMonth: YearMonth): YearMonth => {
  const [year, month] = yearMonth.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  date.setMonth(date.getMonth() - 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/**
 * YYYY-MM形式の月から翌月を取得
 */
export const getNextMonth = (yearMonth: YearMonth): YearMonth => {
  const [year, month] = yearMonth.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  date.setMonth(date.getMonth() + 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/**
 * YYYY-MM → 表示用 "YYYY年M月"
 */
export const formatYearMonth = (yearMonth: YearMonth): string => {
  const [year, month] = yearMonth.split('-')
  return `${year}年${Number(month)}月`
}
