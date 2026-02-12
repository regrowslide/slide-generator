import {useState} from 'react'
import {RECORD_STATUS, formatDate} from './_constants'
import {Badge, Button, Card} from './_ui'

export function ExportPublicDataView({events, records, recordFiles, members}) {
  const [selectedRecordIds, setSelectedRecordIds] = useState([])
  const [showCsvPreview, setShowCsvPreview] = useState(false)

  const getMemberName = id => members.find(m => m.id === id)?.name || ''

  const toggleRecord = recordId => {
    setSelectedRecordIds(prev => (prev.includes(recordId) ? prev.filter(id => id !== recordId) : [...prev, recordId]))
  }

  const toggleAll = () => {
    if (selectedRecordIds.length === records.length) {
      setSelectedRecordIds([])
    } else {
      setSelectedRecordIds(records.map(r => r.id))
    }
  }

  // CSV生成
  const generateCsvData = () => {
    const selectedRecords = records.filter(r => selectedRecordIds.includes(r.id))
    const headers = ['例会名', '日程', '天候', '参加者', 'コース', '記録', '作成者', '公開画像数']
    const rows = selectedRecords.map(record => {
      const event = events.find(e => e.id === record.eventId)
      const publicFiles = recordFiles.filter(f => f.recordId === record.id && f.isPublic)
      return [
        record.title,
        record.date,
        record.weather,
        record.participants,
        event?.course || '',
        record.content?.replace(/\n/g, ' ').slice(0, 100) + '...',
        getMemberName(record.authorId),
        publicFiles.length,
      ]
    })
    return {headers, rows}
  }

  const handleExportCsv = () => {
    if (selectedRecordIds.length === 0) return
    const {headers, rows} = generateCsvData()
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row
          .map(cell => {
            const s = String(cell)
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
              return `"${s.replace(/"/g, '""')}"`
            }
            return s
          })
          .join(',')
      ),
    ].join('\n')

    const bom = '\uFEFF'
    const blob = new Blob([bom + csvContent], {type: 'text/csv;charset=utf-8;'})
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `yamanokai_public_records_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleExportZip = () => {
    if (selectedRecordIds.length === 0) return
    const selectedRecords = records.filter(r => selectedRecordIds.includes(r.id))
    const publicFilesList = selectedRecords.flatMap(record => {
      const files = recordFiles.filter(f => f.recordId === record.id && f.isPublic && f.fileType === 'image')
      return files.map(f => `${record.title}/${f.fileName}`)
    })
    console.log('ZIP出力（モック）:', publicFilesList)
    // モック：ダウンロードの代わりにログ出力
    const message = [
      `ZIP出力内容（${publicFilesList.length}ファイル）:`,
      '',
      ...publicFilesList.map((f, i) => `  ${i + 1}. ${f}`),
    ].join('\n')
    const blob = new Blob([message], {type: 'text/plain'})
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `yamanokai_public_images_${new Date().toISOString().split('T')[0]}_filelist.txt`
    link.click()
  }

  return (
    <div className="space-y-4">
      {/* 操作パネル */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-lg">外部公開データ出力</h3>
            <span className="text-sm text-gray-500">
              {selectedRecordIds.length > 0
                ? `${selectedRecordIds.length}件選択中`
                : '記録を選択してください'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCsvPreview(!showCsvPreview)}
              disabled={selectedRecordIds.length === 0}
            >
              {showCsvPreview ? 'プレビューを閉じる' : 'CSVプレビュー'}
            </Button>
            <Button size="sm" onClick={handleExportCsv} disabled={selectedRecordIds.length === 0}>
              📄 CSV出力
            </Button>
            <Button size="sm" variant="success" onClick={handleExportZip} disabled={selectedRecordIds.length === 0}>
              🗂️ 画像ZIP出力
            </Button>
          </div>
        </div>
      </Card>

      {/* 記録選択テーブル */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={selectedRecordIds.length === records.length && records.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded"
                />
              </th>
              <th className="py-3 px-4">例会名</th>
              <th className="py-3 px-4">日程</th>
              <th className="py-3 px-4">作成者</th>
              <th className="py-3 px-4">ステータス</th>
              <th className="py-3 px-4">写真数</th>
              <th className="py-3 px-4">公開写真数</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  記録はありません
                </td>
              </tr>
            ) : (
              records.map(record => {
                const files = recordFiles.filter(f => f.recordId === record.id)
                const publicFiles = files.filter(f => f.isPublic)
                return (
                  <tr
                    key={record.id}
                    className={`border-b cursor-pointer ${
                      selectedRecordIds.includes(record.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleRecord(record.id)}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedRecordIds.includes(record.id)}
                        onChange={() => toggleRecord(record.id)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium">{record.title}</td>
                    <td className="py-3 px-4 text-gray-500">{formatDate(record.date)}</td>
                    <td className="py-3 px-4 text-gray-600">{getMemberName(record.authorId)}</td>
                    <td className="py-3 px-4">
                      <Badge color={RECORD_STATUS[record.status].color} bgColor="#f3f4f6">
                        {RECORD_STATUS[record.status].label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{files.length}枚</td>
                    <td className="py-3 px-4">
                      <span className={publicFiles.length > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                        {publicFiles.length}枚
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </Card>

      {/* CSVプレビュー */}
      {showCsvPreview && selectedRecordIds.length > 0 && (
        <Card className="p-4">
          <h4 className="font-bold text-sm mb-3">CSVプレビュー</h4>
          {(() => {
            const {headers, rows} = generateCsvData()
            return (
              <div className="overflow-x-auto">
                <table className="text-xs border-collapse">
                  <thead>
                    <tr>
                      {headers.map((h, i) => (
                        <th key={i} className="border px-2 py-1 bg-gray-100 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="border px-2 py-1 whitespace-nowrap max-w-[200px] truncate">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })()}
        </Card>
      )}

      {/* 公開ファイル一覧 */}
      {selectedRecordIds.length > 0 && (
        <Card className="p-4">
          <h4 className="font-bold text-sm mb-3">選択中の記録の公開ファイル</h4>
          {(() => {
            const selectedRecords = records.filter(r => selectedRecordIds.includes(r.id))
            const allPublicFiles = selectedRecords.flatMap(record => {
              const files = recordFiles.filter(f => f.recordId === record.id && f.isPublic)
              return files.map(f => ({...f, recordTitle: record.title}))
            })
            if (allPublicFiles.length === 0) {
              return <p className="text-gray-500 text-sm">公開ファイルはありません</p>
            }
            return (
              <div className="grid grid-cols-4 gap-3">
                {allPublicFiles.map(file => (
                  <div key={file.id} className="border rounded p-2 text-center">
                    {file.fileType === 'image' && (
                      <img src={file.fileUrl} alt="" className="w-full h-20 object-cover rounded mb-1" />
                    )}
                    <div className="text-xs font-medium truncate">{file.fileName}</div>
                    <div className="text-xs text-gray-400 truncate">{file.recordTitle}</div>
                  </div>
                ))}
              </div>
            )
          })()}
        </Card>
      )}
    </div>
  )
}
