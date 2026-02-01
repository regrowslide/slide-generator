/**
 * メニュー関連の定数定義
 */

export type MenuItem = {
  label: string
  href: string
  highlight?: 'primary' | 'secondary' // 強調表示
}

/** デフォルトのメニュー項目 */
export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {label: 'ホーム', href: '/KM'},
  {label: 'こんなお客様に', href: '/KM/services'},
  {label: 'お客様の声', href: '/KM/testimonials'},
  {label: '納品アプリデモ', href: '/KM/mocks'},
  {label: 'デモ先行開発', href: '/KM/demoDriven', highlight: 'secondary'},
  {label: 'お問い合わせ', href: '/KM/contact', highlight: 'primary'},
]
