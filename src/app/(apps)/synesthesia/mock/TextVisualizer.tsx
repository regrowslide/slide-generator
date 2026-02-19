'use client'

import {useState} from 'react'
import {getColorStyles} from '@cm/lib/methods/colors'
import type {ColorMappings} from './storage'
import {ALL_CHARACTERS} from './characters'

type TextVisualizerProps = {
  colorMappings: ColorMappings
}

const TextVisualizer = ({colorMappings}: TextVisualizerProps) => {
  const [text, setText] = useState('')

  const mappedCount = Object.keys(colorMappings).length
  const totalCount = ALL_CHARACTERS.length
  const mappingRate = totalCount > 0 ? Math.round((mappedCount / totalCount) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      {/* テキスト入力エリア */}
      <div>
        <label className="block text-sm text-gray-500 mb-1">テキストを入力してください</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full border rounded-lg p-3 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
          rows={3}
          placeholder="ここに文字を入力すると、共感覚カラーで表示されます..."
        />
      </div>

      {/* 着色表示 */}
      {text && (
        <div className="flex flex-wrap gap-1 p-4 bg-gray-50 rounded-lg min-h-[60px]">
          {text.split('').map((char, i) => {
            const color = colorMappings[char]
            if (char === '\n') return <div key={i} className="w-full" />
            if (char === ' ')
              return (
                <span key={i} className="w-4">
                  &nbsp;
                </span>
              )

            if (color) {
              const styles = getColorStyles(color)
              return (
                <span
                  key={i}
                  className="inline-flex items-center justify-center w-10 h-10 rounded text-lg font-medium"
                  style={styles}
                >
                  {char}
                </span>
              )
            }

            // 未マッピング文字
            return (
              <span
                key={i}
                className="inline-flex items-center justify-center w-10 h-10 rounded text-lg text-gray-400 bg-gray-100"
              >
                {char}
              </span>
            )
          })}
        </div>
      )}

      {/* マッピング率 */}
      <div className="text-sm text-gray-500 text-center">
        マッピング済み: {mappedCount}/{totalCount}文字 ({mappingRate}%)
      </div>
    </div>
  )
}

export default TextVisualizer
