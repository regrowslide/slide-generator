'use client'

import { formatDate } from '@cm/class/Days/date-utils/formatters'

import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import React, { Fragment } from 'react'

export default function TenkoPaperHeader({ date, tableStyle }) {
  const sections = [
    {
      header: '注意・指示事項',
      children: [],
    },
    {
      header: '乗務前点呼確認事項',
      children: [
        //
        ['① 酒気帯びの有無'],
        ['② 疾病、疲労、睡眠不足等の状況'],
        ['③ 日常点検の結果'],
        ['④ その他必要な事項（服装・携帯品の有無等）※注'],
      ],
    },
    {
      header: '中間点呼確認事項',
      children: [
        //
        ['① 酒気帯びの有無'],
        ['② 疾病・疲労の状況'],
        ['③ 睡眠不足等の状況'],
      ],
    },
    {
      header: '乗務後点呼報告確認事項',
      children: [
        //
        ['① 酒気帯びの有無'],
        ['② 自動車、道路及び運行状況'],
        [
          <div>
            <div>③ その他必要な事項</div>
            <div>（積載物の異常の有無・鍵の返納等）※注</div>
          </div>,
        ],
      ],
    },
    {
      header: '本日の事故件数',
      children: [
        //
        ['荷物事故', '件'],
        ['交通事故', '件'],
        ['作業事故', '件'],
        ['合計', '件'],
      ],
    },
  ]

  return (
    <div style={{ ...tableStyle }}>
      <R_Stack className={` w-full justify-between text-[20px] font-bold [&>*]:border-box [&_*]:border-collapse`}>
        <section>点呼記録簿</section>

        <R_Stack className={`gap-4`}>
          <C_Stack className={` gap-0`}>
            <div className={`text-[12px]`}>西日本運送有限会社</div>

          </C_Stack>
          <span>{formatDate(date, 'YYYY/M/D(ddd)')}</span>
        </R_Stack>

        <div>
          <div>
            {CsvTable({
              records: [
                { role: `運行管理者`, name: ``, check: `印` },
                { role: `運行管理補助者`, name: ``, check: `印` },
                { role: `運行管理補助者`, name: ``, check: `印` },
              ].map(data => {
                return {
                  csvTableRow: [
                    //
                    { label: `職務`, cellValue: data.role },
                    { label: `氏名`, cellValue: data.name, style: { width: 180 } },
                    { label: `印鑑`, cellValue: data.check },
                  ],
                }
              }),
            }).WithWrapper({
              className: `text-center border rounded-none [&_td]:!px-6 `,
            })}
          </div>
        </div>
      </R_Stack>

      <div className={'[&_*]:border-gray-700  '}>
        <R_Stack className={`gap-8`}>
          <R_Stack className={`border gap-0 w-fit `}>
            <div className={`border p-2`}>検知器の状態</div>
            <R_Stack className={`border p-2 gap-6`}>
              <span>良</span>
              <span>否</span>
            </R_Stack>
          </R_Stack>

          {/* サブヘッダー */}
          <div style={{ margin: '10px 0 6px 0', fontSize: 11 }}>
            運行管理者はアルコール検知器を使い「特例的に」点呼する。義務あり。
            <br />
            定期的に個別チェックすることを求められる。
          </div>
        </R_Stack>

        <div className={`border`}>
          {/* 選択欄 */}
          <div className={` grid grid-cols-5`}>
            {sections.map((section, i) => (
              <Fragment key={i}>
                <div className={` border [&_td]:p-0.5  w-full `}>
                  <table className={` w-full `}>
                    <thead>
                      <tr>
                        <th>{section.header}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.children.map((cols, i) => {
                        return (
                          <tr key={i}>
                            {cols.map((data, j) => {
                              return <td key={j}>{data}</td>
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
