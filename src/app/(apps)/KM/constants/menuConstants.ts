/**
 * メニュー関連の定数定義
 */

export type MenuItem = {
  label: string
  href: string
}

/** デフォルトのメニュー項目 */
export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { label: 'ホーム', href: '/KM' },
  { label: 'デモ先行開発', href: '/KM/demoDriven' },
  { label: 'こんなお客様に', href: '/KM/services' },
  { label: 'お客様の声', href: '/KM/testimonials' },
  { label: 'お問い合わせ', href: '/KM/contact' },
]

