import { anyObject } from '@cm/types/utility-types'
import { JSX } from 'react'
import { getScopes } from 'src/non-common/scope-lib/getScopes'

import { tbm_PAGES } from 'src/non-common/getPages/getTbm_PAGES'

import { KM_PAGES } from 'src/non-common/getPages/KM_PAGES'

import { training_PAGES } from 'src/non-common/getPages/training_PAGES'

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
 * 教育系アプリ共通メニューの生成
 */
const getEduCommonMenus = ({
  isSchoolLeader,
  admin,
}: {
  isSchoolLeader: boolean
  admin: boolean
}): {
  appSelector: pathItemType
  config: pathItemType
} => {
  return {
    appSelector: {
      ROOT: ['edu'],
      tabId: '',
      label: 'アプリ',
      children: [
        { tabId: 'Grouping', label: 'Grouping' },
        { tabId: 'Colabo', label: 'Colabo' },
      ],
    },
    config: {
      tabId: '',
      ROOT: ['edu'],
      label: '各種設定',
      exclusiveTo: isSchoolLeader,
      children: [
        { tabId: 'school', label: '学校', exclusiveTo: admin },
        { tabId: 'teacher', label: '教員', exclusiveTo: isSchoolLeader },
        { tabId: 'classroom', label: 'クラス', exclusiveTo: isSchoolLeader },
        { tabId: 'student', label: '児童・生徒', exclusiveTo: isSchoolLeader },
        { tabId: 'subjectNameMaster', label: '教科', exclusiveTo: isSchoolLeader },
        { tabId: 'csv-import', label: 'CSV取り込み', exclusiveTo: isSchoolLeader },
      ],
    },
  }
}

/**
 * 各アプリケーションのページ設定取得関数を格納するオブジェクト
 */
