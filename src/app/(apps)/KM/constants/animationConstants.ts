/**
 * アニメーション関連の定数定義
 */

/** TestimonialCarouselのアニメーション設定 */
export const TESTIMONIAL_ANIMATION = {
  CONTAINER: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  CARD: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  },
} as const

/** EnhancedIntroductionのアニメーション設定 */
export const INTRODUCTION_ANIMATION = {
  CONTAINER: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  },
  ITEM: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  },
} as const

/** CompactWorkCardのアニメーション設定 */
export const COMPACT_CARD_ANIMATION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
} as const

/** WorkCardのアニメーション設定 */
export const WORK_CARD_ANIMATION = {
  initial: { opacity: 0, y: 30 },
  transition: { duration: 0.5 },
} as const

/** パーティクルアニメーション設定 */
export const PARTICLE_ANIMATION = {
  COUNT: 6,
  BASE_DURATION: 4,
  DURATION_VARIANCE: 2,
  BASE_DELAY: 0.5,
  OPACITY_RANGE: [0.2, 0.5, 0.2] as const,
  Y_RANGE: [0, -30, 0] as const,
  X_VARIANCE: 20,
} as const

/** スクロールダウンアニメーション設定 */
export const SCROLL_DOWN_ANIMATION = {
  Y_RANGE: [0, 8, 0] as const,
  DURATION: 2,
  REPEAT: Infinity,
  EASE: 'easeInOut' as const,
} as const

