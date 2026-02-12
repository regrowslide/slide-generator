'use client'

import React, { useCallback } from 'react'
import { MonthlyTbmDriveData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { ImageIcon } from 'lucide-react'
import { TbmDriveScheduleImage } from '@prisma/generated/prisma/client'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { createCsvTableTotalRow } from '@cm/components/styles/common-components/CsvTable/createCsvTableTotalRow'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import { isDev } from '@cm/lib/methods/common'

type Props = {
  filteredList: MonthlyTbmDriveData[]
  allFilteredList: MonthlyTbmDriveData[] // 合計行計算用の全件データ
  startIndex: number // ページネーション用の開始インデックス（連番表示用）
  onScheduleEdit: (schedule: MonthlyTbmDriveData['schedule']) => void
  onImageOpen: (params: { images: TbmDriveScheduleImage[]; date: Date | null; routeGroupName: string | null }) => void
}


const UnkoMeisaiTableBody = ({ filteredList, allFilteredList, startIndex, onScheduleEdit, onImageOpen }: Props) => {

  // ページ表示用のレコードを構築
  const buildRecords = useCallback((dataList: MonthlyTbmDriveData[], showRowNumber: boolean = false, rowStartIndex: number = 0) => {

    return dataList.map((row, index) => {
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
          // 連番列
          ...(showRowNumber ? [{
            label: <div className="text-xs font-bold">No.</div>,
            cellValue: rowStartIndex + index + 1,
            style: { minWidth: 50, textAlign: 'center', fontWeight: 'bold' },
          }] : []),
          // 画像列
          {
            label: <div className="text-xs">画像</div>,
            cellValue: (
              <button
                className={`flex items-center gap-1 text-xs ${imageCount > 0 ? 'text-blue-600 hover:text-blue-800 cursor-pointer' : 'text-gray-400 cursor-not-allowed'
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
  }, [onScheduleEdit, onImageOpen])

  return (
    <div className={` relative`}>
      {filteredList.length === 0 && <PlaceHolder>表示するデータがありません</PlaceHolder>}
      {(() => {
        // 表示用レコード（ページネーション適用済み、連番あり）
        const displayRecords = buildRecords(filteredList, true, startIndex)
        // 合計行用レコード（全件データから計算、連番なし）
        const allRecords = buildRecords(allFilteredList, false, 0)
        const totalRow = createCsvTableTotalRow(allRecords)

        return CsvTable({
          records: [
            ...displayRecords,
            ...(isDev ? [totalRow] : []),
          ],
        }).WithWrapper({
          className: `w-[calc(95vw)] max-h-[calc(100vh-300px)]`,
        })
      })()}
    </div>
  )
}

export default UnkoMeisaiTableBody
