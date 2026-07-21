'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { APPLE_EASE_OUT, SPRING_SNAPPY } from '@/lib/motion'

interface DialogModalProps {
	open: boolean
	onClose: () => void
	children: ReactNode
	className?: string
	overlayClassName?: string
	disableCloseOnOverlay?: boolean
	lockScroll?: boolean
	closeOnEsc?: boolean
	motionRole?: 'modal' | 'shared'
}

export function DialogModal({
	open,
	onClose,
	children,
	className,
	overlayClassName,
	disableCloseOnOverlay = false,
	lockScroll = true,
	closeOnEsc = true,
	motionRole = 'modal'
}: DialogModalProps) {
	const [mounted, setMounted] = useState(false)
	const reduceMotion = useReducedMotion()
	const shared = motionRole === 'shared'

	useEffect(() => {
		setMounted(true)
	}, [])

	useEffect(() => {
		if (!lockScroll || !open) return
		const previous = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = previous
		}
	}, [lockScroll, open])

	useEffect(() => {
		if (!closeOnEsc || !open) return
		const handler = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose()
			}
		}
		window.addEventListener('keydown', handler)
		return () => {
			window.removeEventListener('keydown', handler)
		}
	}, [closeOnEsc, onClose, open])

	if (!mounted) return null

	return createPortal(
		<AnimatePresence>
			{open && (
				<motion.div
					className={cn('dialog-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4', overlayClassName)}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: reduceMotion ? 0.12 : shared ? 0.22 : 0.16, ease: APPLE_EASE_OUT }}
					onClick={disableCloseOnOverlay ? undefined : onClose}>
					<motion.div
						role='dialog'
						aria-modal='true'
						className={cn('dialog-modal-content static', className)}
						initial={shared ? false : reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={shared ? { opacity: 1 } : reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }}
						transition={
							shared
								? { duration: reduceMotion ? 0.12 : 0.28 }
								: reduceMotion
									? { duration: 0.12, ease: APPLE_EASE_OUT }
									: { opacity: { duration: 0.16, ease: APPLE_EASE_OUT }, y: SPRING_SNAPPY, scale: SPRING_SNAPPY }
						}
						onClick={event => event.stopPropagation()}>
						{children}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	)
}
