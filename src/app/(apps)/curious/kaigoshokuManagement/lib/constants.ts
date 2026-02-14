// 食事区分
export const MEAL_TYPES = {
  breakfast: { code: 'breakfast', name: '朝食', sortOrder: 1 },
  lunch: { code: 'lunch', name: '昼食', sortOrder: 2 },
  snack: { code: 'snack', name: '昼間食', sortOrder: 3 },
  dinner: { code: 'dinner', name: '夕食', sortOrder: 4 },
} as const

export type MealTypeCode = keyof typeof MEAL_TYPES

// 食事形態
export const DIET_TYPES = {
  regular: { code: 'regular', name: '常食', colorClass: 'bg-blue-100 text-blue-800' },
  kizami: { code: 'kizami', name: '刻み食', colorClass: 'bg-green-100 text-green-800' },
  kiwamekizami: { code: 'kiwamekizami', name: '極刻み食', colorClass: 'bg-yellow-100 text-yellow-800' },
  mixer: { code: 'mixer', name: 'ミキサー食', colorClass: 'bg-purple-100 text-purple-800' },
} as const

export type DietTypeCode = keyof typeof DIET_TYPES

// 受注ステータス
export const ORDER_STATUS = {
  pending: { code: 'pending', name: '未確認', colorClass: 'bg-gray-100 text-gray-800' },
  confirmed: { code: 'confirmed', name: '確認済', colorClass: 'bg-blue-100 text-blue-800' },
  processing: { code: 'processing', name: '製造中', colorClass: 'bg-yellow-100 text-yellow-800' },
  completed: { code: 'completed', name: '完了', colorClass: 'bg-green-100 text-green-800' },
} as const

export type OrderStatusCode = keyof typeof ORDER_STATUS

// 製造ステータス
export const PRODUCTION_STATUS = {
  planned: { code: 'planned', name: '計画', colorClass: 'bg-gray-100 text-gray-800' },
  in_progress: { code: 'in_progress', name: '製造中', colorClass: 'bg-yellow-100 text-yellow-800' },
  completed: { code: 'completed', name: '完了', colorClass: 'bg-green-100 text-green-800' },
} as const

export type ProductionStatusCode = keyof typeof PRODUCTION_STATUS

// 連絡方法
export const CONTACT_METHODS = {
  CSV: { code: 'CSV', name: 'CSV' },
  FAX: { code: 'FAX', name: 'FAX' },
  Email: { code: 'Email', name: 'メール' },
  Manual: { code: 'Manual', name: '手入力' },
} as const

export type ContactMethodCode = keyof typeof CONTACT_METHODS

// レシピカテゴリ
export const RECIPE_CATEGORIES = {
  main: { code: 'main', name: '主菜' },
  side: { code: 'side', name: '副菜' },
  staple: { code: 'staple', name: '主食' },
  soup: { code: 'soup', name: '汁物' },
  dessert: { code: 'dessert', name: 'デザート' },
  drink: { code: 'drink', name: '飲み物' },
} as const

export type RecipeCategoryCode = keyof typeof RECIPE_CATEGORIES

// 栄養素の単位
export const NUTRIENT_UNITS = {
  energy: 'kcal',
  protein: 'g',
  fat: 'g',
  carb: 'g',
  sodium: 'mg',
  salt: 'g',
  vegetable: 'g',
} as const
