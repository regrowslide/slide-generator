/**
 * 追加ページコンポーネント（算定台帳・算定参照・日次報告・一括印刷）
 */
import React, {useState, useMemo} from 'react'
import {Button, Badge} from './ui-components'
import {getProcedureMaster, getScoringSections, findMasterById, DOCUMENT_TEMPLATES} from './constants'
import {getPatientName} from './helpers'
import type {
  Patient,
  Facility,
  VisitPlan,
  Examination,
  ScoringHistoryItem,
  SavedDocument,
  SavedDocumentEntry,
  ProcedureItemMaster,
  ScoringSection,
} from './types'

// =============================================================================
// 算定対象台帳（ScoringLedgerPage）
// =============================================================================

type ScoringLedgerPageProps = {
  scoringHistory: ScoringHistoryItem[]
  patients: Patient[]
}

export const ScoringLedgerPage = ({scoringHistory, patients}: ScoringLedgerPageProps) => {
  const today = new Date()
  const [filterMonth, setFilterMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  )
  const master = useMemo(() => getProcedureMaster(today.toISOString().split('T')[0]), [])

  // 月でフィルタした履歴
  const filteredHistories = useMemo(() => {
    if (!filterMonth) return scoringHistory
    return scoringHistory.filter(h => h.lastScoredAt.startsWith(filterMonth))
  }, [scoringHistory, filterMonth])

  // 患者別にグルーピング
  const patientGroups = useMemo(() => {
    const groups: Record<number, {patient: Patient; items: ScoringHistoryItem[]}> = {}
    filteredHistories.forEach(h => {
      if (!groups[h.patientId]) {
        const patient = patients.find(p => p.id === h.patientId)
        if (!patient) return
        groups[h.patientId] = {patient, items: []}
      }
      groups[h.patientId].items.push(h)
    })
    return Object.values(groups).sort((a, b) => a.patient.lastName.localeCompare(b.patient.lastName))
  }, [filteredHistories, patients])

  const totalPoints = filteredHistories.reduce((sum, h) => sum + h.points, 0)

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">算定対象台帳</h1>

      {/* フィルタ */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">対象月</label>
            <input
              type="month"
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-gray-500">合計点数</div>
            <div className="text-2xl font-bold text-emerald-600">{totalPoints.toLocaleString()} 点</div>
          </div>
        </div>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">対象患者数</div>
          <div className="text-xl font-bold">{patientGroups.length} 名</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">算定項目数</div>
          <div className="text-xl font-bold">{filteredHistories.length} 件</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">合計点数</div>
          <div className="text-xl font-bold text-emerald-600">{totalPoints.toLocaleString()} 点</div>
        </div>
      </div>

      {/* 患者別一覧 */}
      {patientGroups.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          <p className="text-lg mb-2">算定履歴がありません</p>
          <p className="text-sm">対象月を変更するか、診察を完了してください。</p>
        </div>
      ) : (
        patientGroups.map(({patient, items}) => {
          const patientTotal = items.reduce((sum, h) => sum + h.points, 0)
          return (
            <div key={patient.id} className="bg-white rounded-lg border border-gray-200 mb-4">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold">{getPatientName(patient)}</span>
                <span className="text-sm font-bold text-emerald-600">{patientTotal} 点</span>
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-2 py-1">算定項目</th>
                      <th className="text-right px-2 py-1 w-20">点数</th>
                      <th className="text-left px-2 py-1 w-28">最終算定日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(h => {
                      const masterItem = findMasterById(master, h.procedureId)
                      return (
                        <tr key={h.id} className="border-t border-gray-100">
                          <td className="px-2 py-1">{masterItem?.name || h.procedureId}</td>
                          <td className="px-2 py-1 text-right font-medium">{h.points} 点</td>
                          <td className="px-2 py-1 text-gray-500">{h.lastScoredAt}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

// =============================================================================
// 算定項目一覧（ScoringReferencePage）
// =============================================================================

export const ScoringReferencePage = () => {
  const today = new Date().toISOString().split('T')[0]
  const master = useMemo(() => getProcedureMaster(today), [])
  const sections = useMemo(() => getScoringSections(today), [])

  const getItemsForSection = (section: ScoringSection): ProcedureItemMaster[] => {
    return section.items.map(itemId => master.find(m => m.id === itemId)).filter((m): m is ProcedureItemMaster => !!m)
  }

  const getRelatedDocuments = (item: ProcedureItemMaster): string[] => {
    if (!item.documents) return []
    return item.documents.map(d => {
      const template = DOCUMENT_TEMPLATES[d.id]
      return template?.name || d.id
    })
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">算定項目一覧</h1>
      <p className="text-sm text-gray-500 mb-6">
        訪問歯科で算定可能な全項目の一覧です。セクション別にグルーピングされています。
      </p>

      {sections.map(section => {
        const items = getItemsForSection(section)
        if (items.length === 0) return null

        return (
          <div key={section.id} className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-base font-bold">{section.label}</h2>
            </div>
            <div className="p-4 space-y-4">
              {items.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{item.fullName || item.name}</h3>
                      {item.infoText && <p className="text-xs text-gray-500 mt-1">{item.infoText}</p>}
                    </div>
                    {item.defaultPoints && (
                      <span className="text-sm font-bold text-emerald-600 whitespace-nowrap ml-4">
                        {item.defaultPoints}点
                      </span>
                    )}
                  </div>

                  {/* サブアイテム */}
                  {item.subItems && item.subItems.length > 0 && (
                    <div className="mt-2">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left px-2 py-1">項目名</th>
                            <th className="text-right px-2 py-1 w-16">点数</th>
                            <th className="text-left px-2 py-1 w-32">条件</th>
                            <th className="text-left px-2 py-1 w-20">ロール</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.subItems.map(sub => (
                            <tr key={sub.id} className="border-t border-gray-100">
                              <td className="px-2 py-1">{sub.name}</td>
                              <td className="px-2 py-1 text-right font-medium">{sub.points}点</td>
                              <td className="px-2 py-1 text-gray-500">{sub.conditionLabel || '-'}</td>
                              <td className="px-2 py-1 text-gray-500">{sub.requiredRole || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 関連情報 */}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    {item.intervalMonths && <span>算定間隔: {item.intervalMonths}ヶ月</span>}
                    {item.monthlyLimit && <span>月上限: {item.monthlyLimit}回</span>}
                    {item.selectionMode && (
                      <span>選択: {item.selectionMode === 'single' ? '単一' : '複数'}</span>
                    )}
                  </div>

                  {/* 関連文書 */}
                  {getRelatedDocuments(item).length > 0 && (
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {getRelatedDocuments(item).map((docName, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {docName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// =============================================================================
// 日次報告（SummaryPage）
// =============================================================================

type SummaryPageProps = {
  visitPlans: VisitPlan[]
  examinations: Examination[]
  facilities: Facility[]
  patients: Patient[]
  documents: SavedDocument[]
}

export const SummaryPage = ({visitPlans, examinations, facilities, patients, documents}: SummaryPageProps) => {
  const [selectedDate, setSelectedDate] = useState('2026-01-18')

  // 選択日の訪問計画
  const dayPlans = useMemo(
    () => visitPlans.filter(vp => vp.visitDate === selectedDate),
    [visitPlans, selectedDate]
  )

  // 施設別にグルーピング
  const facilityGroups = useMemo(() => {
    return dayPlans.map(plan => {
      const facility = facilities.find(f => f.id === plan.facilityId)
      const planExams = examinations.filter(e => e.visitPlanId === plan.id)
      return {
        plan,
        facilityName: facility?.name || '不明',
        examinations: planExams.map(exam => {
          const patient = patients.find(p => p.id === exam.patientId)
          return {
            ...exam,
            patientName: patient ? getPatientName(patient) : '不明',
          }
        }),
      }
    })
  }, [dayPlans, examinations, facilities, patients])

  const totalPatients = facilityGroups.reduce((sum, g) => sum + g.examinations.length, 0)
  const completedPatients = facilityGroups.reduce(
    (sum, g) => sum + g.examinations.filter(e => e.status === 'done').length,
    0
  )
  const dayDocuments = documents.filter(d => d.createdAt === selectedDate)

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">日次報告</h1>

      {/* 日付選択 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">対象日</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm"
            />
          </div>
        </div>
      </div>

      {/* サマリー統計 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">訪問施設数</div>
          <div className="text-2xl font-bold">{facilityGroups.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">患者数</div>
          <div className="text-2xl font-bold">{totalPatients} 名</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">診察完了</div>
          <div className="text-2xl font-bold text-emerald-600">{completedPatients} 名</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">文書作成数</div>
          <div className="text-2xl font-bold text-blue-600">{dayDocuments.length} 件</div>
        </div>
      </div>

      {/* 施設別サマリー */}
      {facilityGroups.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          <p className="text-lg mb-2">訪問予定がありません</p>
          <p className="text-sm">日付を変更してください。</p>
        </div>
      ) : (
        facilityGroups.map(group => (
          <div key={group.plan.id} className="bg-white rounded-lg border border-gray-200 mb-4">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold">{group.facilityName}</span>
              <span className="text-xs text-gray-500">
                {group.examinations.filter(e => e.status === 'done').length} / {group.examinations.length} 完了
              </span>
            </div>
            <div className="p-4">
              {group.examinations.length === 0 ? (
                <p className="text-sm text-gray-400">診察データなし</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-2 py-1">患者名</th>
                      <th className="text-left px-2 py-1 w-20">状態</th>
                      <th className="text-left px-2 py-1 w-24">算定項目数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.examinations.map(exam => (
                      <tr key={exam.id} className="border-t border-gray-100">
                        <td className="px-2 py-1">{exam.patientName}</td>
                        <td className="px-2 py-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs ${
                              exam.status === 'done'
                                ? 'bg-emerald-100 text-emerald-700'
                                : exam.status === 'in_progress'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {exam.status === 'done' ? '完了' : exam.status === 'in_progress' ? '診察中' : '未開始'}
                          </span>
                        </td>
                        <td className="px-2 py-1 text-gray-500">
                          {Object.keys(exam.procedureItems || {}).length} 項目
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ))
      )}

      {/* 文書作成状況 */}
      {dayDocuments.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 mt-6">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-bold">当日の文書作成状況</span>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-2 py-1">患者</th>
                  <th className="text-left px-2 py-1">文書名</th>
                </tr>
              </thead>
              <tbody>
                {dayDocuments.map(doc => {
                  const patient = patients.find(p => p.id === doc.patientId)
                  return (
                    <tr key={doc.id} className="border-t border-gray-100">
                      <td className="px-2 py-1">{patient ? getPatientName(patient) : '-'}</td>
                      <td className="px-2 py-1">{doc.templateName}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// 履歴・一括印刷（BatchPrintPage）
// =============================================================================

type BatchPrintPageProps = {
  documents: SavedDocumentEntry[]
  facilities: Facility[]
  patients: Patient[]
}

export const BatchPrintPage = ({documents, facilities, patients}: BatchPrintPageProps) => {
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterFacility, setFilterFacility] = useState('')
  const [filterPatient, setFilterPatient] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [merging, setMerging] = useState(false)

  const filtered = useMemo(() => {
    return documents.filter(doc => {
      if (filterDateFrom && doc.visitDate < filterDateFrom) return false
      if (filterDateTo && doc.visitDate > filterDateTo) return false
      if (filterFacility && doc.facilityId !== Number(filterFacility)) return false
      if (filterPatient && doc.patientId !== Number(filterPatient)) return false
      return true
    })
  }, [documents, filterDateFrom, filterDateTo, filterFacility, filterPatient])

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(d => d.id)))
    }
  }

  const handleMergePrint = async () => {
    const selected = filtered.filter(d => selectedIds.has(d.id) && d.pdfUrl)
    if (selected.length === 0) return

    setMerging(true)
    // モックではダウンロードのシミュレーションのみ
    setTimeout(() => {
      setMerging(false)
      // モック通知
      const el = document.createElement('div')
      el.className = 'fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded shadow-lg z-50 text-sm'
      el.textContent = `${selected.length}件のPDFを結合してダウンロードしました（モック）`
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 3000)
    }, 1000)
  }

  // 患者リスト（フィルタ用）
  const patientOptions = useMemo(() => {
    const ids = new Set(documents.map(d => d.patientId))
    return patients.filter(p => ids.has(p.id))
  }, [documents, patients])

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">履歴・一括印刷</h1>

      {/* フィルタ */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-600 mb-1">開始日</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={e => setFilterDateFrom(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">終了日</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={e => setFilterDateTo(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">施設</label>
            <select
              value={filterFacility}
              onChange={e => setFilterFacility(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm"
            >
              <option value="">すべて</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">患者</label>
            <select
              value={filterPatient}
              onChange={e => setFilterPatient(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm"
            >
              <option value="">すべて</option>
              {patientOptions.map(p => (
                <option key={p.id} value={p.id}>
                  {p.lastName} {p.firstName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 操作ボタン */}
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant="outline" onClick={handleSelectAll}>
          {selectedIds.size === filtered.length && filtered.length > 0 ? '全解除' : '全選択'}
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={handleMergePrint}
          disabled={selectedIds.size === 0 || merging}
        >
          {merging ? '結合中...' : `一括印刷 (${selectedIds.size}件を1つのPDFに結合)`}
        </Button>
      </div>

      {/* 文書一覧 */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          <p className="text-lg mb-2">対象文書がありません</p>
          <p className="text-sm">
            {documents.length === 0
              ? '文書を作成するには、診察画面から文書作成を行ってください。'
              : 'フィルタ条件を変更してください。'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 accent-emerald-600"
                    />
                  </th>
                  <th className="px-3 py-2 text-left">文書名</th>
                  <th className="px-3 py-2 text-left">患者</th>
                  <th className="px-3 py-2 text-left">施設</th>
                  <th className="px-3 py-2 text-left">訪問日</th>
                  <th className="px-3 py-2 text-left">作成日</th>
                  <th className="px-3 py-2 text-left w-16">PDF</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => (
                  <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(doc.id)}
                        onChange={() => handleToggleSelect(doc.id)}
                        className="w-4 h-4 accent-emerald-600"
                        disabled={!doc.pdfUrl}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">{doc.documentName}</td>
                    <td className="px-3 py-2">{doc.patientName}</td>
                    <td className="px-3 py-2">{doc.facilityName}</td>
                    <td className="px-3 py-2">{doc.visitDate}</td>
                    <td className="px-3 py-2 text-gray-500">{doc.createdAt?.slice(0, 10)}</td>
                    <td className="px-3 py-2">
                      {doc.pdfUrl ? (
                        <span className="text-blue-600 text-xs cursor-pointer hover:underline">表示</span>
                      ) : (
                        <span className="text-gray-400 text-xs">なし</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
