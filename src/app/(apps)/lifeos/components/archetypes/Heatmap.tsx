'use client'

import React from 'react'
import { ArchetypeProps } from './registry'
import { LifeOSData } from '@app/(apps)/lifeos/types'

export interface HeatmapProps extends ArchetypeProps {
  log: LifeOSData & {
    data: Array<{
      x: string | number
      y: string | number
      value: number
    }>
    xLabel?: string
    yLabel?: string

  }
}

export const Heatmap: React.FC<HeatmapProps> = ({ log }) => {
  const { title, data: heatmapData, xLabel, yLabel } = log.data

  // 値の範囲を計算
  const values = heatmapData.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue || 1

  // ユニークなXとYの値を取得
  const xValues = Array.from(new Set(heatmapData.map((d) => String(d.x)))).sort() as string[]
  const yValues = Array.from(new Set(heatmapData.map((d) => String(d.y)))).sort() as string[]

  // データをマップに変換
  const dataMap = new Map<string, number>()
  heatmapData.forEach((d) => {
    const key = `${d.x}-${d.y}`
    dataMap.set(key, d.value)
  })

  // 色の強度を計算（0-100%）
  const getIntensity = (value: number) => {
    return ((value - minValue) / range) * 100
  }

  // 色を計算
  const getColor = (intensity: number) => {
    const opacity = Math.max(0.3, intensity / 100)
    return `rgba(59, 130, 246, ${opacity})` // blue-500 with opacity
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {title && <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                {yLabel || 'Y'}
              </th>
              {xValues.map((x, i) => (
                <th
                  key={i}
                  className="p-2 text-center text-sm font-medium text-gray-700 border-b border-gray-200"
                >
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {yValues.map((y) => (
              <tr key={y}>
                <td className="p-2 text-sm font-medium text-gray-700 border-r border-gray-200">
                  {y}
                </td>
                {xValues.map((x) => {
                  const key = `${x}-${y}`
                  const value = dataMap.get(key) || 0
                  const intensity = getIntensity(value)
                  const color = getColor(intensity)
                  return (
                    <td
                      key={x}
                      className="p-2 text-center text-sm border border-gray-200"
                      style={{ backgroundColor: color }}
                    >
                      {value}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-200 rounded" />
          <span>低</span>
        </div>
        <div className="flex-1 h-2 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 rounded" />
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded" />
          <span>高</span>
        </div>
      </div>
    </div>
  )
}

