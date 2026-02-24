import {CleansePathSource} from 'src/non-common/path-title-constsnts'
import type {PageGetterType} from 'src/non-common/path-title-constsnts'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

export const dental_PAGES = (props: PageGetterType) => {
  const {roles = [], session, rootPath, pathname, query} = props

  const scopes = getScopes(session, {query, roles})
  const {login} = scopes
  const {isSystemAdmin} = scopes.getDentalScopes()

  // ログインユーザーメニュー
  const loginPaths = [
    {
      tabId: '',
      label: 'ダッシュボード',
      ROOT: [rootPath],
      exclusiveTo: login,
    },
    {
      tabId: '',
      label: 'マスタ',
      ROOT: [rootPath],
      exclusiveTo: login,
      children: [
        {tabId: 'admin/clinic', label: 'クリニック設定'},
        {tabId: 'admin/facilities', label: '施設'},
        {tabId: 'admin/patients', label: '利用者'},
        {tabId: 'admin/staff', label: 'スタッフ'},
      ],
    },
    {
      tabId: 'schedule',
      label: '訪問計画スケジュール',
      ROOT: [rootPath],
      exclusiveTo: login,
    },
    {
      tabId: 'individual-input',
      label: '個別入力',
      ROOT: [rootPath],
      exclusiveTo: login,
    },
    {
      tabId: '',
      label: '文書管理',
      ROOT: [rootPath],
      exclusiveTo: login,
      children: [
        {tabId: 'document-create', label: '作成'},
        {tabId: 'document-list', label: '一覧'},
      ],
    },
    {
      tabId: '',
      label: 'レポート',
      ROOT: [rootPath],
      exclusiveTo: login,
      children: [
        {tabId: 'scoring-reference', label: '算定項目・点数一覧'},
        {tabId: 'scoring-ledger', label: '算定台帳'},
        {tabId: 'summary', label: '月次サマリー'},
        {tabId: 'batch-print', label: '一括印刷'},
      ],
    },
  ]

  // 管理者メニュー
  const adminPaths = [
    {
      tabId: '',
      label: '管理者メニュー',
      ROOT: [rootPath],
      exclusiveTo: isSystemAdmin,
      children: [{tabId: 'admin/clinics', label: 'クリニック一覧'}],
    },
  ]

  const pathSource = [{tabId: 'top', label: 'トップ', hide: true, ROOT: [rootPath]}, ...loginPaths, ...adminPaths]

  const {cleansedPathSource, navItems, breads, allPathsPattenrs} = CleansePathSource({
    rootPath,
    pathSource,
    pathname,
    session,
  })

  return {allPathsPattenrs, cleansedPathSource, navItems, breads}
}
