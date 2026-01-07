/**
 * ナビゲーション関連のユーティリティ関数
 */

/**
 * 指定されたパスが現在アクティブかどうかを判定する
 * @param href チェックするパス
 * @param currentPathname 現在のパス名
 * @returns アクティブかどうか
 */
export const isActivePath = (href: string, currentPathname: string): boolean => {
  if (href === '/KM') {
    return currentPathname === '/KM' || currentPathname === '/KM/'
  }
  return currentPathname === href || currentPathname.startsWith(href + '/')
}

