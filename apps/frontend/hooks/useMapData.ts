"use client"
import { useState } from 'react'
import type { Point } from '../types'

export function useMapData(initialPoints: Point[] = []) {
  const [points, setPoints] = useState<Point[]>(initialPoints)

  async function onMove(bounds: [number, number, number, number]) {
    try {
      const res = await fetch(`/api/points?bbox=${bounds.join(',')}`)
      if (!res.ok) return
      const data = await res.json()
      setPoints(data)
    } catch (e) {
      console.error(e)
    }
  }

  return { points, onMove }
}
