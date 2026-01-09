'use client'

import React from 'react'
import type { WorkFormData } from '@app/(apps)/KM/types/works'
import { RATING_POINT_RANGE } from '@app/(apps)/KM/constants/workFormConstants'

interface ContentFieldsProps {
  formData: WorkFormData
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

/**
 * 課題・成果フィールドセットコンポーネント
 */
export const ContentFields: React.FC<ContentFieldsProps> = ({ formData, onChange }) => {
  return (
    <>
      {/* 評価 */}
      <fieldset className="border border-gray-200 rounded-lg p-4">
        <legend className="text-sm font-semibold text-gray-700 px-2">評価</legend>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">取引評価 (1-5)</label>
            <input
              type="number"
              name="dealPoint"
              value={formData.dealPoint}
              onChange={onChange}
              min={RATING_POINT_RANGE.MIN}
              max={RATING_POINT_RANGE.MAX}
              step={RATING_POINT_RANGE.STEP}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">成果物評価 (1-5)</label>
            <input
              type="number"
              name="toolPoint"
              value={formData.toolPoint}
              onChange={onChange}
              min={RATING_POINT_RANGE.MIN}
              max={RATING_POINT_RANGE.MAX}
              step={RATING_POINT_RANGE.STEP}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </fieldset>

      {/* 課題と成果 */}
      <fieldset className="border border-red-200 rounded-lg p-4 bg-red-50/30">
        <legend className="text-sm font-semibold text-red-700 px-2">導入前の課題</legend>
        <textarea
          name="beforeChallenge"
          value={formData.beforeChallenge}
          onChange={onChange}
          rows={4}
          placeholder="例: 毎月末に3日間かけて手作業で請求書を作成。入力ミスが月平均5件発生..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </fieldset>

      <fieldset className="border border-blue-200 rounded-lg p-4 bg-blue-50/30">
        <legend className="text-sm font-semibold text-blue-700 px-2">提供ソリューション</legend>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          rows={4}
          placeholder="提供したソリューションの詳細を記載"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </fieldset>

      <fieldset className="border border-green-200 rounded-lg p-4 bg-green-50/30">
        <legend className="text-sm font-semibold text-green-700 px-2">定量成果（最重要）</legend>
        <textarea
          name="quantitativeResult"
          value={formData.quantitativeResult}
          onChange={onChange}
          rows={4}
          placeholder="例: 作業時間: 3日→30分（97%削減）&#10;入力ミス: 月5件→0件&#10;年間削減工数: 約350時間"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </fieldset>

      <fieldset className="border border-purple-200 rounded-lg p-4 bg-purple-50/30">
        <legend className="text-sm font-semibold text-purple-700 px-2">技術的工夫</legend>
        <textarea
          name="points"
          value={formData.points}
          onChange={onChange}
          rows={3}
          placeholder="技術的なポイントや工夫点を記載"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </fieldset>

      <fieldset className="border border-amber-200 rounded-lg p-4 bg-amber-50/30">
        <legend className="text-sm font-semibold text-amber-700 px-2">お客様の声</legend>
        <textarea
          name="impression"
          value={formData.impression}
          onChange={onChange}
          rows={3}
          placeholder="お客様からのフィードバック"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">改善マニアより</label>
          <textarea
            name="reply"
            value={formData.reply}
            onChange={onChange}
            rows={2}
            placeholder="お客様への返信"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </fieldset>
    </>
  )
}

