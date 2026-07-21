'use client'

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { APPLE_EASE_OUT, SPRING_SNAPPY } from '@/lib/motion'

const FIRST_COVER_HOVER_DELAY_MS = 350
const COVER_HOVER_SESSION_MS = 600
const PREVIEW_OFFSET_PX = 16

export type BlogCoverPreviewState = { src: string; pointerX: number; pointerY: number } | null

export function useBlogCoverHover(editMode: boolean) {
	const [hoverCoverPreview, setHoverCoverPreview] = useState<BlogCoverPreviewState>(null)
	const coverHoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const sessionActiveRef = useRef(false)

	const clearCoverHoverSchedule = useCallback(() => {
		if (coverHoverTimerRef.current !== null) {
			clearTimeout(coverHoverTimerRef.current)
			coverHoverTimerRef.current = null
		}
	}, [])

	const cancelCoverPreview = useCallback(() => {
		clearCoverHoverSchedule()
		setHoverCoverPreview(null)
		if (!sessionActiveRef.current) return
		if (sessionTimerRef.current !== null) clearTimeout(sessionTimerRef.current)
		sessionTimerRef.current = setTimeout(() => {
			sessionActiveRef.current = false
			sessionTimerRef.current = null
		}, COVER_HOVER_SESSION_MS)
	}, [clearCoverHoverSchedule])

	useEffect(() => {
		return () => {
			clearCoverHoverSchedule()
			if (sessionTimerRef.current !== null) clearTimeout(sessionTimerRef.current)
		}
	}, [clearCoverHoverSchedule])

	useEffect(() => {
		if (editMode) cancelCoverPreview()
	}, [editMode, cancelCoverPreview])

	const onCoverLinkMouseEnter = useCallback(
		(cover?: string, pointer?: { x: number; y: number }) => {
			if (editMode || !cover) return
			clearCoverHoverSchedule()
			if (sessionTimerRef.current !== null) {
				clearTimeout(sessionTimerRef.current)
				sessionTimerRef.current = null
			}
			const showPreview = () => {
				coverHoverTimerRef.current = null
				sessionActiveRef.current = true
				setHoverCoverPreview({ src: cover, pointerX: pointer?.x ?? 0, pointerY: pointer?.y ?? 0 })
			}
			if (sessionActiveRef.current) {
				showPreview()
				return
			}
			coverHoverTimerRef.current = setTimeout(() => {
				showPreview()
			}, FIRST_COVER_HOVER_DELAY_MS)
		},
		[editMode, clearCoverHoverSchedule]
	)

	return {
		cancelCoverPreview,
		onCoverLinkMouseEnter,
		hoverCoverPreview
	}
}

type BlogCoverHoverPreviewProps = {
	preview: BlogCoverPreviewState
}

export function BlogCoverHoverPreview({ preview }: BlogCoverHoverPreviewProps) {
	const pointerX = useMotionValue(-240)
	const pointerY = useMotionValue(-240)
	const x = useSpring(pointerX, { stiffness: 420, damping: 38, mass: 0.75 })
	const y = useSpring(pointerY, { stiffness: 420, damping: 38, mass: 0.75 })
	const previewRef = useRef<HTMLDivElement>(null)
	const hasPositionRef = useRef(false)
	const reduceMotion = useReducedMotion()

	useEffect(() => {
		if (!preview) return
		const updatePosition = (clientX: number, clientY: number) => {
			const width = previewRef.current?.offsetWidth ?? 180
			const height = previewRef.current?.offsetHeight ?? 120
			const preferredX = clientX + PREVIEW_OFFSET_PX
			const preferredY = clientY + PREVIEW_OFFSET_PX
			const nextX = Math.max(12, Math.min(preferredX, window.innerWidth - width - 12))
			const nextY = Math.max(12, preferredY + height > window.innerHeight - 12 ? clientY - height - PREVIEW_OFFSET_PX : preferredY)
			if (!hasPositionRef.current) {
				hasPositionRef.current = true
				pointerX.jump(nextX)
				pointerY.jump(nextY)
				x.jump(nextX)
				y.jump(nextY)
				return
			}
			pointerX.set(nextX)
			pointerY.set(nextY)
		}
		const handleMouseMove = (event: MouseEvent) => {
			updatePosition(event.clientX, event.clientY)
		}
		updatePosition(preview.pointerX, preview.pointerY)
		window.addEventListener('mousemove', handleMouseMove, { passive: true })
		return () => window.removeEventListener('mousemove', handleMouseMove)
	}, [pointerX, pointerY, preview, x, y])

	return (
		<AnimatePresence mode='popLayout'>
			{preview && (
				<motion.div
					ref={previewRef}
					key={preview.src}
					initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
					transition={{
						opacity: { duration: reduceMotion ? 0.12 : 0.16, ease: APPLE_EASE_OUT },
						scale: reduceMotion ? { duration: 0 } : SPRING_SNAPPY
					}}
					className='glass-panel glass-primary pointer-events-none fixed top-0 left-0 z-100 min-h-[80px] w-[180px] overflow-hidden rounded-[18px] p-3 shadow-sm'
					style={{ x, y }}>
					<img src={preview.src} alt='' className='w-full rounded-xl object-cover' draggable={false} />
				</motion.div>
			)}
		</AnimatePresence>
	)
}
