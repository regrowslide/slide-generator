import prisma from 'src/lib/prisma'
import {SettingsCC} from './SettingsCC'

// データ取得
const getInitialData = async () => {
  // 公開範囲設定を取得
  const publishSetting = await prisma.stPublishSetting.findFirst({
    orderBy: {id: 'desc'},
  })

  return {
    publishSetting,
  }
}

export default async function SettingsPage() {
  const {publishSetting} = await getInitialData()

  return (
    <div>
      <SettingsCC publishSetting={publishSetting} />
    </div>
  )
}

