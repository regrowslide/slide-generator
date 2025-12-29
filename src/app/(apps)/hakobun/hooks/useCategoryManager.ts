'use client'

import {useState, useCallback, useEffect, useMemo} from 'react'
import {v4 as uuidv4} from 'uuid'
import {
  IndustryGeneralCategoryWithCategories,
  CategoryDiff,
  AnalysisResult,
  PendingGeneralCategory,
  PendingCategory,
} from '../types'

interface UseCategoryManagerProps {
  selectedClient: {clientId: string} | null | undefined
}

interface UseCategoryManagerReturn {
  /** 業種に紐づく一般カテゴリ（カテゴリ含む） */
  industryGeneralCategories: IndustryGeneralCategoryWithCategories[]
  /** DB + 保留中を統合した一般カテゴリ一覧（ドロップダウン用） */
  mergedGeneralCategories: IndustryGeneralCategoryWithCategories[]
  /** 保留中の一般カテゴリ */
  pendingGeneralCategories: PendingGeneralCategory[]
  /** 保留中のカテゴリ */
  pendingCategories: PendingCategory[]
  /** カテゴリ差分情報（既存 vs AI分析） */
  categoryDiff: CategoryDiff
  /** カテゴリ情報を再取得 */
  refreshCategories: () => Promise<void>
  /** 分析結果からカテゴリ差分を計算 */
  computeCategoryDiff: (results: AnalysisResult[]) => CategoryDiff
  /** 一般カテゴリがAI新規生成かどうか判定 */
  isNewGeneratedGeneralCategory: (name: string) => boolean
  /** カテゴリがAI新規生成かどうか判定 */
  isNewGeneratedCategory: (name: string) => boolean
  /** 一般カテゴリが保留中（未保存）かどうか判定 */
  isPendingGeneralCategory: (name: string) => boolean
  /** カテゴリが保留中（未保存）かどうか判定 */
  isPendingCategory: (name: string) => boolean
  /** 新規一般カテゴリを作成（stateに追加、DBには保存しない） */
  createGeneralCategory: (name: string, description?: string) => boolean
  /** 新規カテゴリを作成（stateに追加、DBには保存しない） */
  createCategory: (generalCategoryName: string, name: string, description?: string) => boolean
  /** 保留中のカテゴリをDBに一括保存 */
  savePendingCategories: (
    usedGeneralCategories?: Set<string>,
    usedCategories?: Set<string>
  ) => Promise<{
    success: boolean
    savedGeneralCategories: number
    savedCategories: number
    savedGeneralCategoriesList: PendingGeneralCategory[]
    savedCategoriesList: PendingCategory[]
    error?: string
  }>
  /** 保留中のカテゴリをクリア */
  clearPendingCategories: () => void
  /** 業種ID */
  industryId: number | null
  /** エラーメッセージ */
  error: string | null
}

/**
 * カテゴリ管理用hook
 * - 業種別一般カテゴリ・カテゴリの取得
 * - DB登録済み vs AI新規生成の区分管理
 * - 新規カテゴリの作成（stateに保留、一括保存時にDB保存）
 */
