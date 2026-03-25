import { CleansePathSource, PageGetterType } from '../path-title-constsnts'
import { getScopes } from '../scope-lib/getScopes'

export const regrow_PAGES = (props: PageGetterType) => {
  const { roles, query, session, rootPath, pathname } = props

  const { login, admin, getRegrowScopes } = getScopes(session, { query, roles })
  const { isAdmin, isManager } = getRegrowScopes()

  const loginPaths = [
    { tabId: '/report', label: 'MTG資料', exclusiveTo: !!login },
    { tabId: '/master', label: 'マスタ管理', exclusiveTo: !!(isAdmin || admin) },
    { tabId: '/manual', label: 'マニュアル', exclusiveTo: !!login },

  ].map((item) => ({
    ...item,
    ROOT: [rootPath],
  }))

  const pathSource = [...loginPaths]

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
}
