'use client'

import React from 'react'
import type { WorkFormData } from '../../../../types/works'
import { COMPANY_SCALE_OPTIONS, PROJECT_DURATION_OPTIONS } from '../../../../constants/workFormConstants'

interface CategoryFieldsProps {
  formData: WorkFormData
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

/**
 * カテゴリーフィールドセットコンポーネント
 */
export const CategoryFields: React.FC<CategoryFieldsProps> = ({ formData, onChange }) => {
  return (
    <fieldset className="border border-gray-200 rounded-lg p-4">
      <legend className="text-sm font-semibold text-gray-700 px-2">カテゴリ</legend>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">業種</label>
            <input
              type="text"
              name="jobCategory"
              value={formData.jobCategory}
              onChange={onChange}
              placeholder="例: 製造業, 飲食業"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ソリューション</label>
            <input
              type="text"
              name="systemCategory"
              value={formData.systemCategory}
              onChange={onChange}
              placeholder="例: GAS, Webアプリ"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">連携サービス</label>
          <input
            type="text"
            name="collaborationTool"
            value={formData.collaborationTool}
            onChange={onChange}
            placeholder="例: Slack, Freee, LINE"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">企業規模</label>
            <select
              name="companyScale"
              value={formData.companyScale}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">選択してください</option>
              {COMPANY_SCALE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">プロジェクト期間</label>
            <select
              name="projectDuration"
              value={formData.projectDuration}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">選択してください</option>
              {PROJECT_DURATION_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </fieldset>
  )
}

