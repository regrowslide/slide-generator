'use client'

import React from 'react'
import { ArchetypeProps } from './registry'
import { CheckCircle2, Circle, Clock } from 'lucide-react'
import { LifeOSData } from '@app/(apps)/lifeos/types'

export interface TaskListProps extends ArchetypeProps {
  log: LifeOSData
}

export const TaskList: React.FC<TaskListProps> = ({ log }) => {
  const { category, schema, archetype, data } = log




  const { task, status, description } = data



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />
      default:
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50'
      case 'medium':
        return 'border-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-green-500 bg-green-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }




  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getStatusIcon(status)}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{task}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

