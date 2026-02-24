'use client'

import {useMemo} from 'react'
import {Card, CardContent, CardHeader, CardTitle} from '@shadcn/ui/card'
import {DOCUMENT_TEMPLATES, getProcedureMaster, getScoringSections} from '@app/(apps)/dental/lib/constants'
import type {ProcedureItemMaster, ScoringSection} from '@app/(apps)/dental/lib/types'

const ScoringReferenceClient = () => {
  const today = new Date().toISOString().split('T')[0]
  const master = useMemo(() => getProcedureMaster(today), [today])
  const sections = useMemo(() => getScoringSections(today), [today])

  /** セクション名に含まれるアイテムを取得 */
  const getItemsForSection = (section: ScoringSection): ProcedureItemMaster[] => {
    return section.items.map(itemId => master.find(m => m.id === itemId)).filter((m): m is ProcedureItemMaster => !!m)
  }

  /** 算定項目に関連する文書を取得 */
  const getRelatedDocuments = (item: ProcedureItemMaster): string[] => {
    if (!item.documents) return []
    return item.documents.map(d => {
      const template = DOCUMENT_TEMPLATES[d.id]
      return template?.name || d.id
    })
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">算定項目一覧</h1>
      <p className="text-sm text-gray-500 mb-6">訪問歯科で算定可能な全項目の一覧です。セクション別にグルーピングされています。</p>

      {sections.map(section => {
        const items = getItemsForSection(section)
        if (items.length === 0) return null

        return (
          <Card key={section.id} className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">{section.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{item.fullName || item.name}</h3>
                        {item.infoText && <p className="text-xs text-gray-500 mt-1">{item.infoText}</p>}
                      </div>
                      {item.defaultPoints && (
                        <span className="text-sm font-bold text-emerald-600 whitespace-nowrap ml-4">
                          {item.defaultPoints}点
                        </span>
                      )}
                    </div>

                    {/* サブアイテム */}
                    {item.subItems && item.subItems.length > 0 && (
                      <div className="mt-2">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="text-left px-2 py-1">項目名</th>
                              <th className="text-right px-2 py-1 w-16">点数</th>
                              <th className="text-left px-2 py-1 w-32">条件</th>
                              <th className="text-left px-2 py-1 w-20">ロール</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.subItems.map(sub => (
                              <tr key={sub.id} className="border-t border-gray-100">
                                <td className="px-2 py-1">{sub.name}</td>
                                <td className="px-2 py-1 text-right font-medium">{sub.points}点</td>
                                <td className="px-2 py-1 text-gray-500">{sub.conditionLabel || '-'}</td>
                                <td className="px-2 py-1 text-gray-500">{sub.requiredRole || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* 関連情報 */}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {item.intervalMonths && (
                        <span>算定間隔: {item.intervalMonths}ヶ月</span>
                      )}
                      {item.monthlyLimit && (
                        <span>月上限: {item.monthlyLimit}回</span>
                      )}
                      {item.selectionMode && (
                        <span>選択: {item.selectionMode === 'single' ? '単一' : '複数'}</span>
                      )}
                    </div>

                    {/* 関連文書 */}
                    {getRelatedDocuments(item).length > 0 && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {getRelatedDocuments(item).map((docName, i) => (
                          <span key={i} className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                            {docName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default ScoringReferenceClient
