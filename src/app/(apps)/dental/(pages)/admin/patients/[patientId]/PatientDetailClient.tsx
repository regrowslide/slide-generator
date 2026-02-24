'use client'

import Link from 'next/link'
import {HREF} from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { Button } from '@cm/components/styles/common-components/Button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Badge } from '@shadcn/ui/badge'
import { PATIENT_DISEASES } from '@app/(apps)/dental/lib/constants'
import { getPatientName, getPatientNameKana } from '@app/(apps)/dental/lib/helpers'
import type { Facility, Patient, Examination, PatientDiseases } from '@app/(apps)/dental/lib/types'

type PatientDetailClientProps = {
  patient: Patient
  facility: Facility | undefined
  examinations: Examination[]
}

const PatientDetailClient = ({ patient, facility, examinations }: PatientDetailClientProps) => {
  const {query} = useGlobal()
  const activeDiseases = PATIENT_DISEASES.filter(d => patient.diseases?.[d.id as keyof PatientDiseases])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link href={HREF('/dental/admin/patients', {}, query)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          &#x2190; 患者管理に戻る
        </Link>
        <Link href={HREF(`/dental/admin/patients/${patient.id}/edit`, {}, query)}>
          <Button>編集</Button>
        </Link>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">患者認識・アセスメント</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* 基本情報 */}
        <Card>
          <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <span className="text-sm font-medium text-gray-700">基本情報</span>
          </div>
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">氏名:</span>{' '}
                <span className="font-medium">{getPatientName(patient)}</span>
              </div>
              <div>
                <span className="text-gray-500">カナ:</span> {getPatientNameKana(patient)}
              </div>
              <div>
                <span className="text-gray-500">性別:</span>{' '}
                {patient.gender === 'male' ? '男性' : patient.gender === 'female' ? '女性' : '-'}
              </div>
              <div>
                <span className="text-gray-500">年齢:</span> {patient.age || '-'}歳
              </div>
              <div>
                <span className="text-gray-500">生年月日:</span> {patient.birthDate || '-'}
              </div>
              <div>
                <span className="text-gray-500">介護度:</span> {patient.careLevel || '-'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 訪問先情報 */}
        <Card>
          <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <span className="text-sm font-medium text-gray-700">訪問先情報</span>
          </div>
          <CardContent className="p-4 space-y-2 text-sm">
            <div>
              <span className="text-gray-500">施設:</span>{' '}
              <span className="font-medium">{facility?.name || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500">居室:</span> {patient.building} {patient.floor} {patient.room}号室
            </div>
            <div>
              <span className="text-gray-500">申し送り:</span>{' '}
              <span className="text-amber-700">{patient.notes || 'なし'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 既往歴・疾患 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <span className="text-sm font-medium text-gray-700">既往歴・疾患</span>
        </div>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {PATIENT_DISEASES.map(d => (
              <span
                key={d.id}
                className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${patient.diseases?.[d.id as keyof PatientDiseases]
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-400'
                  }`}
              >
                {patient.diseases?.[d.id as keyof PatientDiseases] ? '\u2611' : '\u2610'} {d.name}
              </span>
            ))}
          </div>
          {activeDiseases.length === 0 && (
            <p className="text-sm text-gray-400 mt-2">登録されている疾患はありません</p>
          )}
        </CardContent>
      </Card>

      {/* 口腔状態 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <span className="text-sm font-medium text-gray-700">口腔状態</span>
        </div>
        <CardContent className="p-4 flex gap-6 text-sm">
          <div>
            <span className="text-gray-500">残存歯数:</span>{' '}
            <span className="font-bold text-lg">{patient.teethCount ?? '-'}</span>本
          </div>
          <div>
            <span className="text-gray-500">義歯:</span>{' '}
            <Badge color={patient.hasDenture ? 'blue' : 'gray'} size="sm">
              {patient.hasDenture ? 'あり' : 'なし'}
            </Badge>
          </div>
          <div>
            <span className="text-gray-500">口腔機能低下:</span>{' '}
            <Badge color={patient.hasOralHypofunction ? 'orange' : 'gray'} size="sm">
              {patient.hasOralHypofunction ? 'あり' : 'なし'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 経過記録 */}
      <Card>
        <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <span className="text-sm font-medium text-gray-700">経過記録</span>
        </div>
        <CardContent className="p-0">
          {examinations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">診療記録はありません</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {examinations.map(e => (
                <li key={e.id} className="px-4 py-3">
                  <div className="text-xs text-gray-500 mb-1">
                    診察ID: {e.id} / ステータス: {e.status}
                  </div>
                  {e.visitCondition && (
                    <div className="text-sm">
                      <span className="text-gray-500">様子:</span> {e.visitCondition}
                    </div>
                  )}
                  {e.oralFindings && (
                    <div className="text-sm">
                      <span className="text-gray-500">所見:</span> {e.oralFindings}
                    </div>
                  )}
                  {e.treatment && (
                    <div className="text-sm">
                      <span className="text-gray-500">処置:</span> {e.treatment}
                    </div>
                  )}
                  {e.nextPlan && (
                    <div className="text-sm">
                      <span className="text-gray-500">次回:</span> {e.nextPlan}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PatientDetailClient
