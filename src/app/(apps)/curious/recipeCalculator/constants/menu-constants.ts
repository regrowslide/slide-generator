import type {MenuItem} from '../types'

/**
 * ヘッダーメニュー項目定義
 */
export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'calculator',
    label: 'AI原価計算',
    href: '/curious/recipeCalculator/calculator',
    icon: 'calculator',
  },
  {
    id: 'master',
    label: '原材料マスタ',
    href: '/curious/recipeCalculator/master',
    icon: 'database',
  },
]
