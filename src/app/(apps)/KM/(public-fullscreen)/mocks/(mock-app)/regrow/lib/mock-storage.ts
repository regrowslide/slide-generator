/**
 * Regrow モック用 localStorage CRUD関数
 */

import type {MonthlyData, YearMonth, StaffMaster, StoreName} from '@app/(apps)/regrow/types'

const STORAGE_PREFIX = 'regrow_data_'
const STAFF_MASTER_KEY = 'regrow_staff_master'

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

    if (!stored) {
      return null
    }

    const data = JSON.parse(stored) as any

    // Date型の復元
    data.createdAt = new Date(data.createdAt)
    data.updatedAt = new Date(data.updatedAt)
    if (data.importedData) {
      data.importedData.importedAt = new Date(data.importedData.importedAt)
    }

    // 旧構造から新構造へのマイグレーション
    if (data.manualData) {
      if (!data.manualData.staffManualData && (data.manualData.staffUtilization || data.manualData.staffEvaluation)) {
        const staffUtilization = data.manualData.staffUtilization || []
        const staffEvaluation = data.manualData.staffEvaluation || []

        const staffSet = new Set<string>()
        staffUtilization.forEach((u: any) => staffSet.add(`${u.staffName}:${u.storeName}`))
        staffEvaluation.forEach((e: any) => staffSet.add(`${e.staffName}:${e.storeName}`))

        data.manualData.staffManualData = Array.from(staffSet).map((key) => {
          const [staffName, storeName] = key.split(':')
          const utilization = staffUtilization.find((u: any) => u.staffName === staffName && u.storeName === storeName)
          return {
            staffName,
            storeName,
            utilizationRate: utilization?.utilizationRate || null,
            csRegistrationCount: null,
            targetSales: null,
          }
        })

        delete data.manualData.staffUtilization
        delete data.manualData.staffEvaluation

        localStorage.setItem(key, JSON.stringify(data))
      }

      if (!data.manualData.staffManualData) {
        data.manualData.staffManualData = []
      }

      if (!data.manualData.storeKpis) {
        data.manualData.storeKpis = []
      }

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

    // モックデータの月も追加（2026-01〜12）
    const mockMonths: YearMonth[] = Array.from({length: 12}, (_, i) => {
      const month = String(i + 1).padStart(2, '0')
      return `2026-${month}` as YearMonth
    })

    const allMonths = [...new Set([...keys, ...mockMonths])]

    return allMonths.sort((a, b) => b.localeCompare(a))
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
 * スタッフマスタを読み込み
 */
export const loadStaffMaster = (): StaffMaster[] => {
  try {
    const stored = localStorage.getItem(STAFF_MASTER_KEY)
    if (!stored) return []
    return JSON.parse(stored) as StaffMaster[]
  } catch (error) {
    console.error('Failed to load staff master:', error)
    return []
  }
}

/**
 * スタッフマスタを保存
 */
export const saveStaffMaster = (staff: StaffMaster[]): void => {
  try {
    localStorage.setItem(STAFF_MASTER_KEY, JSON.stringify(staff))
  } catch (error) {
    console.error('Failed to save staff master:', error)
  }
}

/**
 * スタッフをUPSERT（名称+店舗の完全一致）
 */
export const upsertStaff = (staffName: string, storeName: StoreName): boolean => {
  const master = loadStaffMaster()
  const exists = master.find((s) => s.staffName === staffName && s.storeName === storeName)

  if (exists) {
    return false
  }

  master.push({
    userId: 0,
    staffName,
    storeName,
    role: 'viewer',
    isActive: true,
  })
  saveStaffMaster(master)
  return true
}
