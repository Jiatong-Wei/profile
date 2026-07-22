'use client'

import { ANIMATION_DELAY } from '@/consts'
import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { useSize } from '@/hooks/use-size'
import { motion } from 'motion/react'
import { DRAG_SETTLE, PRESSABLE_HOVER, PRESSABLE_TAP, SPRING_LAYOUT, WINDOW_HOVER, windowReveal } from '@/lib/motion'
import { useLayoutEditStore, type CardKey } from '@/app/(home)/stores/layout-edit-store'

export type GlassTone = 'primary' | 'standard' | 'quiet'
export type MotionRole = 'window' | 'pressable' | 'static'

interface Props {
	cardKey: CardKey
	className?: string
	order: number
	width: number
	height?: number
	x: number
	y: number
	children: React.ReactNode
	glassTone?: GlassTone
	interactiveGlass?: boolean
	motionRole?: MotionRole
}

export default function Card({
	cardKey,
	children,
	order,
	width,
	height,
	x,
	y,
	className,
	glassTone = 'standard',
	interactiveGlass = false,
	motionRole = 'window'
}: Props) {
	const { maxSM, init } = useSize()
	const editing = useLayoutEditStore(state => state.editing)
	const interacting = useLayoutEditStore(state => state.interacting)
	const interaction = useLayoutEditStore(state => state.interaction)
	const isActiveCard = interaction?.cardKey === cardKey
	const isDragging = isActiveCard && (interaction.phase === 'dragging' || interaction.phase === 'resizing')
	const isSettling = isActiveCard && interaction.phase === 'settling'
	const revealOrder = maxSM && init ? 0 : Math.max(0, order - 1)
	const delay = Math.min(revealOrder * Math.min(ANIMATION_DELAY, 0.03), 0.16)
	const style = {
		left: x,
		top: y,
		width,
		height
	} as CSSProperties
	const canHover = init && !maxSM && motionRole !== 'static'
	const whileHover = canHover ? (motionRole === 'pressable' ? PRESSABLE_HOVER : WINDOW_HOVER) : undefined
	const whileTap = motionRole === 'pressable' ? PRESSABLE_TAP : undefined

	if (!init) return null

	return (
		<motion.div
			layout={editing && !interacting ? 'position' : false}
			layoutDependency={`${x}:${y}:${width}:${height ?? 'auto'}`}
			variants={windowReveal(delay)}
			initial='hidden'
			animate='visible'
			whileHover={whileHover}
			whileTap={whileTap}
			transition={{ layout: isSettling ? DRAG_SETTLE : SPRING_LAYOUT }}
			className={cn(
				'card motion-surface squircle',
				`glass-${glassTone}`,
				`motion-${motionRole}`,
				interactiveGlass && 'glass-interactive',
				isDragging && 'is-layout-dragging',
				isSettling && 'is-layout-settling',
				className
			)}
			style={style}
			onPointerMove={
				interactiveGlass
					? event => {
							if (event.pointerType !== 'mouse') return
							const rect = event.currentTarget.getBoundingClientRect()
							const xPercent = ((event.clientX - rect.left) / rect.width) * 100
							const yPercent = ((event.clientY - rect.top) / rect.height) * 100
							event.currentTarget.style.setProperty('--glass-x', `${xPercent}%`)
							event.currentTarget.style.setProperty('--glass-y', `${yPercent}%`)
						}
					: undefined
			}
			onPointerLeave={
				interactiveGlass
					? event => {
							event.currentTarget.style.setProperty('--glass-x', '50%')
							event.currentTarget.style.setProperty('--glass-y', '18%')
						}
					: undefined
			}>
			{children}
		</motion.div>
	)
}
