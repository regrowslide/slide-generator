/**
 * Works関連の定数定義
 */

/** 人気カテゴリーと判定するための最小実績数 */
export const POPULAR_CATEGORY_THRESHOLD = 3

/** コンパクトカードの説明プレビューの最大文字数 */
export const DESCRIPTION_PREVIEW_MAX_LENGTH = 120

/** グリッドレイアウトのカラム数設定 */
export const GRID_COLUMNS = {
  MOBILE: 1,
  TABLET: 2,
  DESKTOP: 3,
} as const

/** モーダルのサイズ設定 */
export const MODAL_SIZES = {
  MAX_WIDTH: '90vw',
  MAX_HEIGHT: '90vh',
  CONTENT_MAX_HEIGHT: 'calc(90vh - 120px)',
} as const

/** Intersection Observerの設定 */
export const INTERSECTION_OBSERVER_CONFIG = {
  THRESHOLD: 0.05,
  TRIGGER_ONCE: true,
} as const

