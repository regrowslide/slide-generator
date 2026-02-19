'use client'

type ColorPaletteProps = {
  onSelect: (hexColor: string) => void
}

// HSLをHexに変換
const hslToHex = (h: number, s: number, l: number): string => {
  const sNorm = s / 100
  const lNorm = l / 100
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lNorm - c / 2

  let r = 0,
    g = 0,
    b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// 全色相（18色、20度刻み）× 明度3段階 のグリッドを事前生成
const HUE_STEPS = Array.from({length: 18}, (_, i) => i * 20)
const LIGHTNESS_LEVELS = [35, 55, 75] // 暗・中・明

const FULL_GRID: string[][] = LIGHTNESS_LEVELS.map(l =>
  HUE_STEPS.map(h => hslToHex(h, 85, l))
)

// 無彩色（白〜黒 9段階）
const GRAYS = Array.from({length: 9}, (_, i) => hslToHex(0, 0, 100 - i * 12.5))

const CELL_SIZE = 32

const ColorPalette = ({onSelect}: ColorPaletteProps) => {
  return (
    <div className="flex flex-col gap-2 items-center">
      {/* 全色グリッド: 3行(明度) × 18列(色相) */}
      {FULL_GRID.map((row, ri) => (
        <div key={ri} className="flex gap-[2px]">
          {row.map((color, ci) => (
            <button
              key={ci}
              onClick={() => onSelect(color)}
              className="transition-transform hover:scale-125 hover:z-10 relative"
              style={{
                backgroundColor: color,
                width: CELL_SIZE,
                height: CELL_SIZE,
                borderRadius: 4,
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            />
          ))}
        </div>
      ))}

      {/* 無彩色行 */}
      <div className="flex gap-[2px]">
        {GRAYS.map((color, i) => (
          <button
            key={i}
            onClick={() => onSelect(color)}
            className="transition-transform hover:scale-125 hover:z-10 relative"
            style={{
              backgroundColor: color,
              width: CELL_SIZE,
              height: CELL_SIZE,
              borderRadius: 4,
              border: '1px solid rgba(0,0,0,0.15)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default ColorPalette
