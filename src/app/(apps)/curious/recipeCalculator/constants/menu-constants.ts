import {isDev} from '@cm/lib/methods/common'
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
    adminOnly: isDev ? false : true,
  },
  {
    id: 'profit-margin',
    label: '粗利基準マスタ',
    href: '/curious/recipeCalculator/profit-margin-master',
    icon: 'settings',
    adminOnly: isDev ? false : true,
  },
]
