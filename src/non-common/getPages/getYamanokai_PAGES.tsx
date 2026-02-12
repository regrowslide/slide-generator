import { Settings, Calendar, Users, Shield, Package } from 'lucide-react'
import IconLetter from '@cm/components/styles/common-components/IconLetter'

import { CleansePathSource } from 'src/non-common/path-title-constsnts'
import { PageGetterType } from 'src/non-common/path-title-constsnts'
import { getScopes } from 'src/non-common/scope-lib/getScopes'

export const yamanokai_PAGES = (props: PageGetterType) => {
  const { roles = [], session, rootPath, pathname, query } = props

  const scopes = getScopes(session, { query, roles })
  const { login, admin } = scopes
  const { isSystemAdmin, isCL, canEdit } = scopes.getYamanokaiScopes()

  // 一般会員メニュー（ログインユーザー）
  const loginPaths = [
    {
      tabId: 'events',
      label: <IconLetter {...{ Icon: Calendar }}>例会一覧</IconLetter>,
      ROOT: [rootPath],
      exclusiveTo: login,
    },
  ]

  // CLメニュー
  const clPaths = [
    {
      tabId: 'event-management',
      label: <IconLetter {...{ Icon: Settings }}>例会設定</IconLetter>,
      ROOT: [rootPath],
      exclusiveTo: canEdit,
    },
  ]

  // 管理者メニュー
  const adminPaths = [
    {
      tabId: '',
      label: <IconLetter {...{ Icon: Shield }}>管理者メニュー</IconLetter>,
      children: [
        {
          tabId: 'equipment-checklist',
          label: <IconLetter {...{ Icon: Package }}>装備表品目マスタ</IconLetter>,
        },
        {
          tabId: 'members',
          label: <IconLetter {...{ Icon: Users }}>会員管理</IconLetter>,
        },
        {
          tabId: 'roleMaster',
          label: <IconLetter {...{ Icon: Shield }}>権限管理</IconLetter>,
        },
      ],
    },
  ].map(item => ({
    ...item,
    exclusiveTo: isSystemAdmin,
    ROOT: [rootPath],
  }))

  const pathSource = [
    { tabId: 'top', label: 'トップ', hide: true, ROOT: [rootPath] },
    ...loginPaths,
    ...clPaths,
    ...adminPaths,
  ]

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
