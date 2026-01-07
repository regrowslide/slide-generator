/**
 * Works関連のユーティリティ関数
 */

import { POPULAR_CATEGORY_THRESHOLD } from '../constants/worksConstants'
import type { Work, CategoryType, CategoryInfo } from '../types/works'

/**
 * 指定されたキーで一意な値を取得する
 * @param works 実績の配列
 * @param key 取得するキー
 * @returns 一意な値の配列
 */
export const getUniqueValues = (works: Work[], key: string): string[] => {
  return Array.from(new Set(works.map(work => work[key]).filter(Boolean)))
}

/**
 * カテゴリーごとの実績数をカウントする
 * @param works 実績の配列
 * @param category カテゴリー名
 * @param type カテゴリータイプ
 * @returns 実績数
 */
export const getCategoryCount = (
  works: Work[],
  category: string,
  type: CategoryType
): number => {
  return works.filter(work => work[type] === category).length
}

/**
 * 人気カテゴリーかどうかを判定する
 * @param works 実績の配列
 * @param category カテゴリー名
 * @param type カテゴリータイプ
 * @returns 人気カテゴリーかどうか
 */
export const isPopularCategory = (
  works: Work[],
  category: string,
  type: CategoryType
): boolean => {
  return getCategoryCount(works, category, type) >= POPULAR_CATEGORY_THRESHOLD
}

/**
 * 人気カテゴリーのリストを取得する
 * @param works 実績の配列
 * @param jobCategories 業種カテゴリーの配列
 * @param systemCategories システムカテゴリーの配列
 * @returns 人気カテゴリーの配列（実績数が多い順）
 */
export const getPopularCategories = (
  works: Work[],
  jobCategories: string[],
  systemCategories: string[]
): CategoryInfo[] => {
  const popular: CategoryInfo[] = []

  jobCategories.forEach(cat => {
    const count = getCategoryCount(works, cat, 'jobCategory')
    if (count >= POPULAR_CATEGORY_THRESHOLD) {
      popular.push({ category: cat, type: 'jobCategory', count })
    }
  })

  systemCategories.forEach(cat => {
    const count = getCategoryCount(works, cat, 'systemCategory')
    if (count >= POPULAR_CATEGORY_THRESHOLD) {
      popular.push({ category: cat, type: 'systemCategory', count })
    }
  })

  // 実績数が多い順にソート
  return popular.sort((a, b) => b.count - a.count)
}

/**
 * 説明文のプレビューテキストを生成する
 * @param description 説明文
 * @param maxLength 最大文字数
 * @returns プレビューテキスト
 */
export const getDescriptionPreview = (description: string | null | undefined, maxLength: number): string => {
  if (!description) return ''
  return description.length > maxLength ? description.substring(0, maxLength) + '...' : description
}

