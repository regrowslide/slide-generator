'use client'

import React, { useEffect, useState, useMemo, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  RefreshCw,
  Building2,
  FolderTree,
  FileText,
  Scale,
  MessageSquare,
  Box,
  ChevronRight,
  Database,
  Layers,
  GitBranch,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
  Check,
  Filter,
  BarChart3,
} from 'lucide-react'

import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card'
import { Badge } from '@shadcn/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shadcn/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shadcn/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shadcn/ui/table'
import { Button } from '@shadcn/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shadcn/ui/dialog'
import { Checkbox } from '@shadcn/ui/checkbox'
import { Label } from '@shadcn/ui/label'

import {
  getClientsForViewer,
  getClientFullData,
  type ClientOption,
  type ClientFullData,
} from '../../../_actions/debug-viewer-actions'

// ステータスバッジの色
const statusColors: Record<string, 'success' | 'warning' | 'destructive' | 'gray'> = {
  pending: 'gray',
  analyzing: 'warning',
  completed: 'success',
  error: 'destructive',
}

// ステータスアイコン
const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'analyzing':
      return <Clock className="h-4 w-4 text-yellow-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-400" />
  }
}

// クリック可能なテキスト（モーダル表示用）
const ClickableText = ({
  text,
  maxLength = 50,
  onClick,
}: {
  text: string
  maxLength?: number
  onClick: () => void
}) => {
  const truncated = text.length > maxLength ? text.slice(0, maxLength) + '...' : text
  const isTruncated = text.length > maxLength

  return (
    <span
      onClick={isTruncated ? onClick : undefined}
      className={isTruncated ? 'cursor-pointer hover:text-blue-600 hover:underline' : ''}
      title={isTruncated ? 'クリックで全文表示' : undefined}
    >
      {truncated}
    </span>
  )
}

// JSONコピーボタン
const CopyJsonButton = ({
  data,
  label,
}: {
  data: unknown
  label: string
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('コピー失敗:', err)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-6 px-2"
      title={`${label}をJSONでコピー`}
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  )
}

