'use client'

import { useCallback, useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { HOME_GRID, snapToHomeGrid } from '@/consts'
import { useCenterStore } from '@/hooks/use-center'
import { useLayoutEditStore } from './stores/layout-edit-store'
import type { CardStyles } from './stores/config-store'
import DraggerSVG from '@/svgs/dragger.svg'

type CardKey = keyof CardStyles

interface HomeDraggableLayerProps {
	cardKey: CardKey
	x: number
	y: number
	width?: number
	height?: number
	children: React.ReactNode
}

interface DragState {
	pointerId: number | null
	active: boolean
	startX: number
	startY: number
	initialOffsetX: number
	initialOffsetY: number
	latestOffsetX: number
	latestOffsetY: number
}

interface ResizeState {
	pointerId: number | null
	active: boolean
	startX: number
	startY: number
	initialWidth: number
	initialHeight: number
	latestWidth: number
	latestHeight: number
}

const DRAG_THRESHOLD = 8
const MIN_CARD_SIZE = 64

export function HomeDraggableLayer({ cardKey, x, y, width, height, children }: HomeDraggableLayerProps) {
	const editing = useLayoutEditStore(state => state.editing)
	const setInteraction = useLayoutEditStore(state => state.setInteraction)
	const setOffset = useLayoutEditStore(state => state.setOffset)
	const setSize = useLayoutEditStore(state => state.setSize)
	const center = useCenterStore()
	const dragFrameRef = useRef<number | null>(null)
	const resizeFrameRef = useRef<number | null>(null)
	const settleTimerRef = useRef<number | null>(null)
	const keyboardFrameRef = useRef<number | null>(null)
	const dragStateRef = useRef<DragState>({
		pointerId: null,
		active: false,
		startX: 0,
		startY: 0,
		initialOffsetX: 0,
		initialOffsetY: 0,
		latestOffsetX: 0,
		latestOffsetY: 0
	})
	const resizeStateRef = useRef<ResizeState>({
		pointerId: null,
		active: false,
		startX: 0,
		startY: 0,
		initialWidth: 0,
		initialHeight: 0,
		latestWidth: 0,
		latestHeight: 0
	})

	useEffect(
		() => () => {
			if (dragFrameRef.current !== null) window.cancelAnimationFrame(dragFrameRef.current)
			if (resizeFrameRef.current !== null) window.cancelAnimationFrame(resizeFrameRef.current)
			if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current)
			if (keyboardFrameRef.current !== null) window.cancelAnimationFrame(keyboardFrameRef.current)
			setInteraction(null)
		},
		[setInteraction]
	)

	const beginInteraction = useCallback(
		(phase: 'dragging' | 'resizing') => {
			if (settleTimerRef.current !== null) {
				window.clearTimeout(settleTimerRef.current)
				settleTimerRef.current = null
			}
			setInteraction({ cardKey, source: 'pointer', phase })
		},
		[cardKey, setInteraction]
	)

	const settleInteraction = useCallback(() => {
		setInteraction({ cardKey, source: 'pointer', phase: 'settling' })
		if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current)
		settleTimerRef.current = window.setTimeout(() => {
			const interaction = useLayoutEditStore.getState().interaction
			if (interaction?.cardKey === cardKey && interaction.phase === 'settling') setInteraction(null)
			settleTimerRef.current = null
		}, 360)
	}, [cardKey, setInteraction])

	const runKeyboardUpdate = useCallback(
		(update: () => void) => {
			setInteraction({ cardKey, source: 'keyboard', phase: 'dragging' })
			update()
			if (keyboardFrameRef.current !== null) window.cancelAnimationFrame(keyboardFrameRef.current)
			keyboardFrameRef.current = window.requestAnimationFrame(() => {
				const interaction = useLayoutEditStore.getState().interaction
				if (interaction?.cardKey === cardKey && interaction.source === 'keyboard') setInteraction(null)
				keyboardFrameRef.current = null
			})
		},
		[cardKey, setInteraction]
	)

	const scheduleOffset = useCallback(() => {
		if (dragFrameRef.current !== null) return
		dragFrameRef.current = window.requestAnimationFrame(() => {
			dragFrameRef.current = null
			const state = dragStateRef.current
			setOffset(cardKey, Math.round(state.latestOffsetX), Math.round(state.latestOffsetY))
		})
	}, [cardKey, setOffset])

	const scheduleSize = useCallback(() => {
		if (resizeFrameRef.current !== null) return
		resizeFrameRef.current = window.requestAnimationFrame(() => {
			resizeFrameRef.current = null
			const state = resizeStateRef.current
			setSize(cardKey, Math.round(state.latestWidth), Math.round(state.latestHeight))
		})
	}, [cardKey, setSize])

	const handleDragStart = (event: PointerEvent<HTMLDivElement>) => {
		if (!editing || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return
		event.preventDefault()
		event.currentTarget.setPointerCapture(event.pointerId)
		const initialOffsetX = x - center.x
		const initialOffsetY = y - center.y
		dragStateRef.current = {
			pointerId: event.pointerId,
			active: false,
			startX: event.clientX,
			startY: event.clientY,
			initialOffsetX,
			initialOffsetY,
			latestOffsetX: initialOffsetX,
			latestOffsetY: initialOffsetY
		}
	}

	const handleDragMove = (event: PointerEvent<HTMLDivElement>) => {
		const state = dragStateRef.current
		if (state.pointerId !== event.pointerId) return
		const dx = event.clientX - state.startX
		const dy = event.clientY - state.startY
		if (!state.active && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
		if (!state.active) {
			state.active = true
			beginInteraction('dragging')
		}
		state.latestOffsetX = state.initialOffsetX + dx
		state.latestOffsetY = state.initialOffsetY + dy
		scheduleOffset()
	}

	const handleDragEnd = (event: PointerEvent<HTMLDivElement>) => {
		const state = dragStateRef.current
		if (state.pointerId !== event.pointerId) return
		if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
		if (dragFrameRef.current !== null) {
			window.cancelAnimationFrame(dragFrameRef.current)
			dragFrameRef.current = null
		}
		state.pointerId = null
		if (!state.active) return
		state.active = false
		const offsetX = snapToHomeGrid(state.latestOffsetX)
		const offsetY = snapToHomeGrid(state.latestOffsetY)
		settleInteraction()
		window.requestAnimationFrame(() => setOffset(cardKey, offsetX, offsetY))
	}

	const handleResizeStart = (event: PointerEvent<HTMLButtonElement>) => {
		if (!editing || width === undefined || height === undefined || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return
		event.preventDefault()
		event.stopPropagation()
		event.currentTarget.setPointerCapture(event.pointerId)
		resizeStateRef.current = {
			pointerId: event.pointerId,
			active: false,
			startX: event.clientX,
			startY: event.clientY,
			initialWidth: width,
			initialHeight: height,
			latestWidth: width,
			latestHeight: height
		}
	}

	const handleResizeMove = (event: PointerEvent<HTMLButtonElement>) => {
		const state = resizeStateRef.current
		if (state.pointerId !== event.pointerId) return
		const dx = event.clientX - state.startX
		const dy = event.clientY - state.startY
		if (!state.active && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
		if (!state.active) {
			state.active = true
			beginInteraction('resizing')
		}
		state.latestWidth = Math.max(MIN_CARD_SIZE, state.initialWidth + dx)
		state.latestHeight = Math.max(MIN_CARD_SIZE, state.initialHeight + dy)
		scheduleSize()
	}

	const handleResizeEnd = (event: PointerEvent<HTMLButtonElement>) => {
		const state = resizeStateRef.current
		if (state.pointerId !== event.pointerId) return
		if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
		if (resizeFrameRef.current !== null) {
			window.cancelAnimationFrame(resizeFrameRef.current)
			resizeFrameRef.current = null
		}
		state.pointerId = null
		if (!state.active) return
		state.active = false
		const nextWidth = Math.max(MIN_CARD_SIZE, snapToHomeGrid(state.latestWidth))
		const nextHeight = Math.max(MIN_CARD_SIZE, snapToHomeGrid(state.latestHeight))
		settleInteraction()
		window.requestAnimationFrame(() => setSize(cardKey, nextWidth, nextHeight))
	}

	const handlePositionKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		const step = event.shiftKey ? 1 : HOME_GRID
		const delta = getArrowDelta(event.key, step)
		if (!delta) return
		event.preventDefault()
		runKeyboardUpdate(() => setOffset(cardKey, x - center.x + delta.x, y - center.y + delta.y))
	}

	const handleSizeKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		if (width === undefined || height === undefined) return
		const step = event.shiftKey ? 1 : HOME_GRID
		const delta = getArrowDelta(event.key, step)
		if (!delta) return
		event.preventDefault()
		event.stopPropagation()
		runKeyboardUpdate(() => setSize(cardKey, Math.max(MIN_CARD_SIZE, width + delta.x), Math.max(MIN_CARD_SIZE, height + delta.y)))
	}

	const canResize = editing && width !== undefined && height !== undefined

	return (
		<>
			{editing && (
				<div
					tabIndex={0}
					aria-label={`调整 ${cardKey} 卡片位置`}
					className='border-brand/70 bg-brand/5 pointer-events-auto absolute z-40 cursor-move touch-none rounded-[40px] border border-dashed select-none focus-visible:outline-2 focus-visible:outline-offset-2'
					style={{ left: x, top: y, width, height }}
					onKeyDown={handlePositionKeyDown}
					onPointerDown={handleDragStart}
					onPointerMove={handleDragMove}
					onPointerUp={handleDragEnd}
					onPointerCancel={handleDragEnd}>
					<div className='pointer-events-none h-full w-full' />
					{canResize && (
						<button
							type='button'
							aria-label={`调整 ${cardKey} 卡片大小`}
							className='absolute right-0 bottom-0 z-50 grid size-11 translate-x-4 translate-y-4 touch-none place-items-center rounded-full focus-visible:outline-2'
							onKeyDown={handleSizeKeyDown}
							onPointerDown={handleResizeStart}
							onPointerMove={handleResizeMove}
							onPointerUp={handleResizeEnd}
							onPointerCancel={handleResizeEnd}>
							<DraggerSVG className='text-brand size-5' />
						</button>
					)}
				</div>
			)}
			{children}
		</>
	)
}

function getArrowDelta(key: string, step: number) {
	switch (key) {
		case 'ArrowLeft':
			return { x: -step, y: 0 }
		case 'ArrowRight':
			return { x: step, y: 0 }
		case 'ArrowUp':
			return { x: 0, y: -step }
		case 'ArrowDown':
			return { x: 0, y: step }
		default:
			return null
	}
}
