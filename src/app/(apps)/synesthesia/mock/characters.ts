// 共感覚トレーニング用 文字セット定義

const HIRAGANA =
  'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'
const KATAKANA =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
const DIGITS = '0123456789'
const ALPHA_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const ALPHA_LOWER = 'abcdefghijklmnopqrstuvwxyz'

export type CharacterCategory = 'hiragana' | 'katakana' | 'digit' | 'alpha'

export const ALL_CHARACTERS = [
  ...HIRAGANA.split(''),
  ...KATAKANA.split(''),
  ...DIGITS.split(''),
  ...ALPHA_UPPER.split(''),
  ...ALPHA_LOWER.split(''),
]

export const getCharacterCategory = (char: string): CharacterCategory => {
  if (HIRAGANA.includes(char)) return 'hiragana'
  if (KATAKANA.includes(char)) return 'katakana'
  if (DIGITS.includes(char)) return 'digit'
  return 'alpha'
}

// 各カテゴリからバランスよくランダム抽出してシャッフル
export const generateCharacterSet = (size = 20): string[] => {
  const categories = [
    HIRAGANA.split(''),
    KATAKANA.split(''),
    DIGITS.split(''),
    [...ALPHA_UPPER.split(''), ...ALPHA_LOWER.split('')],
  ]

  // 各カテゴリから均等に抽出（余りはランダムカテゴリから補充）
  const perCategory = Math.floor(size / categories.length)
  const remainder = size % categories.length

  const result: string[] = []

  categories.forEach((chars, i) => {
    const count = perCategory + (i < remainder ? 1 : 0)
    const shuffled = [...chars].sort(() => Math.random() - 0.5)
    result.push(...shuffled.slice(0, count))
  })

  // シャッフル
  return result.sort(() => Math.random() - 0.5)
}
