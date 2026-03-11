import { CleansePathSource, PageGetterType } from '../path-title-constsnts'
import { getScopes } from '../scope-lib/getScopes'

export const kids_PAGES = (props: PageGetterType) => {
  const { roles, query, session, rootPath, pathname } = props

  const { login } = getScopes(session, { query, roles })

  const loginPaths = [
    { tabId: '', label: 'ホーム', exclusiveTo: !!login },
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
