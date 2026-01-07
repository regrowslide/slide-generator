/**
 * WorkEditForm関連の定数定義
 */

/** 企業規模の選択肢 */
export const COMPANY_SCALE_OPTIONS = [
  '1-10名',
  '11-50名',
  '51-100名',
  '100名以上',
] as const

/** プロジェクト期間の選択肢 */
export const PROJECT_DURATION_OPTIONS = [
  '1週間',
  '2週間',
  '3週間',
  '1ヶ月',
  '1.5ヶ月',
  '2ヶ月',
  '3ヶ月',
  '継続中',
] as const

/** 評価ポイントの範囲 */
export const RATING_POINT_RANGE = {
  MIN: 1,
  MAX: 5,
  STEP: 0.5,
} as const

