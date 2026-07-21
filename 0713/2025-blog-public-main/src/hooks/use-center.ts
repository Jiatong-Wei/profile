'use client'

import { useEffect } from 'react'
import { create } from 'zustand'
import { snapToHomeGrid } from '@/consts'

type CenterState = {
	x: number
	y: number
	centerX: number
	centerY: number
	width: number
	height: number
	setCenter: (x: number, y: number) => void
	recalc: () => void
}

const initialCenter = {
	x: 720,
	y: 426,
	centerX: 720,
	centerY: 450,
	width: 1440,
	height: 900
}

const computeCenter = () => {
	if (typeof window === 'undefined') {
		return initialCenter
	}
	const width = window.innerWidth
	const height = window.innerHeight
	const y = snapToHomeGrid(Math.max(Math.floor(height / 2) - 24, 396))
	return {
		x: snapToHomeGrid(Math.floor(width / 2)),
		y,
		centerX: snapToHomeGrid(Math.floor(width / 2)),
		centerY: snapToHomeGrid(Math.floor(height / 2)),
		width,
		height
	}
}

export const useCenterStore = create<CenterState>(set => ({
	...initialCenter,
	setCenter: (x, y) => set({ x, y }),
	recalc: () => {
		const c = computeCenter()
		set({ x: c.x, y: c.y, width: c.width, height: c.height, centerX: c.centerX, centerY: c.centerY })
	}
}))

export function useCenterInit() {
	useEffect(() => {
		const update = () => useCenterStore.getState().recalc()
		update()
		window.addEventListener('resize', update)
		return () => window.removeEventListener('resize', update)
	}, [])
}
