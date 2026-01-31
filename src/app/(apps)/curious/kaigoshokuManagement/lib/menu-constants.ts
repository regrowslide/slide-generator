export type MenuItem = {
  id: string
  label: string
  href: string
  icon: 'clipboard' | 'factory' | 'package' | 'database' | 'settings' | 'calendar'
  description?: string
  adminOnly?: boolean
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'orders',
    label: '注文管理',
    href: '/curious/kaigoshokuManagement',
    icon: 'clipboard',
    description: '受注データの取込・確認',
  },
  {
    id: 'kondate',
    label: '献立管理',
    href: '/curious/kaigoshokuManagement/kondate',
    icon: 'calendar',
    description: '月別献立データの管理',
  },
  {
    id: 'ingredient-master',
    label: '材料マスタ',
    href: '/curious/kaigoshokuManagement/ingredient-master',
    icon: 'database',
    description: '材料マスタの管理',
  },
  {
    id: 'production',
    label: '製造指示',
    href: '/curious/kaigoshokuManagement/production',
    icon: 'factory',
    description: '製造計画の作成・管理',
  },
  {
    id: 'packing',
    label: '梱包・配送',
    href: '/curious/kaigoshokuManagement/packing',
    icon: 'package',
    description: '梱包・配送準備',
  },
  {
    id: 'master',
    label: 'マスター管理',
    href: '/curious/kaigoshokuManagement/master',
    icon: 'database',
    description: '献立・施設マスターの管理',
    adminOnly: true,
  },
]
