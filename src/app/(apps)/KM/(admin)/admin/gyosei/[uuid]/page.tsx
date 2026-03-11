import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getGyoseiSessionDetail } from '../_actions'

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-600', label: '下書き' },
  analyzing: { bg: 'bg-blue-100', text: 'text-blue-700', label: '分析中' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '完了' },
  error: { bg: 'bg-red-100', text: 'text-red-700', label: 'エラー' },
}

const GRANT_STATUS_LABEL: Record<string, string> = {
  'not-applied': '未申請',
  'applied': '申請済み',
  'decided': '交付決定済み',
}

const FILE_TYPE_LABEL: Record<string, string> = {
  plan: '計画書',
  guidelines: '公募要領',
  guide: '手引き',
}

const PRIORITY_LABEL: Record<string, { label: string; color: string }> = {
  high: { label: '高', color: 'text-red-600 bg-red-50' },
  medium: { label: '中', color: 'text-yellow-600 bg-yellow-50' },
  low: { label: '低', color: 'text-green-600 bg-green-50' },
}

const CATEGORY_COLORS: Record<string, string> = {
  '交付申請': 'bg-blue-100 text-blue-700',
  '経費管理': 'bg-amber-100 text-amber-700',
  '中間報告': 'bg-violet-100 text-violet-700',
  '実績報告': 'bg-emerald-100 text-emerald-700',
  'その他': 'bg-gray-100 text-gray-600',
}

export default async function GyoseiDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  const session = await getGyoseiSessionDetail(uuid)

  if (!session) return notFound()

  const badge = STATUS_BADGE[session.status] || STATUS_BADGE.draft

  return (
    <div className="p-6 max-w-5xl">
      {/* 戻るリンク */}
      <Link href="/admin/gyosei" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
        ← セッション一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">セッション詳細</h1>

      {/* セッション情報 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">セッション情報</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">UUID:</span>
            <span className="ml-2 text-gray-700 font-mono text-xs">{session.uuid}</span>
          </div>
          <div>
            <span className="text-gray-400">ステータス:</span>
            <span className={`ml-2 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
          </div>
          <div>
            <span className="text-gray-400">作成日時:</span>
            <span className="ml-2 text-gray-700">
              {new Date(session.createdAt).toLocaleString('ja-JP')}
            </span>
          </div>
          <div>
            <span className="text-gray-400">更新日時:</span>
            <span className="ml-2 text-gray-700">
              {session.updatedAt ? new Date(session.updatedAt).toLocaleString('ja-JP') : '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">メールアドレス:</span>
            <span className="ml-2 text-gray-700">{session.email || '-'}</span>
          </div>
        </div>
      </div>

      {/* STEP3入力情報 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">採択・交付情報</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">交付申請状況:</span>
            <span className="ml-2 text-gray-700">
              {session.grantStatus ? GRANT_STATUS_LABEL[session.grantStatus] || session.grantStatus : '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">採択日:</span>
            <span className="ml-2 text-gray-700">{session.adoptionDate || '-'}</span>
          </div>
          <div>
            <span className="text-gray-400">交付決定日:</span>
            <span className="ml-2 text-gray-700">{session.grantDecisionDate || '-'}</span>
          </div>
        </div>
      </div>

      {/* ファイル一覧 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          アップロードファイル（{session.files.length}件）
        </h2>
        {session.files.length === 0 ? (
          <p className="text-sm text-gray-400">ファイルなし</p>
        ) : (
          <div className="space-y-2">
            {session.files.map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  {FILE_TYPE_LABEL[f.fileType] || f.fileType}
                </span>
                <a
                  href={f.blobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex-1 truncate"
                >
                  {f.fileName}
                </a>
                <span className="text-gray-400 text-xs">
                  {new Date(f.createdAt).toLocaleString('ja-JP')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI分析結果 */}
      {session.analysisResult && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">
            AI分析結果（タスク {session.analysisResult.tasks?.length ?? 0}件）
          </h2>

          {/* タスクテーブル */}
          {session.analysisResult.tasks && session.analysisResult.tasks.length > 0 && (
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 text-xs">優先度</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 text-xs">カテゴリ</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 text-xs">タスク</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 text-xs">期限</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 text-xs">担当</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 text-xs">備考</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {session.analysisResult.tasks.map((task, idx) => {
                    const p = PRIORITY_LABEL[task.priority] || PRIORITY_LABEL.medium
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${p.color}`}>
                            {p.label}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${CATEGORY_COLORS[task.category] || CATEGORY_COLORS['その他']}`}>
                            {task.category}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-800">{task.task}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{task.deadline}</td>
                        <td className="px-3 py-2 text-gray-600 text-xs">{task.responsible}</td>
                        <td className="px-3 py-2 text-gray-400 text-xs">{task.notes}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 実績報告ガイド */}
          {session.analysisResult.reportGuide && (
            <div>
              <h3 className="text-base font-bold text-gray-700 mb-2">実績報告ガイド</h3>
              <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                {session.analysisResult.reportGuide}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
