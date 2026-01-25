/**
 * 単位変換ロジック
 * 各種単位をkgに変換する
 */
export const convertToKg = (amount: number, unit: string): number => {
  if (!amount || isNaN(amount)) return 0

  const val = Number(amount)
  const unitLower = unit.toLowerCase()

  switch (unitLower) {
    case 'kg':
      return val
    case 'g':
      return val / 1000
    case 'l':
      // 比重1.0と仮定（水換算）
      return val
    case 'ml':
    case 'cc':
      // 比重1.0と仮定（水換算）
      return val / 1000
    default:
      // 不明単位はg扱いとしてkgへ変換
      return val / 1000
  }
}
