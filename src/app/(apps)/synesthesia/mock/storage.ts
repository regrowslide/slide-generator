// 共感覚マッピング localStorage管理

const STORAGE_KEY = 'synesthesia_mappings'

export type ColorMappings = Record<string, string>

export const loadColorMappings = (): ColorMappings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as ColorMappings
  } catch (e) {
    console.error('マッピングデータの読み込みに失敗しました', e)
    return {}
  }
}

export const saveColorMapping = (char: string, color: string): ColorMappings => {
  try {
    const mappings = loadColorMappings()
    mappings[char] = color
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings))
    return mappings
  } catch (e) {
    console.error('マッピングデータの保存に失敗しました', e)
    return loadColorMappings()
  }
}

export const clearColorMappings = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('マッピングデータの削除に失敗しました', e)
  }
}