// メインページコンポーネント（内部）
const ClientDataViewerContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [clients, setClients] = useState<ClientOption[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [clientData, setClientData] = useState<ClientFullData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // モーダル
  const [modalContent, setModalContent] = useState<{
    title: string
    content: string
  } | null>(null)

  // フィルター
  const [showArchived, setShowArchived] = useState(true)
  const [modifiedOnly, setModifiedOnly] = useState(false)

  // URLパラメータからクライアントIDを取得
  const clientIdParam = searchParams?.get('clientId') ?? null

  // クライアント一覧を取得
  useEffect(() => {
    const fetchClients = async () => {
      const result = await getClientsForViewer()
      if (result.success && result.data) {
        setClients(result.data)
      }
    }
    fetchClients()
  }, [])

  // URLパラメータが変更されたらデータを取得
  useEffect(() => {
    if (clientIdParam && clients.length > 0) {
      const clientExists = clients.some((c) => c.id.toString() === clientIdParam)
      if (clientExists && clientIdParam !== selectedClientId) {
        setSelectedClientId(clientIdParam)
        fetchClientData(clientIdParam)
      }
    }
  }, [clientIdParam, clients])

  // データ取得関数
  const fetchClientData = async (id: string) => {
    setLoading(true)
    setError(null)

    const result = await getClientFullData(parseInt(id))
    if (result.success && result.data) {
      setClientData(result.data)
    } else {
      setError(result.error || 'データ取得に失敗しました')
      setClientData(null)
    }
    setLoading(false)
  }

  // クライアント選択時
  const handleClientChange = (value: string) => {
    setSelectedClientId(value)
    router.push(`?clientId=${value}`)
    if (value) {
      fetchClientData(value)
    } else {
      setClientData(null)
    }
  }

  // リロードボタン
  const handleReload = () => {
    if (selectedClientId) {
      fetchClientData(selectedClientId)
    }
  }

  // 全データをJSONでコピー
  const handleCopyAllData = async () => {
    if (!clientData) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(clientData, null, 2))
    } catch (err) {
      console.error('コピー失敗:', err)
    }
  }

  // 統計データ計算
  const stats = useMemo(() => {
    if (!clientData) return null

    const allSessions = clientData.analysisBoxes.flatMap((box) => box.sessions)
    const allRecords = allSessions.flatMap((s) => s.records)
    const modifiedRecords = allRecords.filter((r) => r.isModified)

    const sessionStatusCounts = {
      pending: allSessions.filter((s) => s.status === 'pending').length,
      analyzing: allSessions.filter((s) => s.status === 'analyzing').length,
      completed: allSessions.filter((s) => s.status === 'completed').length,
      error: allSessions.filter((s) => s.status === 'error').length,
    }

    const modificationRate =
      clientData.counts.totalRecords > 0
        ? Math.round((modifiedRecords.length / clientData.counts.totalRecords) * 100)
        : 0

    return {
      modifiedRecords: modifiedRecords.length,
      modificationRate,
      sessionStatusCounts,
    }
  }, [clientData])

  // フィルター適用
  const filteredCorrections = useMemo(() => {
    if (!clientData) return []
    return showArchived
      ? clientData.corrections
      : clientData.corrections.filter((c) => !c.archived)
  }, [clientData, showArchived])

  // モーダルを開く
  const openModal = useCallback((title: string, content: string) => {
    setModalContent({ title, content })
  }, [])

  return (
    <C_Stack className="min-h-screen gap-4 bg-gray-50 p-4">
      {/* ヘッダーカード */}
      <Card>
        <CardHeader className="pb-2">
          <R_Stack className="items-center justify-between">
            <R_Stack className="items-center gap-2">
              <Database className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-xl">クライアントデータビューア</CardTitle>
              <Badge color="purple">DEBUG</Badge>
            </R_Stack>
            <R_Stack className="items-center gap-2">
              <Select value={selectedClientId} onValueChange={handleClientChange}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="クライアントを選択..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name} ({client.clientId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleReload}
                disabled={!selectedClientId || loading}
                title="リロード"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              {clientData && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyAllData}
                  title="全データをJSONでコピー"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </R_Stack>
          </R_Stack>
        </CardHeader>
      </Card>

      {/* エラー表示 */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* ローディング */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">データを読み込み中...</span>
          </CardContent>
        </Card>
      )}

      {/* データ表示 */}
      {clientData && !loading && (
        <>
          {/* サマリーカード */}
          <Card>
            <CardHeader className="pb-2">
              <R_Stack className="items-center gap-4">
                <Building2 className="h-6 w-6 text-gray-600" />
                <C_Stack className="gap-1">
                  <span className="text-lg font-semibold">{clientData.client.name}</span>
                  <span className="text-sm text-gray-500">
                    ID: {clientData.client.clientId}
                  </span>
                </C_Stack>
                {clientData.industry && (
                  <Badge color="blue">{clientData.industry.name}</Badge>
                )}
              </R_Stack>
            </CardHeader>
            <CardContent>
              <C_Stack className="gap-3">
                {/* カウントバッジ */}
                <R_Stack className="flex-wrap gap-2">
                  <Badge color="gray">ステージ: {clientData.counts.stages}</Badge>
                  <Badge color="gray">修正: {clientData.counts.corrections}</Badge>
                  <Badge color="gray">ルール: {clientData.counts.rules}</Badge>
                  <Badge color="gray">Voice: {clientData.counts.voices}</Badge>
                  <Badge color="blue">分析BOX: {clientData.counts.analysisBoxes}</Badge>
                  <Badge color="blue">SESSION: {clientData.counts.totalSessions}</Badge>
                  <Badge color="green">レコード: {clientData.counts.totalRecords}</Badge>
                </R_Stack>

                {/* 統計情報 */}
                {stats && clientData.counts.totalRecords > 0 && (
                  <R_Stack className="items-center gap-4 rounded-lg bg-gray-100 p-3">
                    <BarChart3 className="h-5 w-5 text-gray-500" />
                    <R_Stack className="flex-wrap gap-4 text-sm">
                      <span>
                        修正率:{' '}
                        <strong className="text-blue-600">{stats.modificationRate}%</strong>
                        <span className="text-gray-500">
                          {' '}
                          ({stats.modifiedRecords} / {clientData.counts.totalRecords})
                        </span>
                      </span>
                      <span className="text-gray-300">|</span>
                      <R_Stack className="gap-2">
                        <span>SESSION状態:</span>
                        {stats.sessionStatusCounts.completed > 0 && (
                          <Badge color="success" size="sm">
                            完了 {stats.sessionStatusCounts.completed}
                          </Badge>
                        )}
                        {stats.sessionStatusCounts.pending > 0 && (
                          <Badge color="gray" size="sm">
                            待機 {stats.sessionStatusCounts.pending}
                          </Badge>
                        )}
                        {stats.sessionStatusCounts.analyzing > 0 && (
                          <Badge color="warning" size="sm">
                            分析中 {stats.sessionStatusCounts.analyzing}
                          </Badge>
                        )}
                        {stats.sessionStatusCounts.error > 0 && (
                          <Badge color="destructive" size="sm">
                            エラー {stats.sessionStatusCounts.error}
                          </Badge>
                        )}
                      </R_Stack>
                    </R_Stack>
                  </R_Stack>
                )}
              </C_Stack>
            </CardContent>
          </Card>

          {/* 階層ツリー（Accordion） */}
          <Accordion type="multiple" className="space-y-2">
            {/* 業種セクション */}
            {clientData.industry && (
              <AccordionItem value="industry" className="rounded-lg border bg-white">
                <AccordionTrigger className="px-4">
                  <R_Stack className="items-center gap-2">
                    <FolderTree className="h-5 w-5 text-purple-600" />
                    <span>業種: {clientData.industry.name}</span>
                    <Badge color="purple" size="sm">
                      {clientData.industry.generalCategories.length} 一般カテゴリ
                    </Badge>
                    <CopyJsonButton data={clientData.industry} label="業種データ" />
                  </R_Stack>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <Accordion type="multiple" className="ml-4">
                    {clientData.industry.generalCategories.map((gc) => (
                      <AccordionItem
                        key={gc.id}
                        value={`gc-${gc.id}`}
                        className="border-l-2 border-purple-200 pl-4"
                      >
                        <AccordionTrigger className="py-2">
                          <R_Stack className="items-center gap-2">
                            <ChevronRight className="h-4 w-4" />
                            <span className="font-medium">{gc.name}</span>
                            <Badge color="gray" size="sm">
                              {gc.categories.length} カテゴリ
                            </Badge>
                          </R_Stack>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2 pl-6">
                          <C_Stack className="gap-1">
                            {gc.categories.map((cat) => (
                              <R_Stack key={cat.id} className="items-center gap-2 text-sm">
                                <span
                                  className={cat.enabled ? '' : 'text-gray-400 line-through'}
                                >
                                  {cat.name}
                                </span>
                                {cat.description && (
                                  <span className="text-xs text-gray-400">
                                    - {cat.description}
                                  </span>
                                )}
                              </R_Stack>
                            ))}
                          </C_Stack>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* ステージマスタ */}
            <AccordionItem value="stages" className="rounded-lg border bg-white">
              <AccordionTrigger className="px-4">
                <R_Stack className="items-center gap-2">
                  <Layers className="h-5 w-5 text-orange-600" />
                  <span>ステージマスタ</span>
                  <Badge color="orange" size="sm">
                    {clientData.stages.length} 件
                  </Badge>
                  <CopyJsonButton data={clientData.stages} label="ステージ" />
                </R_Stack>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {clientData.stages.length === 0 ? (
                  <p className="text-gray-500">ステージが登録されていません</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>順序</TableHead>
                        <TableHead>名前</TableHead>
                        <TableHead>説明</TableHead>
                        <TableHead>有効</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientData.stages.map((stage) => (
                        <TableRow key={stage.id}>
                          <TableCell>{stage.sortOrder}</TableCell>
                          <TableCell>{stage.name}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {stage.description || '-'}
                          </TableCell>
                          <TableCell>
                            {stage.enabled ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* 修正データペア */}
            <AccordionItem value="corrections" className="rounded-lg border bg-white">
              <AccordionTrigger className="px-4">
                <R_Stack className="items-center gap-2">
                  <GitBranch className="h-5 w-5 text-red-600" />
                  <span>修正データペア</span>
                  <Badge color="red" size="sm">
                    {clientData.counts.corrections} 件
                  </Badge>
                  {clientData.corrections.length < clientData.counts.corrections && (
                    <span className="text-xs text-gray-400">
                      (表示: {filteredCorrections.length}件)
                    </span>
                  )}
                  <CopyJsonButton data={filteredCorrections} label="修正データ" />
                </R_Stack>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {/* フィルター */}
                <R_Stack className="mb-3 items-center gap-4 rounded bg-gray-50 p-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <R_Stack className="items-center gap-2">
                    <Checkbox
                      id="showArchived"
                      checked={showArchived}
                      onCheckedChange={(v) => setShowArchived(!!v)}
                    />
                    <Label htmlFor="showArchived" className="text-sm">
                      アーカイブ済みを表示
                    </Label>
                  </R_Stack>
                </R_Stack>

                {filteredCorrections.length === 0 ? (
                  <p className="text-gray-500">修正データがありません</p>
                ) : (
                  <div className="max-h-[400px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">原文</TableHead>
                          <TableHead>修正前</TableHead>
                          <TableHead>修正後</TableHead>
                          <TableHead>アーカイブ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCorrections.map((corr) => (
                          <TableRow key={corr.id}>
                            <TableCell className="max-w-[200px] text-sm">
                              <ClickableText
                                text={corr.rawSegment}
                                maxLength={30}
                                onClick={() => openModal('原文', corr.rawSegment)}
                              />
                            </TableCell>
                            <TableCell className="text-sm">
                              <C_Stack className="gap-0.5">
                                <span className="text-gray-500">
                                  {corr.originalGeneralCategory || '-'}
                                </span>
                                <span>{corr.originalCategory || '-'}</span>
                                <Badge color="gray" size="sm">
                                  {corr.originalSentiment || '-'}
                                </Badge>
                              </C_Stack>
                            </TableCell>
                            <TableCell className="text-sm">
                              <C_Stack className="gap-0.5">
                                <span className="text-gray-500">
                                  {corr.correctGeneralCategory || '-'}
                                </span>
                                <span className="font-medium">{corr.correctCategory}</span>
                                <Badge color="blue" size="sm">
                                  {corr.correctSentiment}
                                </Badge>
                              </C_Stack>
                            </TableCell>
                            <TableCell>
                              {corr.archived ? (
                                <Badge color="gray" size="sm">
                                  アーカイブ済
                                </Badge>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* ルール一覧 */}
            <AccordionItem value="rules" className="rounded-lg border bg-white">
              <AccordionTrigger className="px-4">
                <R_Stack className="items-center gap-2">
                  <Scale className="h-5 w-5 text-green-600" />
                  <span>ルール一覧</span>
                  <Badge color="green" size="sm">
                    {clientData.rules.length} 件
                  </Badge>
                  <CopyJsonButton data={clientData.rules} label="ルール" />
                </R_Stack>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {clientData.rules.length === 0 ? (
                  <p className="text-gray-500">ルールがありません</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>対象カテゴリ</TableHead>
                        <TableHead>ルール内容</TableHead>
                        <TableHead>優先度</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientData.rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.targetCategory}</TableCell>
                          <TableCell className="max-w-[400px] text-sm">
                            <ClickableText
                              text={rule.ruleDescription}
                              maxLength={80}
                              onClick={() => openModal('ルール内容', rule.ruleDescription)}
                            />
                          </TableCell>
                          <TableCell>
                            <Badge
                              color={
                                rule.priority === 'High'
                                  ? 'red'
                                  : rule.priority === 'Medium'
                                    ? 'orange'
                                    : 'gray'
                              }
                              size="sm"
                            >
                              {rule.priority}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* 顧客の声 */}
            <AccordionItem value="voices" className="rounded-lg border bg-white">
              <AccordionTrigger className="px-4">
                <R_Stack className="items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span>顧客の声</span>
                  <Badge color="blue" size="sm">
                    {clientData.counts.voices} 件
                  </Badge>
                  {clientData.voices.length < clientData.counts.voices && (
                    <span className="text-xs text-gray-400">
                      (表示: {clientData.voices.length}件)
                    </span>
                  )}
                  <CopyJsonButton data={clientData.voices} label="顧客の声" />
                </R_Stack>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {clientData.voices.length === 0 ? (
                  <p className="text-gray-500">顧客の声がありません</p>
                ) : (
                  <div className="max-h-[400px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Voice ID</TableHead>
                          <TableHead>テキスト</TableHead>
                          <TableHead>処理日時</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientData.voices.map((voice) => (
                          <TableRow key={voice.id}>
                            <TableCell className="font-mono text-sm">{voice.voiceId}</TableCell>
                            <TableCell className="max-w-[400px] text-sm">
                              <ClickableText
                                text={voice.rawText}
                                maxLength={60}
                                onClick={() => openModal('顧客の声', voice.rawText)}
                              />
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {voice.processedAt
                                ? new Date(voice.processedAt).toLocaleString('ja-JP')
                                : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* 分析BOX */}
            <AccordionItem value="analysisBoxes" className="rounded-lg border bg-white">
              <AccordionTrigger className="px-4">
                <R_Stack className="items-center gap-2">
                  <Box className="h-5 w-5 text-indigo-600" />
                  <span>分析BOX</span>
                  <Badge color="purple" size="sm">
                    {clientData.counts.analysisBoxes} BOX
                  </Badge>
                  <Badge color="blue" size="sm">
                    {clientData.counts.totalSessions} SESSION
                  </Badge>
                  <Badge color="green" size="sm">
                    {clientData.counts.totalRecords} Record
                  </Badge>
                  <CopyJsonButton data={clientData.analysisBoxes} label="分析BOX" />
                </R_Stack>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {/* レコードフィルター */}
                <R_Stack className="mb-3 items-center gap-4 rounded bg-gray-50 p-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <R_Stack className="items-center gap-2">
                    <Checkbox
                      id="modifiedOnly"
                      checked={modifiedOnly}
                      onCheckedChange={(v) => setModifiedOnly(!!v)}
                    />
                    <Label htmlFor="modifiedOnly" className="text-sm">
                      修正済みのみ表示
                    </Label>
                  </R_Stack>
                </R_Stack>

                {clientData.analysisBoxes.length === 0 ? (
                  <p className="text-gray-500">分析BOXがありません</p>
                ) : (
                  <Accordion type="multiple" className="space-y-2">
                    {clientData.analysisBoxes.map((box) => (
                      <AccordionItem
                        key={box.id}
                        value={`box-${box.id}`}
                        className="rounded border border-indigo-200 bg-indigo-50/30"
                      >
                        <AccordionTrigger className="px-4 py-2">
                          <R_Stack className="items-center gap-2">
                            <Box className="h-4 w-4 text-indigo-500" />
                            <span className="font-medium">{box.name}</span>
                            <Badge color="gray" size="sm">
                              {box.sessions.length} SESSION
                            </Badge>
                            <Link
                              href={`/hakobun/analysis-box/${box.id}`}
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-500 hover:text-blue-700"
                              title="BOX詳細ページを開く"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </R_Stack>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          {box.description && (
                            <p className="mb-2 text-sm text-gray-500">{box.description}</p>
                          )}
                          <Accordion type="multiple" className="space-y-1">
                            {box.sessions.map((session) => {
                              const filteredRecords = modifiedOnly
                                ? session.records.filter((r) => r.isModified)
                                : session.records
                              return (
                                <AccordionItem
                                  key={session.id}
                                  value={`session-${session.id}`}
                                  className="rounded border border-blue-200 bg-white"
                                >
                                  <AccordionTrigger className="px-3 py-1.5">
                                    <R_Stack className="items-center gap-2">
                                      <StatusIcon status={session.status} />
                                      <span>{session.name}</span>
                                      <Badge
                                        color={statusColors[session.status] || 'gray'}
                                        size="sm"
                                      >
                                        {session.status}
                                      </Badge>
                                      <Badge color="gray" size="sm">
                                        {session._count.records} Record
                                      </Badge>
                                      {modifiedOnly && (
                                        <span className="text-xs text-gray-400">
                                          (表示: {filteredRecords.length})
                                        </span>
                                      )}
                                      <Link
                                        href={`/hakobun/analysis-box/${box.id}/session/${session.id}`}
                                        target="_blank"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-blue-500 hover:text-blue-700"
                                        title="SESSION詳細ページを開く"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </Link>
                                    </R_Stack>
                                  </AccordionTrigger>
                                  <AccordionContent className="px-3 pb-3">
                                    {filteredRecords.length === 0 ? (
                                      <p className="text-sm text-gray-500">
                                        {modifiedOnly
                                          ? '修正済みレコードがありません'
                                          : 'レコードがありません'}
                                      </p>
                                    ) : (
                                      <div className="max-h-[300px] overflow-auto">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead className="w-[50px]">ID</TableHead>
                                              <TableHead className="w-[200px]">原文</TableHead>
                                              <TableHead>分析結果</TableHead>
                                              <TableHead>フィードバック</TableHead>
                                              <TableHead className="w-[60px]">状態</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {filteredRecords.map((record) => (
                                              <TableRow
                                                key={record.id}
                                                className={
                                                  !record.isEnabled
                                                    ? 'bg-gray-100 opacity-50'
                                                    : ''
                                                }
                                              >
                                                <TableCell className="font-mono text-xs">
                                                  {record.id}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] text-xs">
                                                  <ClickableText
                                                    text={record.rawText}
                                                    maxLength={30}
                                                    onClick={() =>
                                                      openModal('原文', record.rawText)
                                                    }
                                                  />
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                  <C_Stack className="gap-0.5">
                                                    <span className="text-gray-500">
                                                      {record.analysisGeneralCategory || '-'}
                                                    </span>
                                                    <span>{record.analysisCategory || '-'}</span>
                                                    {record.analysisSentiment && (
                                                      <Badge color="gray" size="sm">
                                                        {record.analysisSentiment}
                                                      </Badge>
                                                    )}
                                                  </C_Stack>
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                  {record.isModified ? (
                                                    <C_Stack className="gap-0.5">
                                                      <span className="text-gray-500">
                                                        {record.feedbackGeneralCategory || '-'}
                                                      </span>
                                                      <span className="font-medium text-blue-600">
                                                        {record.feedbackCategory || '-'}
                                                      </span>
                                                      {record.feedbackSentiment && (
                                                        <Badge color="blue" size="sm">
                                                          {record.feedbackSentiment}
                                                        </Badge>
                                                      )}
                                                    </C_Stack>
                                                  ) : (
                                                    <span className="text-gray-400">未修正</span>
                                                  )}
                                                </TableCell>
                                                <TableCell>
                                                  <R_Stack className="gap-1">
                                                    {record.isModified && (
                                                      <Badge color="orange" size="sm">
                                                        修正
                                                      </Badge>
                                                    )}
                                                    {!record.isEnabled && (
                                                      <Badge color="gray" size="sm">
                                                        無効
                                                      </Badge>
                                                    )}
                                                  </R_Stack>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    )}
                                  </AccordionContent>
                                </AccordionItem>
                              )
                            })}
                          </Accordion>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* クライアント詳細情報 */}
          <Card>
            <CardHeader className="pb-2">
              <R_Stack className="items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <span className="font-medium">クライアント詳細</span>
                <CopyJsonButton data={clientData.client} label="クライアント情報" />
              </R_Stack>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">作成日時:</span>
                  <span className="ml-2">
                    {new Date(clientData.client.createdAt).toLocaleString('ja-JP')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">更新日時:</span>
                  <span className="ml-2">
                    {clientData.client.updatedAt
                      ? new Date(clientData.client.updatedAt).toLocaleString('ja-JP')
                      : '-'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">入力データ説明:</span>
                  <span className="ml-2">{clientData.client.inputDataExplain || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">分析期間開始:</span>
                  <span className="ml-2">
                    {clientData.client.analysisStartDate
                      ? new Date(clientData.client.analysisStartDate).toLocaleDateString('ja-JP')
                      : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">分析期間終了:</span>
                  <span className="ml-2">
                    {clientData.client.analysisEndDate
                      ? new Date(clientData.client.analysisEndDate).toLocaleDateString('ja-JP')
                      : '-'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* 未選択時 */}
      {!selectedClientId && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-16 w-16 text-gray-300" />
            <p className="mt-4 text-gray-500">クライアントを選択してデータを表示</p>
          </CardContent>
        </Card>
      )}

      {/* 全文表示モーダル */}
      <Dialog open={!!modalContent} onOpenChange={() => setModalContent(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-auto">
          <DialogHeader>
            <DialogTitle>{modalContent?.title}</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap break-words rounded bg-gray-50 p-4 text-sm">
            {modalContent?.content}
          </div>
        </DialogContent>
      </Dialog>
    </C_Stack>
  )
}

// メインページコンポーネント（Suspenseでラップ）
export default function ClientDataViewerPage() {
  return (
    <Suspense
      fallback={
        <C_Stack className="min-h-screen items-center justify-center bg-gray-50">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="mt-2 text-gray-600">読み込み中...</span>
        </C_Stack>
      }
    >
      <ClientDataViewerContent />
    </Suspense>
  )
}
