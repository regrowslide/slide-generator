'use client'

import { useRouter } from 'next/navigation'

type SessionRow = {
  id: number
  uuid: string
  createdAt: string
  status: string
  grantStatus: string | null
  email: string | null
  fileCount: number
  taskCount: number
}

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

export default function GyoseiAdminCC({ sessions }: { sessions: SessionRow[] }) {
  const router = useRouter()

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs">作成日時</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs">ステータス</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs">交付申請状況</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs">ファイル数</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs">タスク数</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs">メール</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  セッションがありません
                </td>
              </tr>
            )}
            {sessions.map((s) => {
              const badge = STATUS_BADGE[s.status] || STATUS_BADGE.draft
              return (
                <tr
                  key={s.id}
                  onClick={() => router.push(`/admin/gyosei/${s.uuid}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {new Date(s.createdAt).toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {s.grantStatus ? GRANT_STATUS_LABEL[s.grantStatus] || s.grantStatus : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.fileCount}</td>
                  <td className="px-4 py-3 text-gray-600">{s.taskCount}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[200px]">
                    {s.email || '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
