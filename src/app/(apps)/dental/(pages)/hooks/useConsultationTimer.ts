'use client'
import {useState, useRef, useCallback, useEffect} from 'react'
import {saveTimerEvent, saveTimerTime} from '@app/(apps)/dental/_actions/examination-actions'
import {formatTime} from '@app/(apps)/dental/lib/helpers'

type TimerParams = {
  examinationId: number
  initialDrStartTime: string | null
  initialDrEndTime: string | null
  initialDhStartTime: string | null
  initialDhEndTime: string | null
}

// HH:MM:SS形式の時刻文字列からDateオブジェクトを生成（今日の日付で）
const parseTimeToDate = (timeStr: string): Date => {
  const [h, m, s] = timeStr.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, s || 0, 0)
  return d
}

// 2つの時刻間の秒数を計算
const calcSecondsBetween = (start: string, end: string): number => {
  const s = parseTimeToDate(start)
  const e = parseTimeToDate(end)
  return Math.max(0, Math.floor((e.getTime() - s.getTime()) / 1000))
}

// 開始時刻から現在までの秒数を計算
const calcSecondsFromStart = (start: string): number => {
  const s = parseTimeToDate(start)
  const now = new Date()
  return Math.max(0, Math.floor((now.getTime() - s.getTime()) / 1000))
}

