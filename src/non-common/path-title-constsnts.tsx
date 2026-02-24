import { anyObject } from '@cm/types/utility-types'
import { JSX } from 'react'
import { getScopes } from 'src/non-common/scope-lib/getScopes'



import { KM_PAGES } from 'src/non-common/getPages/KM_PAGES'

import { training_PAGES } from 'src/non-common/getPages/training_PAGES'
import { regrow_PAGES } from 'src/non-common/getPages/regrow_PAGES'
import { yamanokai_PAGES } from 'src/non-common/getPages/getYamanokai_PAGES'
import { dental_PAGES } from 'src/non-common/getPages/dental_PAGES'

/**
 * ページ設定取得関数の戻り値型
 */
export type PageGetterResult = {
  allPathsPattenrs: pathItemType[]
  cleansedPathSource: pathItemType[]
  navItems: pathItemType[]
  breads: breadType[]
}

/**
 * ページ設定取得関数の型定義
 */
export type PageGetterFunction = (props: PageGetterType) => PageGetterResult

/**
 * 各アプリケーションのページ設定取得関数を格納するオブジェクト
 */
export const PAGES: Record<string, PageGetterFunction> = {



  KM_PAGES,
  training_PAGES,
  regrow_PAGES,
  yamanokai_PAGES,
  dental_PAGES,



  sbm_PAGES: (props: PageGetterType) => {
    const { roles, query, session, rootPath, pathname } = props

    const { login, admin } = getScopes(session, { query, roles })

    const loginPaths = [
      { tabId: 'dashboard', label: 'ダッシュボード', ROOT: [rootPath] },
      {
        tabId: '',
        label: '予約',
        ROOT: [rootPath],
        children: [
          { tabId: 'reservations', label: '予約管理' },
          { tabId: 'delivery-route', label: '配達ルート管理' },
          { tabId: 'ingredients/usage', label: '材料使用量計算' },
        ],
      },

      { tabId: 'invoices', label: '伝票印刷', ROOT: [rootPath] },
      { tabId: 'rfm', label: 'RFM分析', ROOT: [rootPath] },

      {
        tabId: '',
        label: '管理',
        ROOT: [rootPath],
        children: [
          { tabId: 'ingredients', label: '材料マスタ', ROOT: [rootPath] },
          { tabId: 'products', label: '商品マスタ', ROOT: [rootPath] },
          { tabId: 'customers', label: '顧客マスタ', ROOT: [rootPath] },
          { tabId: 'customer-merge', label: '顧客統合', ROOT: [rootPath] },
          { tabId: 'users', label: 'ユーザーマスタ', ROOT: [rootPath] },
          { tabId: 'seed', label: 'データ管理・シード', ROOT: [rootPath] },
        ],
      },
    ].map((item, i) => {
      return { ...item, ROOT: [rootPath], exclusiveTo: !!login }
    })

    const pathSource: pathItemType[] = [...loginPaths]

    const { cleansedPathSource, navItems, breads, allPathsPattenrs } = CleansePathSource({
      rootPath,
      pathSource,
      pathname,
      session,
    })

    return {
      allPathsPattenrs,
      cleansedPathSource,
      navItems,
      breads,
    }
  },

  counseling_PAGES: (props: PageGetterType) => {
    const { roles, query, session, rootPath, pathname } = props

    const { login, admin } = getScopes(session, { query, roles })

    const loginPaths = [{ tabId: 'settings', label: 'マスタ設定', ROOT: [rootPath] }]

    const pathSource: pathItemType[] = [...loginPaths]

    const { cleansedPathSource, navItems, breads, allPathsPattenrs } = CleansePathSource({
      rootPath,
      pathSource,
      pathname,
      session,
    })
    return {
      allPathsPattenrs,
      cleansedPathSource,
      navItems,
      breads,
    }
  },
  portal_PAGES: (props: PageGetterType) => {
    const { roles, query, session, rootPath, pathname } = props

    const { login, admin } = getScopes(session, { query, roles })

    const loginPaths = [
      { tabId: '', label: 'ダッシュボード', ROOT: [rootPath] },

      {
        tabId: '',
        label: 'データ入力',
        ROOT: [rootPath],
        children: [
          { tabId: 'orders', label: '受注', ROOT: [rootPath] },
          { tabId: 'productions', label: '生産', ROOT: [rootPath] },
          { tabId: 'shipments', label: '出荷', ROOT: [rootPath] },
        ],
      },
      {
        tabId: '',
        label: 'マスタ管理',
        ROOT: [rootPath],
        children: [
          { tabId: 'materials', label: '原材料マスター', ROOT: [rootPath] },
          { tabId: 'products', label: '製品マスター', ROOT: [rootPath] },
          { tabId: 'calendar', label: 'カレンダー管理', ROOT: [rootPath] },
        ],
      },
    ]

    const pathSource: pathItemType[] = [...loginPaths]

    const { cleansedPathSource, navItems, breads, allPathsPattenrs } = CleansePathSource({
      rootPath,
      pathSource,
      pathname,
      session,
    })
    return {
      allPathsPattenrs,
      cleansedPathSource,
      navItems,
      breads,
    }
  },

  aidocument_PAGES: (props: PageGetterType) => {
    const { roles, query, session, rootPath, pathname } = props

    const { login, admin } = getScopes(session, { query, roles })

    const loginPaths = [
      {
        tabId: 'company',
        label: '自社情報管理',
        ROOT: [rootPath],
        exclusiveTo: !!login,
      },
      {
        tabId: 'clients',
        label: '取引先マスタ管理',
        ROOT: [rootPath],
        exclusiveTo: !!login,
      },
    ]

    const adminPaths = [
      {
        tabId: '',
        label: '管理者',
        ROOT: [rootPath],
        children: [
          { tabId: 'aidocumentCompany', label: '企業一覧', ROOT: [rootPath] },
          { tabId: 'user', label: 'ユーザー一覧', ROOT: [rootPath] },
        ],
        exclusiveTo: !!admin,
      },
    ]

    const pathSource: pathItemType[] = [...loginPaths, ...adminPaths]

    const { cleansedPathSource, navItems, breads, allPathsPattenrs } = CleansePathSource({
      rootPath,
      pathSource,
      pathname,
      session,
    })

    return {
      allPathsPattenrs,
      cleansedPathSource,
      navItems,
      breads,
    }
  },

  imageCaptioner_PAGES: (props: PageGetterType) => {
    const { roles, query, session, rootPath, pathname } = props

    const { login, admin } = getScopes(session, { query, roles })

    const loginPaths = [
      {
        tabId: '',
        label: '',
        ROOT: [rootPath],
        exclusiveTo: !!login,
      },

    ]

    const adminPaths = [

    ]

    const pathSource: pathItemType[] = [...loginPaths, ...adminPaths]

    const { cleansedPathSource, navItems, breads, allPathsPattenrs } = CleansePathSource({
      rootPath,
      pathSource,
      pathname,
      session,
    })

    return {
      allPathsPattenrs,
      cleansedPathSource,
      navItems,
      breads,
    }
  },

}

/**
 * CleansePathSource関数の引数型
 */
type CleansePathSourceProps = {
  rootPath: string
  pathname: string
  query?: anyObject
  session?: anyObject
  dynamicRoutingParams?: anyObject
  roles?: any[]
  pathSource: pathItemType[]
}

/**
 * パスソースをクレンジングし、ナビゲーションアイテム、パンくずリスト、全パスパターンを生成
 */
export const CleansePathSource = (props: CleansePathSourceProps): PageGetterResult => {
  const { rootPath, pathname, query = {}, session = {}, dynamicRoutingParams, roles } = props
  const { login } = getScopes(session, { query, roles })
  const { pathSource } = props

  const navItems: pathItemType[] = []
  const breads: breadType[] = []
  const allPathsPattenrs: pathItemType[] = []

  /**
   * パスアイテムを構築し、hrefとjoinedPathを設定
   */
  type ConstructItemProps = {
    item: pathItemType
    CURRENT_ROOT?: string[]
  }

  const constructItem = (props: ConstructItemProps): pathItemType => {
    let { item } = props
    const { CURRENT_ROOT = [] } = props
    const { tabId, link = { query: {} }, children, ROOT } = item

    // tabIdをstringに変換（RegExpの場合は空文字列に）
    const tabIdString = typeof tabId === 'string' ? tabId : ''

    const thisRoot: string[] = ROOT ? ROOT : CURRENT_ROOT

    // hrefが未設定の場合、tabIdとROOTから構築
    let href: string | undefined = item?.href
    if (href === undefined) {
      const rootPath = thisRoot.join('/')
      if (rootPath.length > 0) {
        href = link ? `/${rootPath}/${tabIdString}` : undefined
      } else {
        href = link ? `/${tabIdString}` : undefined
      }
    }

    item = { ...item, href }

    // パンくずリスト用のパスオブジェクトを作成
    const joinedPath = [...thisRoot, tabIdString].filter(Boolean).join('/')
    const pathObject: pathItemType = {
      ...item,
      href: `/${joinedPath}`,
      joinedPath,
    }
    allPathsPattenrs.push(pathObject)

    // 子要素を再帰的に処理
    if (item.children && item.children.length > 0) {
      const newRoot = [...thisRoot, tabIdString].filter(Boolean)
      item.children.forEach(child => {
        constructItem({ item: child, CURRENT_ROOT: newRoot })
      })
    }

    return item
  }
  /**
   * ナビゲーションアイテムを作成（パンくずリストの前処理も含む）
   */
  pathSource.forEach((item: pathItemType) => {
    const { ROOT = [] } = item

    // アイテムを構築
    const constructedItem = constructItem({ item, CURRENT_ROOT: ROOT })

    // 子要素を構築（exclusiveToを継承）
    const constructedChildren = constructedItem.children?.map(child => {
      const childWithInheritedExclusiveTo: pathItemType = {
        ...child,
        exclusiveTo: child.exclusiveTo !== undefined ? child.exclusiveTo : constructedItem.exclusiveTo,
      }
      return constructItem({ item: childWithInheritedExclusiveTo, CURRENT_ROOT: ROOT })
    })

    const finalItem: pathItemType = {
      ...constructedItem,
      children: constructedChildren,
    }

    // exclusiveToがfalseでない場合のみナビゲーションアイテムに追加
    if (finalItem.exclusiveTo !== false) {
      navItems.push(finalItem)
    }
  })

  /**
   * パンくずリストを作成
   * 現在のパス名を分割し、各セグメントに対応するパスアイテムを検索
   */
  const pathnameSplit: string[] = String(pathname)
    .split('/')
    .filter(Boolean) // 空文字列を除外

  const currentPathSegments: string[] = []

  for (const segment of pathnameSplit) {
    currentPathSegments.push(segment)
    const currentPath = `/${currentPathSegments.join('/')}`

    const matchedPath = allPathsPattenrs.find((path: pathItemType) => {
      if (!path.joinedPath) return false
      const pathToMatch = `/${path.joinedPath}`
      return currentPath === pathToMatch
    })

    if (matchedPath) {
      breads.push(matchedPath as breadType)
    }
  }

  return {
    cleansedPathSource: pathSource,
    navItems,
    breads,
    allPathsPattenrs,
  }
}

