'use client'

/**
 * Excelインポートビュー
 * 担当者別分析表（3店舗分）をアップロード
 */

import React, {useState, useRef, useCallback} from 'react'
import {useDataContext} from '../../context/DataContext'
import {parseStaffAnalysisExcel} from '../../lib/excel-parser'

export const ImportView = () => {
  const {addImportedData, monthlyData} = useDataContext()
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Excelファイル（.xlsx / .xls）を選択してください')
        return
      }

      setError(null)
      setIsLoading(true)

      try {
        const result = await parseStaffAnalysisExcel(file)
        addImportedData(result)
        setError(null)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setIsLoading(false)
      }
    },
    [addImportedData]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const importedStores = monthlyData.importedData?.storeTotals.map((t) => t.storeName) || []

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Excel取込</h1>

      {/* ドラッグ&ドロップエリア */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
          isDragging ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-red-300 hover:bg-gray-50'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-red-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">パース中...</p>
            <p className="text-gray-500 text-sm">Excel解析中です。しばらくお待ちください。</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-gray-700 text-lg font-medium mb-2">
              ここにExcelファイルをドラッグ＆ドロップ
            </p>
            <p className="text-gray-500 mb-1">またはクリックしてファイルを選択</p>
            <p className="text-xs text-gray-400">対応形式: .xlsx / .xls</p>
          </>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">❌ エラー</p>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* 取込済みデータ一覧 */}
      {importedStores.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3 text-gray-800">取込済みデータ</h2>
          <div className="space-y-3">
            {monthlyData.importedData?.storeTotals.map((total, i) => {
              const staffCount =
                monthlyData.importedData?.staffRecords.filter((r) => r.storeName === total.storeName).length || 0
              return (
                <div key={i} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-gray-800">{total.storeName}</span>
                        <span className="text-green-600 text-sm font-medium">✅ 取込済</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span>スタッフ: {staffCount}名</span>
                        <span className="mx-2">|</span>
                        <span>売上合計: ¥{total.sales.toLocaleString()}</span>
                        <span className="mx-2">|</span>
                        <span>客単価: ¥{total.unitPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {monthlyData.importedData && (
            <div className="mt-3 text-sm text-gray-500">
              <p>インポート日時: {new Date(monthlyData.importedData.importedAt).toLocaleString('ja-JP')}</p>
            </div>
          )}
        </div>
      )}

      {/* 指示 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 font-medium mb-2">📝 ファイル要件</p>
        <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
          <li>ファイル名: 担当者別分析表_Relaxation Salon SAMPLE[店舗名]_YYYYMMDD.xlsx</li>
          <li>3店舗分（港北店、青葉店、中央店）をアップロードしてください</li>
          <li>同じ店舗のファイルを再度アップロードすると上書きされます</li>
        </ul>
      </div>
    </div>
  )
}
