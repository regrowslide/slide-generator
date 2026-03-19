'use client'

import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useFrankartMockData } from '../context/MockDataContext'
import { FILE_TYPE_CONFIG } from './constants'
import type { FileType } from './types'

type Props = { dealId: string }

const FILE_TYPES: FileType[] = ['estimate', 'contract', 'nda', 'minutes', 'proposal', 'other']

const DealRoomFiles: React.FC<Props> = ({ dealId }) => {
  const { files, addFile, deleteFile, staff } = useFrankartMockData()
  const [showForm, setShowForm] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState<FileType>('other')

  const dealFiles = files.filter((f) => f.dealId === dealId).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
  const currentUser = staff[0]

  const handleAdd = () => {
    if (!fileName.trim()) return
    addFile({
      id: `file-${Date.now()}`,
      dealId,
      name: fileName.trim(),
      type: fileType,
      size: `${(Math.random() * 5 + 0.1).toFixed(1)}MB`,
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString().split('T')[0],
    })
    setFileName('')
    setFileType('other')
    setShowForm(false)
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
      {/* ヘッダー */}
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <span className="text-sm font-medium text-stone-600">{dealFiles.length}件のファイル</span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          登録
        </button>
      </div>

      {/* 登録フォーム */}
      {showForm && (
        <div className="px-5 py-4 border-b border-stone-100 bg-stone-50 space-y-3">
          <input
            type="text"
            placeholder="ファイル名（例: 提案書_v2.pdf）"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
          />
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value as FileType)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
          >
            {FILE_TYPES.map((t) => (
              <option key={t} value={t}>{FILE_TYPE_CONFIG[t].label}</option>
            ))}
          </select>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-200 rounded-lg">
              キャンセル
            </button>
            <button
              onClick={handleAdd}
              disabled={!fileName.trim()}
              className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40"
            >
              登録する
            </button>
          </div>
        </div>
      )}

      {/* ファイル一覧 */}
      <div className="divide-y divide-stone-100">
        {dealFiles.length === 0 ? (
          <div className="px-5 py-8 text-center text-stone-400 text-sm">ファイルはありません</div>
        ) : (
          dealFiles.map((file) => {
            const typeConf = FILE_TYPE_CONFIG[file.type]
            return (
              <div key={file.id} className="px-5 py-3 flex items-center gap-3 group">
                <span className="text-xl">{typeConf.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{file.name}</p>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="px-1.5 py-0.5 bg-stone-100 rounded">{typeConf.label}</span>
                    <span>{file.size}</span>
                    <span>{file.uploadedBy}</span>
                    <span>{file.uploadedAt}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteFile(file.id)}
                  className="p-1.5 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default DealRoomFiles
