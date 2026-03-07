'use server'

import {put, list, del} from '@vercel/blob'

// ファイルをVercel Blobにアップロード
export const uploadEarthFile = async (formData: FormData): Promise<{
  url: string
  pathname: string
  name: string
  size: number
  uploadedAt: string
}> => {
  const file = formData.get('file') as File
  const propertyId = formData.get('propertyId') as string

  if (!file || !propertyId) throw new Error('ファイルと物件IDが必要です')

  const buffer = Buffer.from(await file.arrayBuffer())
  const pathname = `earth/${propertyId}/${Date.now()}_${file.name}`

  const blob = await put(pathname, buffer, {
    access: 'public',
    contentType: file.type || 'application/octet-stream',
  })

  return {
    url: blob.url,
    pathname: blob.pathname,
    name: file.name,
    size: file.size,
    uploadedAt: new Date().toISOString().slice(0, 10),
  }
}

// 物件のファイル一覧を取得
export const listEarthFiles = async (propertyId: string): Promise<{
  url: string
  pathname: string
  name: string
  size: number
  uploadedAt: string
}[]> => {
  const {blobs} = await list({prefix: `earth/${propertyId}/`})

  return blobs.map(b => {
    // ファイル名からタイムスタンププレフィックスを除去
    const fileName = b.pathname.split('/').pop() || ''
    const originalName = fileName.replace(/^\d+_/, '')
    return {
      url: b.url,
      pathname: b.pathname,
      name: originalName,
      size: b.size,
      uploadedAt: b.uploadedAt.toISOString().slice(0, 10),
    }
  })
}

// ファイルを削除
export const deleteEarthFile = async (url: string): Promise<void> => {
  await del(url)
}
