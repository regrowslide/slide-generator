import type { DefaultCategoryDef } from '../types'

// デフォルトカテゴリ＋ルーチン定義（子ども作成時に自動生成）
export const DEFAULT_CATEGORIES: DefaultCategoryDef[] = [
  {
    name: 'あさ',
    emoji: '🌅',
    routines: [
      { name: 'じかんにおきる', emoji: '⏰', sticker: '🌟' },
      { name: 'おはようと言う', emoji: '👋', sticker: '⭐' },
      { name: 'おふとんをたたむ', emoji: '🛏️', sticker: '🧹' },
      { name: 'かおをあらう', emoji: '🧼', sticker: '✨' },
      { name: 'はをみがく（あさ）', emoji: '🪥', sticker: '💎' },
      { name: 'ふくをきがえる', emoji: '👕', sticker: '🎀' },
      { name: 'あさごはんをたべる', emoji: '🍚', sticker: '🏅' },
      { name: 'もちものかくにん', emoji: '🎒', sticker: '📋' },
    ],
  },
  {
    name: 'ひる',
    emoji: '☀️',
    routines: [
      { name: 'いただきますを言う', emoji: '🙏', sticker: '🌸' },
      { name: 'てをあらう', emoji: '🫧', sticker: '💠' },
      { name: 'ごちそうさまを言う', emoji: '😊', sticker: '🌼' },
      { name: 'おかたづけする', emoji: '📦', sticker: '🎯' },
    ],
  },
  {
    name: 'よる',
    emoji: '🌙',
    routines: [
      { name: 'おふろにはいる', emoji: '🛁', sticker: '🫧' },
      { name: 'パジャマにきがえる', emoji: '🌜', sticker: '🎪' },
      { name: 'はをみがく（よる）', emoji: '🦷', sticker: '💫' },
      { name: 'あしたのじゅんび', emoji: '📐', sticker: '📝' },
      { name: 'おやすみなさいを言う', emoji: '😴', sticker: '🌈' },
    ],
  },
]

// 褒め言葉プール
export const PRAISE_MESSAGES = [
  'すごい！',
  'やったー！！',
  'がんばったね！',
  'えらい！！',
  'さすが！',
  'かっこいい！',
  'すばらしい！',
  '100てん！',
]

// エフェクト用カラーパレット
export const ROUTINE_COLORS = [
  '#2ED573',
  '#6BCB77',
  '#A8E6CF',
  '#FFD93D',
  '#7BED9F',
  '#55E6C1',
]

// ステッカーレイン用絵文字
export const RAIN_EMOJIS = [
  '⭐',
  '✨',
  '🌟',
  '💫',
  '🎉',
  '🎊',
  '💖',
  '🌈',
  '🎀',
  '💎',
  '🏆',
  '🌸',
]
