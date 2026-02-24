'use client'

import {useState, useMemo} from 'react'
import {Card, CardContent, CardHeader, CardTitle} from '@shadcn/ui/card'
import {getProcedureMaster, findMasterById} from '@app/(apps)/dental/lib/constants'
import {getPatientName} from '@app/(apps)/dental/lib/helpers'
import type {ScoringHistoryItem, Patient} from '@app/(apps)/dental/lib/types'

type Props = {
  histories: ScoringHistoryItem[]
  patients: Patient[]
}

const ScoringLedgerClient = ({histories, patients}: Props) => {
  const today = new Date()
  const [filterMonth, setFilterMonth] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`)
  const master = useMemo(() => getProcedureMaster(today.toISOString().split('T')[0]), [today])

  // 月でフィルタした履歴
  const filteredHistories = useMemo(() => {
    if (!filterMonth) return histories
    return histories.filter(h => h.lastScoredAt.startsWith(filterMonth))
  }, [histories, filterMonth])

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
      <Card className="mb-4">
        <CardContent className="pt-4">
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
        </CardContent>
      </Card>

      {/* 統計 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-gray-500">対象患者数</div>
            <div className="text-xl font-bold">{patientGroups.length} 名</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-gray-500">算定項目数</div>
            <div className="text-xl font-bold">{filteredHistories.length} 件</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-gray-500">合計点数</div>
            <div className="text-xl font-bold text-emerald-600">{totalPoints.toLocaleString()} 点</div>
          </CardContent>
        </Card>
      </div>

      {/* 患者別一覧 */}
      {patientGroups.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">算定履歴がありません</p>
            <p className="text-sm">対象月を変更するか、診察を完了してください。</p>
          </CardContent>
        </Card>
      ) : (
        patientGroups.map(({patient, items}) => {
          const patientTotal = items.reduce((sum, h) => sum + h.points, 0)
          return (
            <Card key={patient.id} className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{getPatientName(patient)}</CardTitle>
                  <span className="text-sm font-bold text-emerald-600">{patientTotal} 点</span>
                </div>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}

export default ScoringLedgerClient
