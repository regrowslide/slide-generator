'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Input } from '@shadcn/ui/input'
import { Card, CardContent } from '@shadcn/ui/card'
import { Checkbox } from '@shadcn/ui/checkbox'
import { upsertDentalClinic } from '@app/(apps)/dental/_actions/clinic-actions'
import { CLINIC_QUALIFICATIONS } from '@app/(apps)/dental/lib/constants'
import type { Clinic, ClinicQualifications } from '@app/(apps)/dental/lib/types'
import { Button } from '@cm/components/styles/common-components/Button'

type ClinicSettingsClientProps = {
  clinic: Clinic | null
}

const ClinicSettingsClient = ({ clinic }: ClinicSettingsClientProps) => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: clinic?.name || '',
    address: clinic?.address || '',
    phone: clinic?.phone || '',
    representative: clinic?.representative || '',
  })
  const [qualifications, setQualifications] = useState<ClinicQualifications>(
    clinic?.qualifications || {
      shiensin1: false,
      shiensin2: false,
      zahoshin: false,
      koukukan: false,
      johorenkei: false,
      dx: false,
      baseup: false,
      electronicPrescription: false,
      other: false,
      otherText: '',
    }
  )

  const handleSaveBasicInfo = async () => {
    await upsertDentalClinic({
      id: clinic?.id,
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      representative: formData.representative,
      qualifications: qualifications as unknown as Record<string, unknown>,
    })
    router.refresh()
  }

  const handleQualificationChange = (qualId: string, value: boolean) => {
    setQualifications(prev => ({ ...prev, [qualId]: value }))
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">クリニック設定</h2>

      {/* 注意事項 */}
      <Card className="mb-4 bg-yellow-50 border-yellow-200">
        <CardContent className="p-1">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 text-lg">&#x26A0;</span>
            <div className="text-sm text-yellow-800">
              <div className="font-medium mb-1">前提条件について</div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>このアプリは歯訪診の施設基準の登録が済んでいる前提です</li>
                <li>歯科訪問診療料の注15も登録済みである前提の点数表示になっています</li>
                <li>院内感染対策の届出も提出済である前提としてあります</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 基本情報 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <span className="text-sm font-medium text-gray-700">基本情報</span>
        </div>
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">クリニック名</label>
            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">住所</label>
            <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">電話番号</label>
              <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">代表者名</label>
              <Input
                value={formData.representative}
                onChange={e => setFormData({ ...formData, representative: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveBasicInfo}>基本情報を保存</Button>
          </div>
        </CardContent>
      </Card>

      {/* 届出・施設基準 */}
      <Card>
        <div className="p-3 border-b border-gray-200 bg-blue-600 rounded-t-lg">
          <span className="text-sm font-medium text-white">届出・施設基準</span>
        </div>
        <CardContent className="p-4 space-y-2">
          {CLINIC_QUALIFICATIONS.map(qual => {
            const currentValue = !!qualifications[qual.id]
            return (
              <div key={qual.id} className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={currentValue}
                    onCheckedChange={() => handleQualificationChange(qual.id, !currentValue)}
                  />
                  <span className="text-sm text-gray-900">{qual.name}</span>
                </label>
              </div>
            )
          })}
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveBasicInfo} >資格情報を保存</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ClinicSettingsClient
