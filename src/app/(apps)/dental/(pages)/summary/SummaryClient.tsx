'use client'

import {useState, useMemo} from 'react'
import {Card, CardContent, CardHeader, CardTitle} from '@shadcn/ui/card'
import type {Facility, Patient} from '@app/(apps)/dental/lib/types'

type ExamSummary = {
  id: number
  patientId: number
  patientName: string
  status: string
  procedureItems: Record<string, unknown>
}

type VisitPlanSummary = {
  id: number
  facilityId: number
  facilityName: string
  visitDate: string
  status: string
  examinations: ExamSummary[]
}

type DocSummary = {
  id: number
  patientId: number
  templateName: string
  createdAt: string
}

type Props = {
  visitPlans: VisitPlanSummary[]
  facilities: Facility[]
  patients: Patient[]
  documents: DocSummary[]
}

const SummaryClient = ({visitPlans, facilities, patients, documents}: Props) => {
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)

  // 選択日の訪問計画
  const dayPlans = useMemo(() => {
    return visitPlans.filter(vp => vp.visitDate === selectedDate)
  }, [visitPlans, selectedDate])

  // 統計
  const totalPatients = useMemo(() => {
    return dayPlans.reduce((sum, vp) => sum + vp.examinations.length, 0)
  }, [dayPlans])

  const completedPatients = useMemo(() => {
    return dayPlans.reduce((sum, vp) => sum + vp.examinations.filter(e => e.status === 'done').length, 0)
  }, [dayPlans])

  // 当日の文書作成状況
  const dayDocuments = useMemo(() => {
    return documents.filter(d => d.createdAt === selectedDate)
  }, [documents, selectedDate])

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">日次報告</h1>

      {/* 日付選択 */}
      <Card className="mb-4">
        <CardContent className="pt-4">
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
        </CardContent>
      </Card>

      {/* サマリー統計 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-gray-500">訪問施設数</div>
            <div className="text-2xl font-bold">{dayPlans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-gray-500">患者数</div>
            <div className="text-2xl font-bold">{totalPatients} 名</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-gray-500">診察完了</div>
            <div className="text-2xl font-bold text-emerald-600">{completedPatients} 名</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-gray-500">文書作成数</div>
            <div className="text-2xl font-bold text-blue-600">{dayDocuments.length} 件</div>
          </CardContent>
        </Card>
      </div>

      {/* 施設別サマリー */}
      {dayPlans.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">訪問予定がありません</p>
            <p className="text-sm">日付を変更してください。</p>
          </CardContent>
        </Card>
      ) : (
        dayPlans.map(plan => (
          <Card key={plan.id} className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{plan.facilityName}</CardTitle>
                <span className="text-xs text-gray-500">
                  {plan.examinations.filter(e => e.status === 'done').length} / {plan.examinations.length} 完了
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {plan.examinations.length === 0 ? (
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
                    {plan.examinations.map(exam => (
                      <tr key={exam.id} className="border-t border-gray-100">
                        <td className="px-2 py-1">{exam.patientName}</td>
                        <td className="px-2 py-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                            exam.status === 'done'
                              ? 'bg-emerald-100 text-emerald-700'
                              : exam.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {exam.status === 'done' ? '完了' : exam.status === 'in_progress' ? '診察中' : '未開始'}
                          </span>
                        </td>
                        <td className="px-2 py-1 text-gray-500">
                          {Object.keys(exam.procedureItems).length} 項目
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {/* 文書作成状況 */}
      {dayDocuments.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">当日の文書作成状況</CardTitle>
          </CardHeader>
          <CardContent>
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
                      <td className="px-2 py-1">{patient ? `${patient.lastName} ${patient.firstName}` : '-'}</td>
                      <td className="px-2 py-1">{doc.templateName}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SummaryClient