export const PAGES: Record<string, PageGetterFunction> = {

  lifeos_PAGES: (props: PageGetterType) => {
    const { roles, query, session, rootPath, pathname } = props

    const { login, admin } = getScopes(session, { query, roles })

    const loginPaths = [
      {
        tabId: '',
        label: 'ダッシュボード',
        ROOT: [rootPath],
        exclusiveTo: !!login,
      },
      {
        tabId: 'categories',
        label: 'カテゴリ管理',
        ROOT: [rootPath],
        exclusiveTo: !!login,
      },
      {
        tabId: 'logs',
        label: 'ログ一覧',
        ROOT: [rootPath],
        exclusiveTo: !!login,
      },
      {
        tabId: 'chat',
        label: 'チャット',
        ROOT: [rootPath],
        exclusiveTo: !!login,
      },
    ]

    const adminPaths = []

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
  hakobun_PAGES: (props: PageGetterType) => {
    const { roles, query, session, rootPath, pathname } = props

    const { login, admin } = getScopes(session, { query, roles })

    const loginPaths = [
      {
        tabId: 'analysis-box',
        label: '分析BOX',
        ROOT: [rootPath],
        // exclusiveTo: !!login,
      },
      {
        tabId: '',
        label: 'マスタ管理',
        ROOT: [rootPath],
        // exclusiveTo: !!login,
        children: [
          { tabId: 'master/industries', label: '業種マスタ' },
          { tabId: 'master/clients', label: 'クライアント' },
          { tabId: 'master/settings', label: 'AI分析設定' },
        ],
      },
      // {
      //   tabId: 'batch',
      //   label: '一括分析（旧）',
      //   ROOT: [rootPath],
      //   // exclusiveTo: !!login,
      // },
    ]

    const adminPaths = []

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

  tbm_PAGES,
  KM_PAGES,
  training_PAGES,

  Colabo_PAGES: (props: PageGetterType) => {
    const { roles, session, rootPath, query, pathname, dynamicRoutingParams } = props

    const scopes = getScopes(session, { query, roles })
    const { isSchoolLeader } = scopes.getGroupieScopes()
    const { admin } = scopes
    const configROOTS = [rootPath]

    const { appSelector, config } = getEduCommonMenus({ isSchoolLeader, admin })
    const normalPaths: pathItemType[] = [
      //
      { ROOT: [rootPath], tabId: '', label: 'TOP', exclusiveTo: 'always' },
      appSelector,
      config,
    ]

    const adminPaths: pathItemType[] = [
      {
        tabId: 'admin',
        label: 'デバッグメニュー',
        link: {},
        exclusiveTo: true,
        children: [
          { tabId: 'game', label: '授業', link: {}, exclusiveTo: true },
          { tabId: 'slide', label: 'スライド', link: {}, exclusiveTo: true },
        ],
      },
    ].map(item => {
      return {
        ...item,
        ROOT: configROOTS,
        exclusiveTo: admin,
      }
    })

    const pathSource = [
      //
      ...normalPaths,
      ...adminPaths,
    ] as pathItemType[]

    const { cleansedPathSource, navItems, breads, allPathsPattenrs } = CleansePathSource({
      rootPath,
      pathSource,
      pathname,
      query,
      session,
      dynamicRoutingParams,
    })

    return {
      allPathsPattenrs,
      cleansedPathSource,
      navItems,
      breads,
    }
  },

  Grouping_PAGES: (props: PageGetterType) => {
    const { roles, session, rootPath, query, pathname, dynamicRoutingParams } = props

    const scopes = getScopes(session, { query, roles })

    const { admin } = scopes
    const { isSchoolLeader } = scopes.getGroupieScopes()

    const configROOTS = [rootPath]

    const pathSource: pathItemType[] = [
      {
        ROOT: [rootPath],
        tabId: '',
        label: 'アプリ',
        children: [
          { tabId: 'Grouping', label: 'Grouping' },
          { tabId: 'Colabo', label: 'Colabo' },
        ],
      },

      {
        ROOT: configROOTS,
        tabId: '',
        label: '各種設定',
        exclusiveTo: isSchoolLeader,
        children: [
          { tabId: 'school', label: '学校', exclusiveTo: admin },
          { tabId: 'teacher', label: '教員', exclusiveTo: isSchoolLeader },
          { tabId: 'classroom', label: 'クラス', exclusiveTo: isSchoolLeader },
          { tabId: 'student', label: '児童・生徒', exclusiveTo: isSchoolLeader },
          { tabId: 'subjectNameMaster', label: '教科', exclusiveTo: isSchoolLeader },
          { tabId: 'csv-import', label: 'CSV取り込み', exclusiveTo: isSchoolLeader },
        ],
      },
      { ROOT: [rootPath], tabId: 'public', label: '公開ページ', children: [{ tabId: 'enter', label: '児童・生徒用', link: {} }] },
      { ROOT: [rootPath, `admin`], tabId: 'dataManagement', label: 'データ抽出（管理者用）', exclusiveTo: admin },
    ]
    const { cleansedPathSource, navItems, breads, allPathsPattenrs } = CleansePathSource({
      rootPath,
      pathSource,
      pathname,
      query,
      session,
      dynamicRoutingParams,
    })

    return {
      allPathsPattenrs,
      cleansedPathSource,
      navItems,
      breads,
    }
  },

  keihi_PAGES: (props: PageGetterType) => {
    const { roles, query, session, rootPath, pathname } = props

    const { login, admin } = getScopes(session, { query, roles })

    const loginPaths = [
      {
        tabId: '',
        label: '経費管理',
        children: [
          { tabId: '/', label: '一覧', ROOT: [rootPath] },
          { tabId: 'new', label: '新規登録', ROOT: [rootPath] },
          { tabId: 'new/bulk', label: '一括登録', ROOT: [rootPath] },
        ],
      },
      {
        tabId: '',
        label: 'マスタ管理',
        children: [{ tabId: 'master', label: 'マスタ設定', ROOT: [rootPath] }],
      },
    ].map((item, i) => {
      return {
        ...item,
        ROOT: [rootPath],
        exclusiveTo: !!login,
      }
    })

    // const adminPaths = [
    //   {
    //     tabId: '',
    //     label: '管理者メニュー',
    //     children: [{tabId: 'admin', label: '管理者設定', ROOT: [rootPath]}],
    //   },
    // ].map((item, i) => {
    //   return {
    //     ...item,
    //     ROOT: [rootPath],
    //     exclusiveTo: true,
    //   }
    // })

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
