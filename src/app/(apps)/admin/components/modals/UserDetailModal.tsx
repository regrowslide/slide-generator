'use client'

import {useEffect, useState} from 'react'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@shadcn/ui/table'
import {Button} from '@cm/components/styles/common-components/Button'
import type {useModalReturn} from '@cm/components/utils/modal/useModal'
import type {AdminUserDetail} from '../../lib/types'
import {getUserDetail} from '../../_actions/user-actions'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

type Props = {
  modal: useModalReturn<string | null>
}

const UserDetailModal = ({modal}: Props) => {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const userId = modal.open

  useEffect(() => {
    if (!userId || typeof userId !== 'string') {
      setDetail(null)
      return
    }
    setLoading(true)
    getUserDetail(userId)
      .then((d) => setDetail(d as AdminUserDetail | null))
      .finally(() => setLoading(false))
  }, [userId])

  const formatJst = (date: Date | string | null) => {
    if (!date) return '-'
    return formatDate(new Date(date), 'YYYY/MM/DD HH:mm')
  }

  // UserAgentを短縮表示する
  const shortenUserAgent = (ua: string | null) => {
    if (!ua) return '-'
    if (ua.length <= 40) return ua
    return ua.slice(0, 40) + '...'
  }

  return (
    <modal.Modal title="ユーザー詳細">
      {loading && <p className="text-sm text-gray-500">読み込み中...</p>}
      {!loading && detail && (
        <div className="space-y-6">
          {/* 基本情報 */}
          <section>
            <h3 className="text-sm font-bold mb-2">基本情報</h3>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-gray-500">名前</dt>
              <dd>{detail.name}</dd>
              <dt className="text-gray-500">メール</dt>
              <dd>{detail.email ?? '-'}</dd>
              <dt className="text-gray-500">ロール</dt>
              <dd>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    detail.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {detail.role}
                </span>
              </dd>
              <dt className="text-gray-500">状態</dt>
              <dd>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    detail.banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {detail.banned ? 'BAN' : '有効'}
                </span>
              </dd>
              <dt className="text-gray-500">作成日</dt>
              <dd>{formatJst(detail.createdAt)}</dd>
            </dl>
          </section>

          {/* Account一覧 */}
          <section>
            <h3 className="text-sm font-bold mb-2">認証プロバイダ</h3>
            {detail.Account.length === 0 ? (
              <p className="text-sm text-gray-400">なし</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>プロバイダ</TableHead>
                    <TableHead>アカウントID</TableHead>
                    <TableHead>作成日</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.Account.map((acc) => (
                    <TableRow key={acc.id}>
                      <TableCell>
                        <ProviderBadge providerId={acc.providerId} />
                      </TableCell>
                      <TableCell className="text-sm">{acc.accountId}</TableCell>
                      <TableCell className="text-sm">{formatJst(acc.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>

          {/* 権限 */}
          {detail.UserRole.length > 0 && (
            <section>
              <h3 className="text-sm font-bold mb-2">アプリ権限</h3>
              <div className="flex flex-wrap gap-1">
                {detail.UserRole.map((ur) => (
                  <span
                    key={ur.id}
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: ur.RoleMaster.color ? `${ur.RoleMaster.color}20` : '#e5e7eb',
                      color: ur.RoleMaster.color ?? '#374151',
                    }}
                  >
                    {ur.RoleMaster.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 最近のログイン履歴 */}
          <section>
            <h3 className="text-sm font-bold mb-2">最近のログイン履歴</h3>
            {detail.Session.length === 0 ? (
              <p className="text-sm text-gray-400">なし</p>
            ) : (
              <div className="max-h-[200px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ログイン日時</TableHead>
                      <TableHead>IPアドレス</TableHead>
                      <TableHead>UserAgent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.Session.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-sm whitespace-nowrap">{formatJst(s.createdAt)}</TableCell>
                        <TableCell className="text-sm">{s.ipAddress ?? '-'}</TableCell>
                        <TableCell className="text-sm" title={s.userAgent ?? ''}>
                          {shortenUserAgent(s.userAgent)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </div>
      )}
      <div className="flex justify-end mt-4">
        <Button color="gray" onClick={() => modal.handleClose()}>
          閉じる
        </Button>
      </div>
    </modal.Modal>
  )
}

/** プロバイダバッジ */
const ProviderBadge = ({providerId}: {providerId: string}) => {
  const styles: Record<string, string> = {
    credential: 'bg-blue-100 text-blue-700',
    google: 'bg-red-100 text-red-700',
    line: 'bg-green-100 text-green-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[providerId] ?? 'bg-gray-100 text-gray-600'}`}>
      {providerId}
    </span>
  )
}

export default UserDetailModal
