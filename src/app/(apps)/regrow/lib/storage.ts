/**
 * Regrow アプリのlocalStorage管理
 */

import type {MonthlyData, YearMonth} from '../types'

const STORAGE_PREFIX = 'regrow_data_'

/**
 * YYYY-MM単位でデータを保存
 */
export const saveMonthlyData = (yearMonth: YearMonth, data: MonthlyData): void => {
  try {
    const key = `${STORAGE_PREFIX}${yearMonth}`
    const dataWithTimestamp = {
      ...data,
      updatedAt: new Date(),
    }
    localStorage.setItem(key, JSON.stringify(dataWithTimestamp))
  } catch (error) {
    console.error('Failed to save monthly data:', error)
    throw new Error('データの保存に失敗しました')
  }
}

/**
 * YYYY-MM単位でデータを読み込み
 */
export const loadMonthlyData = (yearMonth: YearMonth): MonthlyData | null => {
  try {
    const key = `${STORAGE_PREFIX}${yearMonth}`
    const stored = localStorage.getItem(key)
    if (!stored) return null

    const data = JSON.parse(stored) as any

    // Date型の復元
    data.createdAt = new Date(data.createdAt)
    data.updatedAt = new Date(data.updatedAt)
    if (data.importedData) {
      data.importedData.importedAt = new Date(data.importedData.importedAt)
    }

    // 旧構造から新構造へのマイグレーション
    if (data.manualData) {
      // staffManualDataが存在しない場合、staffUtilizationとstaffEvaluationから作成
      if (!data.manualData.staffManualData && (data.manualData.staffUtilization || data.manualData.staffEvaluation)) {
        const staffUtilization = data.manualData.staffUtilization || []
        const staffEvaluation = data.manualData.staffEvaluation || []

        // スタッフ名と店舗名のユニークな組み合わせを取得
        const staffSet = new Set<string>()
        staffUtilization.forEach((u: any) => staffSet.add(`${u.staffName}:${u.storeName}`))
        staffEvaluation.forEach((e: any) => staffSet.add(`${e.staffName}:${e.storeName}`))

        // staffManualDataを作成
        data.manualData.staffManualData = Array.from(staffSet).map((key) => {
          const [staffName, storeName] = key.split(':')
          const utilization = staffUtilization.find((u: any) => u.staffName === staffName && u.storeName === storeName)
          return {
            staffName,
            storeName,
            utilizationRate: utilization?.utilizationRate || null,
            csRegistrationCount: null,
          }
        })

        // 旧フィールドを削除
        delete data.manualData.staffUtilization
        delete data.manualData.staffEvaluation

        // マイグレーション後のデータを保存
        localStorage.setItem(key, JSON.stringify(data))
      }

      // staffManualDataが未定義の場合は空配列に初期化
      if (!data.manualData.staffManualData) {
        data.manualData.staffManualData = []
      }

      // storeKpisが未定義の場合は空配列に初期化
      if (!data.manualData.storeKpis) {
        data.manualData.storeKpis = []
      }

      // customerVoiceが未定義の場合は初期化
      if (!data.manualData.customerVoice) {
        data.manualData.customerVoice = {content: ''}
      }
    }

    return data as MonthlyData
  } catch (error) {
    console.error('Failed to load monthly data:', error)
    return null
  }
}

/**
 * 全YYYY-MMリストを取得（降順）
 */
export const getAllMonths = (): YearMonth[] => {
  try {
    const keys: YearMonth[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) {
        const yearMonth = key.replace(STORAGE_PREFIX, '')
        keys.push(yearMonth)
      }
    }
    // 降順ソート（最新が先頭）
    return keys.sort((a, b) => b.localeCompare(a))
  } catch (error) {
    console.error('Failed to get all months:', error)
    return []
  }
}

/**
 * YYYY-MM単位でデータを削除
 */
export const deleteMonthlyData = (yearMonth: YearMonth): void => {
  try {
    const key = `${STORAGE_PREFIX}${yearMonth}`
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to delete monthly data:', error)
    throw new Error('データの削除に失敗しました')
  }
}

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
