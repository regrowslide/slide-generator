'use client'

import React from 'react'
import { ArchetypeProps } from './registry'
import { LifeOSData } from '@app/(apps)/lifeos/types'

export interface TimelineLogProps extends ArchetypeProps {
  log: LifeOSData
}

export const TimelineLog: React.FC<TimelineLogProps> = ({ log }) => {
  const { events } = log.data

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={event.id} className="relative flex gap-4">
            <div className="relative z-10 flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center">
              <span className="text-white text-xs font-bold">{index + 1}</span>
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{event.title}</h3>
                <span className="text-xs text-gray-500">{event.timestamp}</span>
              </div>
              {event.description && (
                <p className="text-sm text-gray-600">{event.description}</p>
              )}
              {event.category && (
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                  {event.category}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

