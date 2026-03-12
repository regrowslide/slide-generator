'use client'

import {useState, useEffect, useCallback} from 'react'
import {Search, LogOut} from 'lucide-react'
import {Card, CardContent} from '@shadcn/ui/card'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@shadcn/ui/table'
import {Input} from '@shadcn/ui/input'
import {Button} from '@cm/components/styles/common-components/Button'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {getSessions, revokeUserSessions} from '../../_actions/session-actions'
import type {AdminSessionRow} from '../../lib/types'

const SessionManagementTab = () => {
  const {toggleLoad} = useGlobal()
  const [sessions, setSessions] = useState<AdminSessionRow[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const fetchSessions = useCallback(async () => {
    const result = await getSessions({search: search || undefined, page})
    setSessions(result.sessions as AdminSessionRow[])
    setTotal(result.total)
    setTotalPages(result.totalPages)
  }, [search, page])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleSearch = () => {
    setPage(1)
    fetchSessions()
  }

  const handleRevokeSessions = async (userId: string, userName: string) => {
    if (!window.confirm(`「${userName}」の全セッションを削除しますか？\nユーザーは強制ログアウトされます。`)) return
    await toggleLoad(async () => {
      await revokeUserSessions(userId)
      await fetchSessions()
    }, {refresh: false})
  }

  const formatJst = (date: Date | string | null) => {
    if (!date) return '-'
    return formatDate(new Date(date), 'YYYY/MM/DD HH:mm')
  }

  const isExpired = (expiresAt: Date | string) => {
    return new Date(expiresAt) < new Date()
  }

  const shortenUserAgent = (ua: string | null) => {
    if (!ua) return '-'
    if (ua.length <= 50) return ua
    return ua.slice(0, 50) + '...'
  }

  return (
    <div className="space-y-4">
      {/* 検索 */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-500 mb-1 block">ユーザー名検索</label>
              <div className="flex gap-2">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="名前またはメールで検索"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button size="sm" onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 注記 */}
      <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
        セッション削除後、最大5分でログアウト反映されます（Cookie caching）
      </p>

      {/* 件数 */}
      <div className="text-sm text-gray-500">{total}件のセッション</div>

      {/* テーブル */}
      <Card>
        <CardContent className="pt-4">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ユーザー</TableHead>
                  <TableHead>IPアドレス</TableHead>
                  <TableHead>UserAgent</TableHead>
                  <TableHead>なりすまし</TableHead>
                  <TableHead>ログイン日時</TableHead>
                  <TableHead>有効期限</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                      セッションがありません
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{s.User.name}</div>
                          <div className="text-xs text-gray-400">{s.User.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{s.ipAddress ?? '-'}</TableCell>
                      <TableCell className="text-sm max-w-[200px]" title={s.userAgent ?? ''}>
                        {shortenUserAgent(s.userAgent)}
                      </TableCell>
                      <TableCell>
                        {s.impersonatedBy && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            なりすまし
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{formatJst(s.createdAt)}</TableCell>
                      <TableCell>
                        <span
                          className={`text-sm whitespace-nowrap ${isExpired(s.expiresAt) ? 'text-red-500 font-medium' : ''}`}
                        >
                          {formatJst(s.expiresAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          color="red"
                          onClick={() => handleRevokeSessions(s.userId, s.User.name)}
                        >
                          <LogOut className="w-3 h-3 mr-1" />
                          全削除
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button size="sm" color="gray" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            前へ
          </Button>
          <span className="px-3 py-1 text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <Button size="sm" color="gray" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            次へ
          </Button>
        </div>
      )}
    </div>
  )
}

export default SessionManagementTab
