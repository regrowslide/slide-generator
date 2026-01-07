'use client'

import React from 'react'
import type { WorkFormData } from '../../../../types/works'

interface ClientFieldsProps {
  formData: WorkFormData
  clients: any[]
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

/**
 * クライアント情報フィールドセットコンポーネント
 */
export const ClientFields: React.FC<ClientFieldsProps> = ({ formData, clients, onChange }) => {
  return (
    <fieldset className="border border-gray-200 rounded-lg p-4">
      <legend className="text-sm font-semibold text-gray-700 px-2">クライアント</legend>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">クライアント</label>
          <select
            name="kaizenClientId"
            value={formData.kaizenClientId}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">選択してください</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}{client.organization ? ` (${client.organization})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="allowShowClient"
              checked={formData.allowShowClient}
              onChange={onChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">クライアント名を表示</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={onChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">公開する</span>
          </label>
        </div>
      </div>
    </fieldset>
  )
}

