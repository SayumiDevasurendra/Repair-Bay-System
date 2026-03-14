import { useState, useEffect, useRef, useCallback } from 'react'
import type { TemperatureReading } from '../types/temperature'
import { deriveStatus } from '../types/temperature'
import { generateReading } from '../utils/temperatureUtils'
import { subscribeToTemperature, IS_DUMMY_TOKEN } from '../services/firebase'

const DEMO_INTERVAL_MS = 2000

function parseReading(raw: unknown): TemperatureReading | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const temp =
    typeof r.temperature_c === 'number'
      ? r.temperature_c
      : parseFloat(r.temperature_c as string)
  if (isNaN(temp)) return null
  const timestamp =
    typeof r.timestamp === 'string'
      ? r.timestamp
      : new Date().toISOString().replace('T', ' ').slice(0, 19)
  const status =
    typeof r.status === 'string' ? r.status : deriveStatus(temp)
  return {
    temperature_c: Math.round(temp * 10) / 10,
    status: status as TemperatureReading['status'],
    timestamp,
  }
}

export function useTemperatureData() {
  const [current, setCurrent]   = useState<TemperatureReading | null>(null)
  const [history, setHistory]   = useState<TemperatureReading[]>([])
  const [alerts, setAlerts]     = useState<Array<TemperatureReading & { id: number }>>([])
  const [paused, setPaused]     = useState(false)
  const [connected, setConnected] = useState(false)
  const alertId   = useRef(1)
  const pausedRef = useRef(paused)
  useEffect(() => { pausedRef.current = paused }, [paused])

  const pushAlert = useCallback((reading: TemperatureReading) => {
    if (reading.status === 'WARNING' || reading.status === 'DANGER') {
      alertId.current += 1
      const id = alertId.current
      setAlerts((prev) => [{ ...reading, id }, ...prev])
    }
  }, [])

  // ── Firebase mode ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (IS_DUMMY_TOKEN) return

    const unsub = subscribeToTemperature(
      (event) => {
        setConnected(true)

        if (event.kind === 'snapshot') {
          // Load ALL historical readings
          const readings = event.readings
            .map(parseReading)
            .filter((r): r is TemperatureReading => r !== null)

          if (readings.length === 0) return

          setHistory(readings)                          // full history, oldest first
          setCurrent(readings[readings.length - 1])     // latest = current

          // Pre-populate alert log with all past WARNING/DANGER entries (newest first)
          const historicAlerts = readings
            .filter((r) => r.status === 'WARNING' || r.status === 'DANGER')
            .reverse()
            .map((r) => ({ ...r, id: ++alertId.current }))
          setAlerts(historicAlerts)

        } else {
          // New single reading from Arduino
          if (pausedRef.current) return
          const reading = parseReading(event.reading)
          if (!reading) return
          setCurrent(reading)
          setHistory((prev) => [...prev, reading])      // append to full history
          pushAlert(reading)
        }
      },
      () => setConnected(false),
    )

    return unsub
  }, [pushAlert])

  // ── Simulator mode ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!IS_DUMMY_TOKEN) return
    if (paused) return
    const interval = setInterval(() => {
      const reading = generateReading()
      setCurrent(reading)
      setHistory((prev) => [...prev, reading])
      pushAlert(reading)
    }, DEMO_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [paused, pushAlert])

  const clearAlerts = () => setAlerts([])

  // Fallback so current is never null in the UI
  const safeCurrent: TemperatureReading = current ?? {
    temperature_c: 0,
    status: 'Normal',
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }

  return {
    current: safeCurrent,
    history,
    alerts,
    paused,
    setPaused,
    clearAlerts,
    connected,
    isLive: !IS_DUMMY_TOKEN,
  }
}
