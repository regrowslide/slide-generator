/**
 * 単位オプション定義
 */
export const UNIT_OPTIONS = [
  {value: 'kg', label: 'kg'},
  {value: 'g', label: 'g'},
  {value: 'l', label: 'l'},
  {value: 'ml', label: 'ml'},
  {value: 'cc', label: 'cc'},
] as const

export type UnitType = (typeof UNIT_OPTIONS)[number]['value']
