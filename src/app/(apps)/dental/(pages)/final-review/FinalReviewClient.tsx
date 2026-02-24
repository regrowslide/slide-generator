'use client'

import {useMemo} from 'react'
import {useRouter} from 'next/navigation'
import {HREF} from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {EXAMINATION_STATUS, getProcedureMaster, findMasterById} from '@app/(apps)/dental/lib/constants'
import {getPatientName, calculateExamPoints} from '@app/(apps)/dental/lib/helpers'
import type {Facility, Patient, Examination, Staff, Clinic} from '@app/(apps)/dental/lib/types'

type Props = {
  visitPlanId: number
  visitDate: string
  facility: Facility | null
  examinations: Examination[]
  patients: Patient[]
  staff: Staff[]
  clinic: Clinic | null
}

const FinalReviewClient = ({visitPlanId, visitDate, facility, examinations, patients, staff, clinic}: Props) => {
  const router = useRouter()
  const {query} = useGlobal()
  const currentMaster = useMemo(() => getProcedureMaster(visitDate), [visitDate])

  const totalPoints = useMemo(() => {
    return examinations.reduce((sum, exam) => sum + calculateExamPoints(exam, visitDate), 0)
  }, [examinations, visitDate])

  const completedCount = examinations.filter(e => e.status === EXAMINATION_STATUS.DONE).length

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push(HREF(`/dental/visit-detail`, {visitPlanId}, query))} className="text-gray-400 hover:text-gray-600">&lt;</button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">最終確認</h2>
            <div className="text-sm text-gray-500">{visitDate} | {facility?.name || '-'}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">合計点数</div>
          <div className="text-2xl font-bold text-slate-700">{totalPoints.toLocaleString()} 点</div>
        </div>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">患者数</div>
          <div className="text-2xl font-bold text-slate-700">{examinations.length} 名</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">診療完了</div>
          <div className="text-2xl font-bold text-emerald-600">{completedCount} 名</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">未完了</div>
          <div className="text-2xl font-bold text-amber-600">{examinations.length - completedCount} 名</div>
        </div>
      </div>

      {/* 各患者の診療サマリー */}
      <div className="space-y-4">
        {examinations.map(exam => {
          const patient = patients.find(p => p.id === exam.patientId)
          if (!patient) return null
          const examPoints = calculateExamPoints(exam, visitDate)
          const isDone = exam.status === EXAMINATION_STATUS.DONE
          const statusLabel = isDone ? '完了' : exam.status === EXAMINATION_STATUS.IN_PROGRESS ? '診療中' : '未診察'
          const statusColor = isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'

          // 算定項目一覧
          const selectedItems = Object.entries(exam.procedureItems || {}).map(([masterId, data]) => {
            const master = findMasterById(currentMaster, masterId)
            if (!master) return null
            const subs = (data.selectedSubItems || []).map(subId => master.subItems?.find(s => s.id === subId)).filter(Boolean)
            const pts = subs.reduce((sum, s) => sum + (s?.points || 0), 0)
            return {name: master.name, subs: subs.map(s => s?.name), points: pts}
          }).filter(Boolean)

          return (
            <div key={exam.id} className="bg-white rounded-lg border border-gray-200">
              {/* 患者ヘッダー */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded">{patient.building}</span>
                  <span className="font-medium text-gray-900">{getPatientName(patient)}</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${statusColor}`}>{statusLabel}</span>
                </div>
                <div className="text-sm font-bold text-slate-700">{examPoints} 点</div>
              </div>

              {/* 診療情報 */}
              <div className="p-4 text-sm space-y-2">
                {exam.visitCondition && <div><span className="text-gray-500">様子:</span> {exam.visitCondition}</div>}
                {exam.oralFindings && <div><span className="text-gray-500">所見:</span> {exam.oralFindings}</div>}
                {exam.treatment && <div><span className="text-gray-500">処置:</span> {exam.treatment}</div>}
                {exam.nextPlan && <div><span className="text-gray-500">次回:</span> {exam.nextPlan}</div>}

                {/* 算定項目 */}
                {selectedItems.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">算定項目:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedItems.map((item, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                          {item!.name} ({item!.points}点)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 編集ボタン */}
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => router.push(HREF(`/dental/consultation`, {examinationId: exam.id}, query))}
                    className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50"
                  >
                    診療画面を開く
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* フッターボタン */}
      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={() => router.push(HREF(`/dental/visit-detail`, {visitPlanId}, query))}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
        >
          訪問計画に戻る
        </button>
        <button
          onClick={() => router.push(HREF('/dental/schedule', {}, query))}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700"
        >
          スケジュールに戻る
        </button>
      </div>
    </div>
  )
}

export default FinalReviewClient
