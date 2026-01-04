'use client'

import React from 'react'
import { ArchetypeProps } from './registry'
import { LifeOSData } from '@app/(apps)/lifeos/types'

export interface MetricTrackerProps extends ArchetypeProps {
  log: LifeOSData
}

export const MetricTracker: React.FC<MetricTrackerProps> = ({ log }) => {
  const { metrics } = log.data

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
            {metric.trend && (
              <span
                className={`text-xs px-2 py-1 rounded ${metric.trend === 'up'
                    ? 'bg-green-100 text-green-800'
                    : metric.trend === 'down'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
              >
                {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metric.value}
            {metric.unit && <span className="text-sm font-normal text-gray-500 ml-1">{metric.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

