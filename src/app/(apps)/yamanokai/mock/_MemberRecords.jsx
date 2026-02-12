import {useState} from 'react'
import {DEPARTMENTS, RECORD_STATUS, formatDate} from './_constants'
import {Modal, Badge, Button, Card, FormField, Input, Select, Textarea} from './_ui'

export function MemberRecords({events, records, recordFiles, members, currentUserId, onSave, onDelete, onDeleteFile}) {
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [editingRecord, setEditingRecord] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  const getMemberName = id => members.find(m => m.id === id)?.name || ''
  const getEvent = eventId => events.find(e => e.id === eventId)
  const getRecordFiles = recordId => recordFiles.filter(f => f.recordId === recordId).sort((a, b) => a.sortOrder - b.sortOrder)

  // 記録がない過去の例会（記録作成候補）
  const pastEventsWithoutRecord = events.filter(e => {
    const isPast = new Date(e.endDate || e.startDate) < new Date()
    const hasRecord = records.some(r => r.eventId === e.id)
    return isPast && !hasRecord
  })

  return (
    <div className="space-y-4">
      <Card className="p-4 flex items-center justify-between">
        <p className="text-gray-600">例会記録の閲覧・作成ができます。</p>
        <Button onClick={() => setIsCreating(true)}>+ 新規作成</Button>
      </Card>

      {/* 記録一覧 */}
      <div className="space-y-2">
        {records.length === 0 ? (
          <Card className="p-8 text-center text-gray-400">まだ例会記録がありません</Card>
        ) : (
          records.map(record => {
            const event = getEvent(record.eventId)
            const dept = event ? DEPARTMENTS[event.departmentId] : null
            const statusInfo = RECORD_STATUS[record.status]
            const files = getRecordFiles(record.id)

            return (
              <Card key={record.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => setSelectedRecord(record)}>
                    <div className="flex items-center gap-2 mb-1">
                      {dept && (
                        <Badge color={dept.color} bgColor={dept.bgColor}>
                          {dept.name}
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">{record.date}</span>
                      <Badge color={statusInfo.color} bgColor="#f3f4f6">
                        {statusInfo.label}
                      </Badge>
                      {files.length > 0 && (
                        <Badge color="#3b82f6" bgColor="#dbeafe">
                          📎 {files.length}件のファイル
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-bold">{record.title}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-gray-500">記録者: {getMemberName(record.authorId)}</p>
                    </div>
                    {/* ファイル一覧（サマリー） */}
                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {files.slice(0, 3).map(file => (
                          <span key={file.id} className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            {file.fileType === 'google' ? '📄' : file.fileType === 'pdf' ? '📕' : '📘'} {file.fileName}
                          </span>
                        ))}
                        {files.length > 3 && <span className="text-xs text-gray-400">他{files.length - 3}件</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="secondary" onClick={() => setEditingRecord(record)}>
                      編集
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(record.id)}>
                      削除
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* 記録詳細モーダル */}
      <Modal isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} title="例会記録" size="lg">
        {selectedRecord && <RecordDetail record={selectedRecord} files={getRecordFiles(selectedRecord.id)} members={members} />}
      </Modal>

      {/* 記録作成モーダル */}
      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="例会記録の新規作成" size="lg">
        <RecordForm
          events={pastEventsWithoutRecord}
          members={members}
          currentUserId={currentUserId}
          onSave={(data, files) => {
            onSave(data, files)
            setIsCreating(false)
          }}
          onCancel={() => setIsCreating(false)}
        />
      </Modal>

      {/* 記録編集モーダル */}
      <Modal isOpen={!!editingRecord} onClose={() => setEditingRecord(null)} title="例会記録の編集" size="lg">
        {editingRecord && (
          <RecordForm
            initialData={editingRecord}
            initialFiles={getRecordFiles(editingRecord.id)}
            events={events}
            members={members}
            currentUserId={currentUserId}
            onSave={(data, files) => {
              onSave(data, files)
              setEditingRecord(null)
            }}
            onCancel={() => setEditingRecord(null)}
          />
        )}
      </Modal>
    </div>
  )
}

// =============================================================================
// 例会記録詳細
// =============================================================================

export function RecordDetail({record, files, members}) {
  const getMemberName = id => members.find(m => m.id === id)?.name || ''
  const statusInfo = RECORD_STATUS[record.status]

  // 画像ファイルのみ抽出
  const imageFiles = files.filter(f => f.fileType === 'image').slice(0, 4)

  return (
    <div className="space-y-4">
      {/* ヘッダー: ステータス、日付、天候 */}
      <div className="flex items-center gap-2">
        <Badge color={statusInfo.color} bgColor="#f3f4f6">
          {statusInfo.label}
        </Badge>
        <span className="text-gray-500">
          {record.date} / {record.weather}
        </span>
      </div>

      {/* タイトル・サブタイトル */}
      <div>
        <h3 className="text-2xl font-bold">{record.title}</h3>
        {record.subtitle && <p className="text-lg text-gray-500 italic mt-1">{record.subtitle}</p>}
      </div>

      {/* 2カラムレイアウト */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* 左カラム: テキスト情報（70%） */}
        <div className="flex-1 md:w-[70%] space-y-4">
          {/* 参加者 */}
          {record.participants && (
            <div>
              <h4 className="font-bold text-gray-700 mb-2">■ 参加者</h4>
              <p className="text-sm whitespace-pre-wrap">{record.participants}</p>
            </div>
          )}

          {/* アクセス */}
          {record.accessInfo && (
            <div>
              <h4 className="font-bold text-gray-700 mb-2">■ アクセス</h4>
              <p className="text-sm whitespace-pre-wrap">{record.accessInfo}</p>
            </div>
          )}

          {/* コースタイム */}
          {record.courseTime && (
            <div>
              <h4 className="font-bold text-gray-700 mb-2">■ コースタイム</h4>
              <p className="text-sm whitespace-pre-wrap">{record.courseTime}</p>
            </div>
          )}

          {/* 本文 */}
          {record.content && (
            <div>
              <h4 className="font-bold text-gray-700 mb-2">■ 本文</h4>
              <p className="text-sm whitespace-pre-wrap">{record.content}</p>
            </div>
          )}

          {/* コース状況 */}
          {record.courseCondition && (
            <div>
              <h4 className="font-bold text-gray-700 mb-2">■ コース状況</h4>
              <p className="text-sm whitespace-pre-wrap">{record.courseCondition}</p>
            </div>
          )}

          {/* 特記事項 */}
          {record.remarks && (
            <div>
              <h4 className="font-bold text-gray-700 mb-2">■ 特記事項</h4>
              <p className="text-sm whitespace-pre-wrap">{record.remarks}</p>
            </div>
          )}
        </div>

        {/* 右カラム: 写真（30%） */}
        {imageFiles.length > 0 && (
          <div className="w-full md:w-[30%] space-y-4">
            {imageFiles.map(image => (
              <div key={image.id} className="bg-white rounded-lg border overflow-hidden">
                <img src={image.fileUrl} alt={image.fileName} className="w-full h-48 object-cover" />
                {image.description && <div className="p-2 text-xs text-gray-600 text-center border-t">{image.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* フッター: 記録者・作成日 */}
      <div className="text-xs text-gray-400 pt-4 border-t">
        記録者: {getMemberName(record.authorId)} / 作成日: {record.createdAt}
      </div>
    </div>
  )
}

// =============================================================================
// 例会記録フォーム（複数ファイル対応）
// =============================================================================

export function RecordForm({initialData, initialFiles = [], events, members, currentUserId, onSave, onCancel}) {
  const [form, setForm] = useState(
    initialData || {
      eventId: '',
      title: '',
      subtitle: '',
      date: '',
      weather: '',
      participants: '',
      accessInfo: '',
      courseTime: '',
      content: '',
      courseCondition: '',
      remarks: '',
      status: 'draft',
      authorId: currentUserId,
    }
  )

  // 画像ファイルリスト状態（最大4枚）
  const [images, setImages] = useState(initialFiles.filter(f => f.fileType === 'image'))

  const updateForm = (key, value) => setForm(prev => ({...prev, [key]: value}))

  // 例会選択時に自動入力
  const handleEventSelect = eventId => {
    const event = events.find(e => e.id === Number(eventId))
    if (event) {
      updateForm('eventId', eventId)
      updateForm('title', event.title)
      updateForm('date', event.startDate)
    }
  }

  // 画像アップロードハンドラ
  const handleImageUpload = e => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 4) {
      alert('写真は最大4枚までアップロードできます')
      return
    }

    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        const newImage = {
          id: Date.now() + Math.random(),
          fileName: file.name,
          fileType: 'image',
          fileUrl: e.target?.result,
          preview: e.target?.result,
          fileSize: file.size,
          mimeType: file.type,
          description: `写真${images.length + 1}`,
          sortOrder: images.length,
        }
        setImages(prev => [...prev, newImage])
      }
      reader.readAsDataURL(file)
    })

    // input をリセット（同じファイルを再選択可能にする）
    e.target.value = ''
  }

  // 画像削除
  const handleRemoveImage = id => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSave(
      {
        ...form,
        eventId: Number(form.eventId),
        authorId: currentUserId,
      },
      images
    )
  }

  const isValid =
    form.eventId &&
    form.title &&
    form.date &&
    form.weather &&
    form.participants &&
    form.accessInfo &&
    form.courseTime &&
    form.content

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. 基本情報 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-3 text-gray-700">1. 基本情報</h4>
        <div className="space-y-4">
          {!initialData && (
            <FormField label="対象の例会" required>
              <Select
                value={form.eventId}
                onChange={handleEventSelect}
                placeholder="選択してください"
                options={events.map(e => ({value: e.id, label: `${formatDate(e.startDate)} ${e.title}`}))}
              />
            </FormField>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <FormField label="タイトル" required>
                <Input value={form.title} onChange={v => updateForm('title', v)} placeholder="例: 六甲山ハイキング" />
              </FormField>
            </div>
            <div className="col-span-2">
              <FormField label="サブタイトル（山名など）">
                <Input value={form.subtitle} onChange={v => updateForm('subtitle', v)} placeholder="例: 六甲山" />
              </FormField>
            </div>
            <FormField label="日程" required>
              <Input type="date" value={form.date} onChange={v => updateForm('date', v)} />
            </FormField>
            <FormField label="天候" required>
              <Input value={form.weather} onChange={v => updateForm('weather', v)} placeholder="例: 晴れ" />
            </FormField>
            <FormField label="ステータス">
              <Select
                value={form.status}
                onChange={v => updateForm('status', v)}
                options={Object.values(RECORD_STATUS).map(s => ({value: s.id, label: s.label}))}
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* 2. 参加者 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-3 text-gray-700">2. 参加者</h4>
        <FormField label="参加者" required>
          <Textarea
            value={form.participants}
            onChange={v => updateForm('participants', v)}
            rows={2}
            placeholder="CL ○○、SL ○○、△△（会計）... 計○名"
          />
        </FormField>
      </div>

      {/* 3. アクセス・行程 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-3 text-gray-700">3. アクセス・行程</h4>
        <div className="space-y-4">
          <FormField label="アクセス" required>
            <Textarea
              value={form.accessInfo}
              onChange={v => updateForm('accessInfo', v)}
              rows={4}
              placeholder="集合: JR三ノ宮駅 8:30&#10;移動: 市バス16系統で摩耶ケーブル下まで"
            />
          </FormField>
          <FormField label="コースタイム" required>
            <Textarea
              value={form.courseTime}
              onChange={v => updateForm('courseTime', v)}
              rows={8}
              placeholder="8:30 出発&#10;9:15 摩耶ロープウェー&#10;10:00 掬星台到着&#10;..."
            />
          </FormField>
        </div>
      </div>

      {/* 4. 本文 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-3 text-gray-700">4. 本文</h4>
        <FormField label="本文（山行の様子）" required>
          <Textarea
            value={form.content}
            onChange={v => updateForm('content', v)}
            rows={15}
            placeholder="山行の様子を記述してください..."
          />
        </FormField>
      </div>

      {/* 5. 追加情報 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-3 text-gray-700">5. 追加情報</h4>
        <div className="space-y-4">
          <FormField label="コース状況">
            <Textarea
              value={form.courseCondition}
              onChange={v => updateForm('courseCondition', v)}
              rows={4}
              placeholder="道路状況、混雑度、積雪状況など"
            />
          </FormField>
          <FormField label="特記事項">
            <Textarea
              value={form.remarks}
              onChange={v => updateForm('remarks', v)}
              rows={4}
              placeholder="安全情報、ヒヤリハット、次回への申し送りなど"
            />
          </FormField>
        </div>
      </div>

      {/* 6. 写真アップロード */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-3 text-gray-700">
          6. 写真アップロード
          <span className="text-sm font-normal text-gray-500 ml-2">（最大4枚、任意）</span>
        </h4>

        {/* 登録済み画像プレビュー */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {images.map(image => (
              <div key={image.id} className="relative bg-white rounded-lg border overflow-hidden">
                <img src={image.preview || image.fileUrl} alt={image.fileName} className="w-full h-48 object-cover" />
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{image.fileName}</p>
                  <p className="text-xs text-gray-400">{(image.fileSize / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 画像アップロード */}
        {images.length < 4 && (
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer">
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="image-upload" />
            <label htmlFor="image-upload" className="cursor-pointer block">
              <span className="text-4xl mb-2 block">📷</span>
              <span className="text-sm text-gray-600">クリックして画像を選択（{images.length}/4枚）</span>
            </label>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" disabled={!isValid}>
          {initialData ? '更新する' : '作成する'}
        </Button>
      </div>
    </form>
  )
}