/**
 * パス名から対応するパスアイテムを特定
 */
export const identifyPathItem = ({
  allPathsPattenrs,
  pathname,
}: {
  allPathsPattenrs: pathItemType[]
  pathname: string
}): pathItemType | undefined => {
  const pathnameSplitArr = String(pathname)
    .split('/')
    .filter(Boolean) // 空文字列を除外

  const matchedPathItem = allPathsPattenrs.find(item => {
    if (!item.href) return false

    const itemHrefArray = item.href.split('/').filter(Boolean)

    // パスセグメントの数が一致する必要がある
    if (pathnameSplitArr.length !== itemHrefArray.length) {
      return false
    }

    // すべてのセグメントが一致するかチェック
    const allSegmentsMatch = itemHrefArray.every((segment, index) => {
      return segment === pathnameSplitArr[index]
    })

    return allSegmentsMatch
  })

  return matchedPathItem
}

/**
 * パスアイテムの型定義
 */
export type pathItemType = {
  tabId?: string | RegExp
  label?: string | JSX.Element
  icon?: string
  href?: string
  target?: `_blank` | undefined
  ROOT?: string[]
  hide?: boolean
  exclusiveTo?: boolean | 'always'
  children?: pathItemType[]
  link?: {
    query?: Record<string, unknown>
  }
  joinedPath?: string
}

/**
 * パンくずリストアイテムの型定義
 */
export type breadType = {
  href: string
  label: string
  joinedPath: string
} & pathItemType

/**
 * ページ設定取得関数の引数型
 */
export type PageGetterType = {
  session: anyObject
  rootPath: string
  pathname: string
  query?: anyObject
  dynamicRoutingParams?: anyObject
  roles?: any[]
}
