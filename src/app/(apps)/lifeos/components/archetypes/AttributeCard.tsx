'use client'

import React from 'react'
import { ArchetypeProps } from './registry'
import { LifeOSData } from '@app/(apps)/lifeos/types'

export interface AttributeCardProps extends ArchetypeProps {
  log: LifeOSData
}

export const AttributeCard: React.FC<AttributeCardProps> = ({ log }) => {
  const { category, schema, archetype, data } = log



  const formatValue = (props: { value: unknown, type?: string }) => {
    const { value, type } = props
    if (type === 'boolean') {
      return value ? 'はい' : 'いいえ'
    }
    if (type === 'date' && typeof value === 'string') {
      return new Date(value).toLocaleDateString('ja-JP')
    }
    if (type === 'url' && typeof value === 'string') {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {value}
        </a>
      )
    }


    return String(value)
  }



  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3  ">

      <div className="grid grid-cols-1  gap-1">

        {Object.keys(schema)?.map((key, index) => {
          const field = schema[key]
          const { type, label, displayType, } = field

          return <div key={index} className="border-b border-gray-200  last:border-b-0">
            <div className={`flex md:flex-row flex-col gap-1`}>
              <div className="text-sm font-medium text-gray-600   w-full max-w-[160px]">{label}</div>
              <div className="text-base text-gray-900 ">

                {formatValue({
                  value: data[key],
                  type: displayType,
                })}
              </div>
            </div>
          </div>
        })}
      </div>
    </div>
  )
}

