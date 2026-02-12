import {useState} from 'react'
import {RECORD_STATUS, formatDate} from './_constants'
import {Badge, Button, Card, FormField, Input, Textarea} from './_ui'

export function RecordA4View({events, records, recordFiles, members, currentUserId, onSave, onTogglePublic, initialEvent}) {
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const [mode, setMode] = useState('list') // list, preview, edit
  const [editData, setEditData] = useState(null)

  const getMemberName = id => members.find(m => m.id === id)?.name || ''

  const selectedRecord = records.find(r => r.id === selectedRecordId)
  const selectedFiles = recordFiles.filter(f => f.recordId === selectedRecordId)

  // 新規記録の初期データを作成
  const createNewRecordData = () => {
    const event = initialEvent || events[0]
    return {
      eventId: event?.id,
      title: event?.title || '',
      date: event?.dateFrom || new Date().toISOString().split('T')[0],
      weather: '',
      participants: event ? members.filter(m => !m.isDeleted).slice(0, 3).map(m => m.name).join('、') : '',
      content: '',
      accessInfo: '',
      courseTime: '',
      courseCondition: '',
      remarks: '',
      authorId: currentUserId,
      status: 'draft',
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-4">
      {/* 印刷用CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            margin: 0;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {mode === 'list' && (
        <>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">例会記録一覧（A4表示対応）</h3>
              <Button
                onClick={() => {
                  setEditData(createNewRecordData())
                  setSelectedRecordId(null)
                  setMode('edit')
                }}
              >
                ＋ 新規作成
              </Button>
            </div>
            {records.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-3">📝</div>
                <p className="text-gray-500 mb-4">この例会の記録はまだありません</p>
                <Button
                  onClick={() => {
                    setEditData(createNewRecordData())
                    setSelectedRecordId(null)
                    setMode('edit')
                  }}
                >
                  記録を作成する
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {records.map(record => {
                  const event = events.find(e => e.id === record.eventId)
                  const files = recordFiles.filter(f => f.recordId === record.id)
                  const publicFiles = files.filter(f => f.isPublic)
                  return (
                    <div
                      key={record.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        setSelectedRecordId(record.id)
                        setMode('preview')
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{record.title}</span>
                          <Badge color={RECORD_STATUS[record.status].color} bgColor="#f3f4f6">
                            {RECORD_STATUS[record.status].label}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatDate(record.date)} / 作成者: {getMemberName(record.authorId)} / 写真{files.length}枚（公開{publicFiles.length}枚）
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={e => {
                            e.stopPropagation()
                            setSelectedRecordId(record.id)
                            setMode('preview')
                          }}
                        >
                          A4表示
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={e => {
                            e.stopPropagation()
                            setSelectedRecordId(record.id)
                            setEditData({...record})
                            setMode('edit')
                          }}
                        >
                          編集
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </>
      )}

      {mode === 'preview' && selectedRecord && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 no-print">
            <Button variant="secondary" onClick={() => setMode('list')}>
              ← 一覧に戻る
            </Button>
            <Button onClick={handlePrint}>🖨️ 印刷</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setEditData({...selectedRecord})
                setMode('edit')
              }}
            >
              編集
            </Button>
          </div>

          {/* A4プレビュー */}
          <div className="flex justify-center">
            <div
              className="print-area bg-white shadow-lg border"
              style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '15mm',
                fontFamily: 'serif',
              }}
            >
              {/* ヘッダー */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-1">例会記録</h1>
                <div className="text-sm text-gray-600">神戸勤労者山岳会（KCAC）</div>
              </div>

              {/* 基本情報テーブル */}
              <table className="w-full border-collapse border text-sm mb-6">
                <tbody>
                  <tr>
                    <th className="border px-3 py-1.5 bg-gray-100 text-left w-24">例会名</th>
                    <td className="border px-3 py-1.5" colSpan={3}>{selectedRecord.title}</td>
                  </tr>
                  <tr>
                    <th className="border px-3 py-1.5 bg-gray-100 text-left">日程</th>
                    <td className="border px-3 py-1.5">{selectedRecord.date}</td>
                    <th className="border px-3 py-1.5 bg-gray-100 text-left w-24">天候</th>
                    <td className="border px-3 py-1.5">{selectedRecord.weather}</td>
                  </tr>
                  <tr>
                    <th className="border px-3 py-1.5 bg-gray-100 text-left">参加者</th>
                    <td className="border px-3 py-1.5" colSpan={3}>{selectedRecord.participants}</td>
                  </tr>
                </tbody>
              </table>

              {/* アクセス情報 */}
              {selectedRecord.accessInfo && (
                <div className="mb-4">
                  <h3 className="font-bold text-sm border-b pb-1 mb-2">アクセス</h3>
                  <div className="text-sm whitespace-pre-line">{selectedRecord.accessInfo}</div>
                </div>
              )}

              {/* コースタイム */}
              {selectedRecord.courseTime && (
                <div className="mb-4">
                  <h3 className="font-bold text-sm border-b pb-1 mb-2">コースタイム</h3>
                  <div className="text-sm whitespace-pre-line">{selectedRecord.courseTime}</div>
                </div>
              )}

              {/* 本文 */}
              <div className="mb-4">
                <h3 className="font-bold text-sm border-b pb-1 mb-2">記録</h3>
                <div className="text-sm whitespace-pre-line leading-relaxed">{selectedRecord.content}</div>
              </div>

              {/* コース状況 */}
              {selectedRecord.courseCondition && (
                <div className="mb-4">
                  <h3 className="font-bold text-sm border-b pb-1 mb-2">コース状況</h3>
                  <div className="text-sm whitespace-pre-line">{selectedRecord.courseCondition}</div>
                </div>
              )}

              {/* 備考 */}
              {selectedRecord.remarks && (
                <div className="mb-4">
                  <h3 className="font-bold text-sm border-b pb-1 mb-2">備考</h3>
                  <div className="text-sm whitespace-pre-line">{selectedRecord.remarks}</div>
                </div>
              )}

              {/* 画像 */}
              {selectedFiles.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-bold text-sm border-b pb-1 mb-2">写真</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedFiles.map(file => (
                      <div key={file.id} className="text-center">
                        {file.fileType === 'image' && (
                          <img
                            src={file.fileUrl}
                            alt={file.description || file.fileName}
                            className="w-full h-32 object-cover border rounded"
                          />
                        )}
                        <div className="text-xs text-gray-500 mt-1">{file.description || file.fileName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* フッター */}
              <div className="text-right text-xs text-gray-400 mt-8 pt-4 border-t">
                作成者: {getMemberName(selectedRecord.authorId)} / 作成日: {selectedRecord.createdAt}
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'edit' && editData && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setMode('list')}>
              ← 一覧に戻る
            </Button>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">{editData.id ? '例会記録の編集' : '例会記録の新規作成'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="タイトル" required>
                <Input value={editData.title} onChange={v => setEditData(prev => ({...prev, title: v}))} />
              </FormField>
              <FormField label="日付" required>
                <Input type="date" value={editData.date} onChange={v => setEditData(prev => ({...prev, date: v}))} />
              </FormField>
              <FormField label="天候">
                <Input value={editData.weather} onChange={v => setEditData(prev => ({...prev, weather: v}))} />
              </FormField>
              <FormField label="参加者">
                <Input value={editData.participants} onChange={v => setEditData(prev => ({...prev, participants: v}))} />
              </FormField>
            </div>
            <FormField label="アクセス情報">
              <Textarea
                value={editData.accessInfo}
                onChange={v => setEditData(prev => ({...prev, accessInfo: v}))}
                rows={3}
              />
            </FormField>
            <FormField label="コースタイム">
              <Textarea
                value={editData.courseTime}
                onChange={v => setEditData(prev => ({...prev, courseTime: v}))}
                rows={4}
              />
            </FormField>
            <FormField label="記録本文" required>
              <Textarea
                value={editData.content}
                onChange={v => setEditData(prev => ({...prev, content: v}))}
                rows={6}
              />
            </FormField>
            <FormField label="コース状況">
              <Textarea
                value={editData.courseCondition}
                onChange={v => setEditData(prev => ({...prev, courseCondition: v}))}
                rows={3}
              />
            </FormField>
            <FormField label="備考">
              <Textarea
                value={editData.remarks}
                onChange={v => setEditData(prev => ({...prev, remarks: v}))}
                rows={2}
              />
            </FormField>

            {/* ファイル一覧と公開フラグ */}
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold text-sm mb-2">添付ファイル</h4>
                <div className="space-y-2">
                  {selectedFiles.map(file => (
                    <div key={file.id} className="flex items-center gap-3 border rounded p-2">
                      {file.fileType === 'image' && (
                        <img src={file.fileUrl} alt="" className="w-16 h-12 object-cover rounded" />
                      )}
                      {file.fileType === 'pdf' && (
                        <div className="w-16 h-12 bg-red-50 rounded flex items-center justify-center text-red-500 text-xs">
                          PDF
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium">{file.fileName}</div>
                        <div className="text-xs text-gray-500">{file.description}</div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={file.isPublic || false}
                          onChange={() => onTogglePublic(file.id)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm">外部公開</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ファイルアップロード（モック） */}
            <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="text-gray-400 text-3xl mb-2">📎</div>
              <p className="text-sm text-gray-500">ファイルをドラッグ＆ドロップまたはクリックして追加</p>
              <p className="text-xs text-gray-400 mt-1">画像(JPG, PNG) / PDF対応</p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => setMode('list')}>
                キャンセル
              </Button>
              <Button
                onClick={() => {
                  onSave(editData, selectedFiles)
                  setMode('preview')
                }}
              >
                保存
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  onSave(editData, selectedFiles)
                  setMode('preview')
                }}
              >
                保存してプレビュー
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
