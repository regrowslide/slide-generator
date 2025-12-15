import prisma from 'src/lib/prisma'
import { SettingsCC } from './SettingsCC'
import { initServerComopnent } from 'src/non-common/serverSideFunction'

// データ取得
const getInitialData = async () => {
  // 公開範囲設定を取得
  const publishSetting = await prisma.stPublishSetting.findFirst({
    orderBy: { id: 'desc' },
  })

  return {
    publishSetting,
  }
}

export default async function SettingsPage(props) {
  const query = await props.searchParams

  // セッションとスコープを取得
  const { session, scopes: { getSanshoTouristScopes } } = await initServerComopnent({ query })
  const { isSystemAdmin } = getSanshoTouristScopes()

  // 管理者のみアクセス可能
  if (!isSystemAdmin) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">アクセス権限がありません</h2>
        <p className="text-gray-500">この設定画面は管理者のみがアクセスできます。</p>
      </div>
    )
  }

  const { publishSetting } = await getInitialData()

  return (
    <div>
      <SettingsCC publishSetting={publishSetting} />
    </div>
  )
}