export default function useCategoryManager({selectedClient}: UseCategoryManagerProps): UseCategoryManagerReturn {
  const [industryGeneralCategories, setIndustryGeneralCategories] = useState<IndustryGeneralCategoryWithCategories[]>([])
  const [pendingGeneralCategories, setPendingGeneralCategories] = useState<PendingGeneralCategory[]>([])
  const [pendingCategories, setPendingCategories] = useState<PendingCategory[]>([])
  const [categoryDiff, setCategoryDiff] = useState<CategoryDiff>({
    existingGeneralCategories: [],
    existingCategories: [],
    detectedGeneralCategories: [],
    detectedCategories: [],
    newGeneralCategories: [],
    newCategories: [],
  })
  const [error, setError] = useState<string | null>(null)
  const [industryId, setIndustryId] = useState<number | null>(null)

  // クライアントの業種IDを取得
  useEffect(() => {
    if (!selectedClient?.clientId) {
      setIndustryId(null)
      setIndustryGeneralCategories([])
      return
    }

    const fetchIndustryId = async () => {
      try {
        const res = await fetch('/api/hakobun/clients')
        const data = await res.json()
        if (data.success && data.clients) {
          const client = data.clients.find((c: {clientId: string}) => c.clientId === selectedClient.clientId)
          if (client?.industryId) {
            setIndustryId(client.industryId)
          }
        }
      } catch (err) {
        console.error('Failed to fetch client industry:', err)
        setError('クライアント情報の取得に失敗しました')
      }
    }

    fetchIndustryId()
  }, [selectedClient?.clientId])

  // 業種IDが変わったらカテゴリを取得
  useEffect(() => {
    if (!industryId) return

    const fetchCategories = async () => {
      try {
        const res = await fetch(`/api/hakobun/industries/${industryId}/general-categories`)
        const data = await res.json()
        if (data.success) {
          setIndustryGeneralCategories(data.generalCategories)
        }
      } catch (err) {
        console.error('Failed to fetch industry general categories:', err)
        setError('カテゴリの取得に失敗しました')
      }
    }

    fetchCategories()
  }, [industryId])

  // カテゴリ情報を再取得
  const refreshCategories = useCallback(async () => {
    if (!industryId) return

    try {
      const res = await fetch(`/api/hakobun/industries/${industryId}/general-categories`)
      const data = await res.json()
      if (data.success) {
        setIndustryGeneralCategories(data.generalCategories)
      }
    } catch (err) {
      console.error('Failed to refresh categories:', err)
      setError('カテゴリの再取得に失敗しました')
    }
  }, [industryId])

  // DB + 保留中を統合した一般カテゴリ一覧（ドロップダウン用）
  const mergedGeneralCategories = useMemo((): IndustryGeneralCategoryWithCategories[] => {
    // DBのカテゴリをコピー
    const merged: IndustryGeneralCategoryWithCategories[] = industryGeneralCategories.map(gc => ({
      ...gc,
      categories: [
        ...gc.categories,
        // この一般カテゴリに紐づく保留中カテゴリを追加
        ...pendingCategories
          .filter(pc => pc.generalCategoryName === gc.name)
          .map((pc, idx) => ({
            id: -1 - idx, // 負のIDで保留中を識別
            name: pc.name,
            description: pc.description || null,
            sortOrder: gc.categories.length + idx + 1,
          })),
      ],
    }))

    // 保留中の一般カテゴリを追加
    pendingGeneralCategories.forEach((pgc, idx) => {
      merged.push({
        id: -1000 - idx, // 負のIDで保留中を識別
        name: pgc.name,
        description: pgc.description || null,
        sortOrder: industryGeneralCategories.length + idx + 1,
        categories: pendingCategories
          .filter(pc => pc.generalCategoryName === pgc.name)
          .map((pc, cidx) => ({
            id: -2000 - cidx,
            name: pc.name,
            description: pc.description || null,
            sortOrder: cidx + 1,
          })),
      })
    })

    return merged
  }, [industryGeneralCategories, pendingGeneralCategories, pendingCategories])

  // DB登録済みの一般カテゴリ名リスト
  const existingGeneralCategories = useMemo(() => industryGeneralCategories.map(gc => gc.name), [industryGeneralCategories])

  // DB登録済みのカテゴリ名リスト
  const existingCategories = useMemo(
    () => industryGeneralCategories.flatMap(gc => gc.categories.map(c => c.name)),
    [industryGeneralCategories]
  )

  // 分析結果からカテゴリ差分を計算
  const computeCategoryDiff = useCallback(
    (results: AnalysisResult[]): CategoryDiff => {
      const detectedGeneralCategoriesSet = new Set<string>()
      const detectedCategoriesSet = new Set<string>()

      results.forEach(result => {
        result.extracts.forEach(extract => {
          if (extract.general_category) {
            detectedGeneralCategoriesSet.add(extract.general_category)
          }
          if (extract.category) {
            detectedCategoriesSet.add(extract.category)
          }
        })
      })

      const detectedGeneralCategories = Array.from(detectedGeneralCategoriesSet)
      const detectedCategories = Array.from(detectedCategoriesSet)

      // DB未登録 かつ 保留中にも無いものを新規として判定
      const pendingGCNames = pendingGeneralCategories.map(pgc => pgc.name)
      const pendingCNames = pendingCategories.map(pc => pc.name)

      const newGeneralCategories = detectedGeneralCategories.filter(
        name => !existingGeneralCategories.includes(name) && !pendingGCNames.includes(name)
      )
      const newCategories = detectedCategories.filter(name => !existingCategories.includes(name) && !pendingCNames.includes(name))

      const diff: CategoryDiff = {
        existingGeneralCategories,
        existingCategories,
        detectedGeneralCategories,
        detectedCategories,
        newGeneralCategories,
        newCategories,
      }

      setCategoryDiff(diff)
      return diff
    },
    [existingGeneralCategories, existingCategories, pendingGeneralCategories, pendingCategories]
  )

  // 一般カテゴリがAI新規生成かどうか判定
  const isNewGeneratedGeneralCategory = useCallback(
    (name: string): boolean => {
      return categoryDiff.newGeneralCategories.includes(name)
    },
    [categoryDiff.newGeneralCategories]
  )

  // カテゴリがAI新規生成かどうか判定
  const isNewGeneratedCategory = useCallback(
    (name: string): boolean => {
      return categoryDiff.newCategories.includes(name)
    },
    [categoryDiff.newCategories]
  )

  // 一般カテゴリが保留中（未保存）かどうか判定
  const isPendingGeneralCategory = useCallback(
    (name: string): boolean => {
      return pendingGeneralCategories.some(pgc => pgc.name === name)
    },
    [pendingGeneralCategories]
  )

  // カテゴリが保留中（未保存）かどうか判定
  const isPendingCategory = useCallback(
    (name: string): boolean => {
      return pendingCategories.some(pc => pc.name === name)
    },
    [pendingCategories]
  )

  // 新規一般カテゴリを作成（stateに追加、DBには保存しない）
  const createGeneralCategory = useCallback(
    (name: string, description?: string): boolean => {
      if (!name.trim()) {
        setError('カテゴリ名が不正です')
        return false
      }

      // 既にDB or 保留中に存在するかチェック
      if (existingGeneralCategories.includes(name)) {
        setError('この一般カテゴリは既に存在します')
        return false
      }
      if (pendingGeneralCategories.some(pgc => pgc.name === name)) {
        setError('この一般カテゴリは既に追加されています')
        return false
      }

      // stateに追加
      setPendingGeneralCategories(prev => [
        ...prev,
        {
          tempId: uuidv4(),
          name,
          description,
          pendingCategories: [],
        },
      ])

      setError(null)
      return true
    },
    [existingGeneralCategories, pendingGeneralCategories]
  )

  // 新規カテゴリを作成（stateに追加、DBには保存しない）
  const createCategory = useCallback(
    (generalCategoryName: string, name: string, description?: string): boolean => {
      if (!name.trim()) {
        setError('カテゴリ名が不正です')
        return false
      }

      // 一般カテゴリがDB or 保留中に存在するかチェック
      const existsInDB = existingGeneralCategories.includes(generalCategoryName)
      const existsInPending = pendingGeneralCategories.some(pgc => pgc.name === generalCategoryName)
      if (!existsInDB && !existsInPending) {
        setError('一般カテゴリが見つかりません。先に一般カテゴリを追加してください。')
        return false
      }

      // 既にDB or 保留中に存在するかチェック
      if (existingCategories.includes(name)) {
        setError('このカテゴリは既に存在します')
        return false
      }
      if (pendingCategories.some(pc => pc.name === name)) {
        setError('このカテゴリは既に追加されています')
        return false
      }

      // stateに追加
      setPendingCategories(prev => [
        ...prev,
        {
          tempId: uuidv4(),
          generalCategoryName,
          name,
          description,
        },
      ])

      setError(null)
      return true
    },
    [existingGeneralCategories, existingCategories, pendingGeneralCategories, pendingCategories]
  )

  // 保留中のカテゴリをDBに一括保存
  // usedGeneralCategories: 実際にtableRowsで使用されている一般カテゴリ名のセット
  // usedCategories: 実際にtableRowsで使用されているカテゴリ名のセット
  const savePendingCategories = useCallback(
    async (
      usedGeneralCategories?: Set<string>,
      usedCategories?: Set<string>
    ): Promise<{
      success: boolean
      savedGeneralCategories: number
      savedCategories: number
      savedGeneralCategoriesList: PendingGeneralCategory[]
      savedCategoriesList: PendingCategory[]
      error?: string
    }> => {
      if (!industryId) {
        return {
          success: false,
          savedGeneralCategories: 0,
          savedCategories: 0,
          savedGeneralCategoriesList: [],
          savedCategoriesList: [],
          error: '業種IDが不正です',
        }
      }

      let savedGeneralCategories = 0
      let savedCategories = 0
      const savedGeneralCategoriesList: PendingGeneralCategory[] = []
      const savedCategoriesList: PendingCategory[] = []

      try {
        // 1. 保留中の一般カテゴリをDB保存（実際に使用されているもののみ）
        const generalCategoriesToSave = usedGeneralCategories
          ? pendingGeneralCategories.filter(pgc => usedGeneralCategories.has(pgc.name))
          : pendingGeneralCategories

        for (const pgc of generalCategoriesToSave) {
          const maxSortOrder =
            industryGeneralCategories.length > 0 ? Math.max(...industryGeneralCategories.map(gc => gc.sortOrder || 0)) : 0

          const res = await fetch(`/api/hakobun/industries/${industryId}/general-categories`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              name: pgc.name,
              description: pgc.description || null,
              sortOrder: maxSortOrder + savedGeneralCategories + 1,
            }),
          })

          const data = await res.json()
          if (data.success) {
            savedGeneralCategories++
            savedGeneralCategoriesList.push(pgc)
          } else {
            console.error('Failed to save general category:', pgc.name, data.error)
          }
        }

        // カテゴリを再取得（新しい一般カテゴリのIDを取得するため）
        if (savedGeneralCategories > 0) {
          await refreshCategories()
        }

        // 最新のカテゴリ一覧を取得
        const latestRes = await fetch(`/api/hakobun/industries/${industryId}/general-categories`)
        const latestData = await latestRes.json()
        const latestCategories: IndustryGeneralCategoryWithCategories[] = latestData.success
          ? latestData.generalCategories
          : industryGeneralCategories

        // 2. 保留中のカテゴリをDB保存（実際に使用されているもののみ）
        const categoriesToSave = usedCategories ? pendingCategories.filter(pc => usedCategories.has(pc.name)) : pendingCategories

        for (const pc of categoriesToSave) {
          const generalCategory = latestCategories.find(gc => gc.name === pc.generalCategoryName)
          if (!generalCategory) {
            console.error('General category not found for:', pc.generalCategoryName)
            continue
          }

          const maxSortOrder =
            generalCategory.categories.length > 0 ? Math.max(...generalCategory.categories.map(c => c.sortOrder || 0)) : 0

          const res = await fetch(`/api/hakobun/industries/${industryId}/general-categories/${generalCategory.id}/categories`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              name: pc.name,
              description: pc.description || null,
              sortOrder: maxSortOrder + 1,
            }),
          })

          const data = await res.json()
          if (data.success) {
            savedCategories++
            savedCategoriesList.push(pc)
          } else {
            console.error('Failed to save category:', pc.name, data.error)
          }
        }

        // 使用されなかった保留中カテゴリを削除（使用されたものは既にDBに保存済み）
        if (usedGeneralCategories) {
          setPendingGeneralCategories(prev => prev.filter(pgc => !usedGeneralCategories.has(pgc.name)))
        } else {
          setPendingGeneralCategories([])
        }

        if (usedCategories) {
          setPendingCategories(prev => prev.filter(pc => !usedCategories.has(pc.name)))
        } else {
          setPendingCategories([])
        }

        // カテゴリを再取得
        await refreshCategories()

        return {
          success: true,
          savedGeneralCategories,
          savedCategories,
          savedGeneralCategoriesList,
          savedCategoriesList,
        }
      } catch (err) {
        console.error('Save pending categories error:', err)
        return {
          success: false,
          savedGeneralCategories,
          savedCategories,
          savedGeneralCategoriesList: [],
          savedCategoriesList: [],
          error: err instanceof Error ? err.message : 'Unknown error',
        }
      }
    },
    [industryId, pendingGeneralCategories, pendingCategories, industryGeneralCategories, refreshCategories]
  )

  // 保留中のカテゴリをクリア
  const clearPendingCategories = useCallback(() => {
    setPendingGeneralCategories([])
    setPendingCategories([])
  }, [])

  return {
    industryGeneralCategories,
    mergedGeneralCategories,
    pendingGeneralCategories,
    pendingCategories,
    categoryDiff,
    refreshCategories,
    computeCategoryDiff,
    isNewGeneratedGeneralCategory,
    isNewGeneratedCategory,
    isPendingGeneralCategory,
    isPendingCategory,
    createGeneralCategory,
    createCategory,
    savePendingCategories,
    clearPendingCategories,
    industryId,
    error,
  }
}
