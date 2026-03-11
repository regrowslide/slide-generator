import { getGyoseiSessions } from './_actions'
import GyoseiAdminCC from './GyoseiAdminCC'

export default async function GyoseiAdminPage() {
  const sessions = await getGyoseiSessions()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">AI行政書士君 II — セッション管理</h1>
      <GyoseiAdminCC sessions={sessions} />
    </div>
  )
}