export const useConsultationTimer = ({
  examinationId,
  initialDrStartTime,
  initialDrEndTime,
  initialDhStartTime,
  initialDhEndTime,
}: TimerParams) => {
  // 初期秒数を計算
  const calcInitialSeconds = (start: string | null, end: string | null) => {
    if (!start) return 0
    if (end) return calcSecondsBetween(start, end)
    return calcSecondsFromStart(start)
  }

  const [drSeconds, setDrSeconds] = useState(() => calcInitialSeconds(initialDrStartTime, initialDrEndTime))
  const [dhSeconds, setDhSeconds] = useState(() => calcInitialSeconds(initialDhStartTime, initialDhEndTime))
  // running = 開始済みかつ未終了
  const [drRunning, setDrRunning] = useState(() => !!initialDrStartTime && !initialDrEndTime)
  const [dhRunning, setDhRunning] = useState(() => !!initialDhStartTime && !initialDhEndTime)

  const [drStartTime, setDrStartTime] = useState<string | null>(initialDrStartTime)
  const [drEndTime, setDrEndTime] = useState<string | null>(initialDrEndTime)
  const [dhStartTime, setDhStartTime] = useState<string | null>(initialDhStartTime)
  const [dhEndTime, setDhEndTime] = useState<string | null>(initialDhEndTime)

  const drIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const dhIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // ページロード時: running状態ならsetIntervalを再開
  useEffect(() => {
    if (drRunning && !drIntervalRef.current) {
      drIntervalRef.current = setInterval(() => setDrSeconds(s => s + 1), 1000)
    }
    if (dhRunning && !dhIntervalRef.current) {
      dhIntervalRef.current = setInterval(() => setDhSeconds(s => s + 1), 1000)
    }
    return () => {
      if (drIntervalRef.current) clearInterval(drIntervalRef.current)
      if (dhIntervalRef.current) clearInterval(dhIntervalRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDr = useCallback(async () => {
    const now = formatTime(new Date())
    try {
      if (drRunning) {
        // STOP
        if (drIntervalRef.current) clearInterval(drIntervalRef.current)
        drIntervalRef.current = null
        setDrEndTime(now)
        setDrRunning(false)
        await saveTimerEvent({examinationId, timerType: 'dr', actionType: 'stop', previousValue: drStartTime, newValue: now})
        await saveTimerTime({examinationId, field: 'drEndTime', value: now})
      } else {
        // START
        setDrStartTime(now)
        setDrEndTime(null)
        setDrSeconds(0)
        setDrRunning(true)
        drIntervalRef.current = setInterval(() => setDrSeconds(s => s + 1), 1000)
        await saveTimerEvent({examinationId, timerType: 'dr', actionType: 'start', previousValue: null, newValue: now})
        await saveTimerTime({examinationId, field: 'drStartTime', value: now})
        await saveTimerTime({examinationId, field: 'drEndTime', value: null})
      }
    } catch (e) {
      console.error('タイマー保存失敗(DR):', e)
    }
  }, [drRunning, drStartTime, examinationId])

  const toggleDh = useCallback(async () => {
    const now = formatTime(new Date())
    try {
      if (dhRunning) {
        if (dhIntervalRef.current) clearInterval(dhIntervalRef.current)
        dhIntervalRef.current = null
        setDhEndTime(now)
        setDhRunning(false)
        await saveTimerEvent({examinationId, timerType: 'dh', actionType: 'stop', previousValue: dhStartTime, newValue: now})
        await saveTimerTime({examinationId, field: 'dhEndTime', value: now})
      } else {
        setDhStartTime(now)
        setDhEndTime(null)
        setDhSeconds(0)
        setDhRunning(true)
        dhIntervalRef.current = setInterval(() => setDhSeconds(s => s + 1), 1000)
        await saveTimerEvent({examinationId, timerType: 'dh', actionType: 'start', previousValue: null, newValue: now})
        await saveTimerTime({examinationId, field: 'dhStartTime', value: now})
        await saveTimerTime({examinationId, field: 'dhEndTime', value: null})
      }
    } catch (e) {
      console.error('タイマー保存失敗(DH):', e)
    }
  }, [dhRunning, dhStartTime, examinationId])

  // 手動変更
  const manualEditDrStart = useCallback(async (newTime: string) => {
    try {
      const prevValue = drStartTime
      setDrStartTime(newTime)
      if (drRunning) {
        setDrSeconds(calcSecondsFromStart(newTime))
      } else if (drEndTime) {
        setDrSeconds(calcSecondsBetween(newTime, drEndTime))
      }
      await saveTimerEvent({examinationId, timerType: 'dr', actionType: 'manual_edit', previousValue: prevValue, newValue: newTime})
      await saveTimerTime({examinationId, field: 'drStartTime', value: newTime})
    } catch (e) {
      console.error('タイマー手動変更保存失敗:', e)
    }
  }, [drStartTime, drRunning, drEndTime, examinationId])

  const manualEditDrEnd = useCallback(async (newTime: string) => {
    try {
      const prevValue = drEndTime
      setDrEndTime(newTime)
      if (drStartTime) {
        setDrSeconds(calcSecondsBetween(drStartTime, newTime))
      }
      await saveTimerEvent({examinationId, timerType: 'dr', actionType: 'manual_edit', previousValue: prevValue, newValue: newTime})
      await saveTimerTime({examinationId, field: 'drEndTime', value: newTime})
    } catch (e) {
      console.error('タイマー手動変更保存失敗:', e)
    }
  }, [drEndTime, drStartTime, examinationId])

  const manualEditDhStart = useCallback(async (newTime: string) => {
    try {
      const prevValue = dhStartTime
      setDhStartTime(newTime)
      if (dhRunning) {
        setDhSeconds(calcSecondsFromStart(newTime))
      } else if (dhEndTime) {
        setDhSeconds(calcSecondsBetween(newTime, dhEndTime))
      }
      await saveTimerEvent({examinationId, timerType: 'dh', actionType: 'manual_edit', previousValue: prevValue, newValue: newTime})
      await saveTimerTime({examinationId, field: 'dhStartTime', value: newTime})
    } catch (e) {
      console.error('タイマー手動変更保存失敗:', e)
    }
  }, [dhStartTime, dhRunning, dhEndTime, examinationId])

  const manualEditDhEnd = useCallback(async (newTime: string) => {
    try {
      const prevValue = dhEndTime
      setDhEndTime(newTime)
      if (dhStartTime) {
        setDhSeconds(calcSecondsBetween(dhStartTime, newTime))
      }
      await saveTimerEvent({examinationId, timerType: 'dh', actionType: 'manual_edit', previousValue: prevValue, newValue: newTime})
      await saveTimerTime({examinationId, field: 'dhEndTime', value: newTime})
    } catch (e) {
      console.error('タイマー手動変更保存失敗:', e)
    }
  }, [dhEndTime, dhStartTime, examinationId])

  // ページ離脱時にrunning中のタイマーを保存
  // beforeunloadではasync処理が完了しない可能性があるため、visibilitychangeも併用
  useEffect(() => {
    const savePendingTimers = () => {
      const now = formatTime(new Date())
      if (drRunning) {
        saveTimerTime({examinationId, field: 'drEndTime', value: now})
      }
      if (dhRunning) {
        saveTimerTime({examinationId, field: 'dhEndTime', value: now})
      }
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') savePendingTimers()
    }
    window.addEventListener('beforeunload', savePendingTimers)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('beforeunload', savePendingTimers)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [drRunning, dhRunning, examinationId])

  return {
    drSeconds, dhSeconds, drRunning, dhRunning,
    toggleDr, toggleDh, setDrSeconds, setDhSeconds,
    drStartTime, drEndTime, dhStartTime, dhEndTime,
    manualEditDrStart, manualEditDrEnd, manualEditDhStart, manualEditDhEnd,
  }
}
