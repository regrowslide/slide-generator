'use client'

import React, { useCallback } from 'react'
import { MonthlyTbmDriveData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { ImageIcon } from 'lucide-react'
import { TbmDriveScheduleImage } from '@prisma/generated/prisma/client'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { createCsvTableTotalRow } from '@cm/components/styles/common-components/CsvTable/createCsvTableTotalRow'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'

type Props = {
  filteredList: MonthlyTbmDriveData[]
  onScheduleEdit: (schedule: MonthlyTbmDriveData['schedule']) => void
  onImageOpen: (params: { images: TbmDriveScheduleImage[]; date: Date | null; routeGroupName: string | null }) => void
}

const UnkoMeisaiTableBody = ({ filteredList, onScheduleEdit, onImageOpen }: Props) => {
  const buildRecords = useCallback(() => {
    return filteredList.map((row) => {
      const { keyValue, schedule } = row

      const cols = Object.entries(keyValue).filter(([dataKey, item]) => !String(item.label).includes(`CD`))
      const routeGroupColIndex = cols.findIndex(([dataKey, item]) => String(item.label ?? '').includes(`便名`))

      const convertedCols: any[][] = [...cols]
      convertedCols[routeGroupColIndex] = [
        String(routeGroupColIndex),
        {
          label: `便名`,
          cellValue: schedule.TbmRouteGroup.name,
          onClick: () => onScheduleEdit(schedule),
          style: {
            minWidth: 160,
            cursor: 'pointer',
            textDecoration: 'underline',
            color: '#2563eb',
          },
        },
      ]

      // 画像データを取得
      const images = (schedule as any).TbmDriveScheduleImage || []
      const imageCount = images.length

      return {
        csvTableRow: [
          {
            label: <div className="text-xs">画像</div>,
            cellValue: (
              <button
                className={`flex items-center gap-1 text-xs ${
                  imageCount > 0 ? 'text-blue-600 hover:text-blue-800 cursor-pointer' : 'text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (imageCount > 0) {
                    onImageOpen({
                      images,
                      date: schedule.date,
                      routeGroupName: schedule.TbmRouteGroup?.name || null,
                    })
                  }
                }}
                disabled={imageCount === 0}
              >
                <ImageIcon className="w-4 h-4" />
                <span>{imageCount}</span>
              </button>
            ),
            style: { minWidth: 50, textAlign: 'center' },
          },
          ...convertedCols.map((props: any) => {
            const [dataKey, item] = props

            let value
            if (item.type === `date`) {
              value = formatDate(item.cellValue, 'short')
            } else {
              value = item.cellValue
            }

            const baseWidth = 80
            const width = item?.style?.minWidth ?? baseWidth

            const style = {
              fontSize: 13,
              color: typeof value === 'number' && value < 0 ? 'red' : undefined,
              ...item.style,
              minWidth: width,
            }

            return {
              ...item,
              label: <div className="text-xs">{item.label}</div>,
              style,
              cellValue: value,
            }
          }),
        ],
      }
    })
  }, [filteredList, onScheduleEdit, onImageOpen])

  return (
    <div className={` relative`}>
      {filteredList.length === 0 && <PlaceHolder>表示するデータがありません</PlaceHolder>}
      {(() => {
        const records = buildRecords()
        return CsvTable({
          records: [...records, createCsvTableTotalRow(records)],
        }).WithWrapper({
          className: `w-[calc(95vw)] `,
        })
      })()}
    </div>
  )
}

export default UnkoMeisaiTableBody
