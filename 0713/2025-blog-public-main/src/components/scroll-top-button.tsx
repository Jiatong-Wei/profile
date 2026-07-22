'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { APPLE_EASE_OUT, PRESSABLE_HOVER, PRESSABLE_TAP, SPRING_SNAPPY } from '@/lib/motion'

type ScrollTopButtonProps = {
	className?: string
	delay?: number
}

export function ScrollTopButton({ className, delay }: ScrollTopButtonProps) {
	const [show, setShow] = useState(false)
	const [active, setActive] = useState(false)
	const reduceMotion = useReducedMotion()
	useEffect(() => {
		const timer = window.setTimeout(() => setShow(true), delay || 1000)
		return () => window.clearTimeout(timer)
	}, [delay])

	useEffect(() => {
		const handleScroll = () => {
			setActive(window.scrollY > 200)
		}
		handleScroll()
		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	const handleClick = useCallback(() => {
		window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
	}, [reduceMotion])

	return (
		<AnimatePresence initial={false}>
			{show && active && (
				<motion.button
					initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 }}
					transition={
						reduceMotion
							? { duration: 0.12, ease: APPLE_EASE_OUT }
							: { opacity: { duration: 0.16, ease: APPLE_EASE_OUT }, y: SPRING_SNAPPY, scale: SPRING_SNAPPY }
					}
					whileHover={PRESSABLE_HOVER}
					whileTap={PRESSABLE_TAP}
					onClick={handleClick}
					aria-label='返回顶部'
					title='返回顶部'
					className={cn('glass-panel glass-quiet text-brand-ink scroll-top-button static gap-2 rounded-full p-3 text-sm', className)}>
					<ArrowUp size={22} strokeWidth={2.35} aria-hidden='true' />
				</motion.button>
			)}
		</AnimatePresence>
	)
}
