'use client'
import {useState, useRef, useCallback, useEffect} from 'react'

export const useConsultationTimer = () => {
  const [drSeconds, setDrSeconds] = useState(0)
  const [dhSeconds, setDhSeconds] = useState(0)
  const [drRunning, setDrRunning] = useState(false)
  const [dhRunning, setDhRunning] = useState(false)
  const drIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const dhIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const toggleDr = useCallback(() => {
    if (drRunning) {
      if (drIntervalRef.current) clearInterval(drIntervalRef.current)
      drIntervalRef.current = null
    } else {
      drIntervalRef.current = setInterval(() => setDrSeconds(s => s + 1), 1000)
    }
    setDrRunning(prev => !prev)
  }, [drRunning])

  const toggleDh = useCallback(() => {
    if (dhRunning) {
      if (dhIntervalRef.current) clearInterval(dhIntervalRef.current)
      dhIntervalRef.current = null
    } else {
      dhIntervalRef.current = setInterval(() => setDhSeconds(s => s + 1), 1000)
    }
    setDhRunning(prev => !prev)
  }, [dhRunning])

  useEffect(() => {
    return () => {
      if (drIntervalRef.current) clearInterval(drIntervalRef.current)
      if (dhIntervalRef.current) clearInterval(dhIntervalRef.current)
    }
  }, [])

  return {drSeconds, dhSeconds, drRunning, dhRunning, toggleDr, toggleDh, setDrSeconds, setDhSeconds}
}
