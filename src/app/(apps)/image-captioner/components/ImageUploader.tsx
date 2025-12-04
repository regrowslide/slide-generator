'use client'

import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import {Upload, X} from 'lucide-react'
import {C_Stack} from '@cm/components/styles/common-components/common-components'

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({onFilesSelected, maxFiles = 50}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles)
    },
    [onFilesSelected]
  )

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    },
    multiple: true,
    maxFiles,
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <C_Stack className="items-center gap-4">
          <Upload className="w-12 h-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragActive ? 'ここに画像をドロップ' : '画像をドラッグ＆ドロップ'}
            </p>
            <p className="text-sm text-gray-500 mt-2">またはクリックしてファイルを選択</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPEG, WebP形式（最大{maxFiles}枚）</p>
          </div>
        </C_Stack>
      </div>
    </div>
  )
}

interface ImageThumbnailProps {
  preview: string
  fileName: string
  onRemove: () => void
}

export const ImageThumbnail: React.FC<ImageThumbnailProps> = ({preview, fileName, onRemove}) => {
  return (
    <div className="relative group">
      <img src={preview} alt={fileName} className="w-full h-32 object-cover rounded-lg" />
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
      <p className="text-xs text-gray-600 mt-1 truncate">{fileName}</p>
    </div>
  )
}

