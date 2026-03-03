'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@shadcn/ui/tabs'
import { Button } from '@cm/components/styles/common-components/Button'
import { Progress } from '@shadcn/ui/progress'
import { Card, CardContent } from '@shadcn/ui/card'

import CharacterDisplay from './CharacterDisplay'
import ColorPalette from './ColorPalette'
import TextVisualizer from './TextVisualizer'
import { generateCharacterSet } from './characters'
import { loadColorMappings, saveColorMapping, clearColorMappings, type ColorMappings } from './storage'

const SET_SIZE = 20

const SynesthesiaApp = () => {
  const [phase, setPhase] = useState<'training' | 'visualize'>('training')
  const [colorMappings, setColorMappings] = useState<ColorMappings>({})
  const [queue, setQueue] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [setCompleted, setSetCompleted] = useState(false)
  // 戻る機能用: 直前の文字を記録
  const historyRef = useRef<string[]>([])

  // 初期化: localStorageからマッピングを読み込み、最初のセットを生成
  useEffect(() => {
    setColorMappings(loadColorMappings())
    setQueue(generateCharacterSet(SET_SIZE))
  }, [])

  const currentChar = queue[currentIndex] ?? ''
  const progress = queue.length > 0 ? Math.round((currentIndex / queue.length) * 100) : 0

  // 次の文字へ進む
  const goNext = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)

    setTimeout(() => {
      historyRef.current.push(currentChar)
      if (currentIndex + 1 >= queue.length) {
        setSetCompleted(true)
      } else {
        setCurrentIndex(prev => prev + 1)
      }
      setIsTransitioning(false)
    }, 300)
  }, [currentIndex, queue.length, currentChar, isTransitioning])

  // 色を選択
  const handleColorSelect = useCallback(
    (color: string) => {
      if (isTransitioning || setCompleted) return
      const updated = saveColorMapping(currentChar, color)
      setColorMappings(updated)
      goNext()
    },
    [currentChar, goNext, isTransitioning, setCompleted]
  )

  // スキップ
  const handleSkip = useCallback(() => {
    if (isTransitioning || setCompleted) return
    goNext()
  }, [goNext, isTransitioning, setCompleted])

  // 戻る
  const handleBack = useCallback(() => {
    if (isTransitioning || historyRef.current.length === 0) return
    historyRef.current.pop()
    if (setCompleted) {
      setSetCompleted(false)
    } else {
      setCurrentIndex(prev => Math.max(0, prev - 1))
    }
  }, [isTransitioning, setCompleted])

  // 次のセットへ
  const handleNextSet = useCallback(() => {
    setQueue(generateCharacterSet(SET_SIZE))
    setCurrentIndex(0)
    setSetCompleted(false)
    historyRef.current = []
  }, [])

  // リセット
  const handleReset = useCallback(() => {
    clearColorMappings()
    setColorMappings({})
    handleNextSet()
  }, [handleNextSet])

  // セット完了時の統計
  const completedStats = setCompleted
    ? {
      total: queue.length,
      mapped: queue.filter(c => colorMappings[c]).length,
    }
    : null

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Tabs value={phase} onValueChange={v => setPhase(v as 'training' | 'visualize')}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="training">トレーニング</TabsTrigger>
            <TabsTrigger value="visualize">テキスト可視化</TabsTrigger>
          </TabsList>
          <Button size="sm" onClick={handleReset} className="text-gray-400 text-xs">
            リセット
          </Button>
        </div>

        {/* トレーニングモード */}
        <TabsContent value="training">
          {setCompleted && completedStats ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-8">
                <div className="text-2xl font-bold">セット完了!</div>
                <div className="text-gray-500">
                  {completedStats.mapped}/{completedStats.total}文字に色を割り当てました
                </div>
                <div className="text-sm text-gray-400">
                  全体マッピング: {Object.keys(colorMappings).length}文字
                </div>
                <Button onClick={handleNextSet}>次のセットへ</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {/* 文字表示 */}
              <CharacterDisplay char={currentChar} mappedColor={colorMappings[currentChar]} />

              {/* 進捗バー */}
              <div className="flex items-center gap-3">
                <Progress value={progress} className="flex-1" />
                <span className="text-sm text-gray-500 min-w-[4rem] text-right">
                  {currentIndex}/{queue.length}
                </span>
              </div>

              {/* カラーパレット */}
              <ColorPalette onSelect={handleColorSelect} />

              {/* 操作ボタン */}
              <div className="flex justify-center gap-3 mt-2">
                <Button size="sm" onClick={handleSkip}>
                  スキップ
                </Button>
                <Button

                  size="sm"
                  onClick={handleBack}
                  disabled={historyRef.current.length === 0}
                >
                  戻る
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* テキスト可視化モード */}
        <TabsContent value="visualize">
          <TextVisualizer colorMappings={colorMappings} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SynesthesiaApp
