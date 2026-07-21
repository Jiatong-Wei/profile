'use client'

import { useEffect, useRef, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { APPLE_EASE_OUT } from '@/lib/motion'

type CodeBlockProps = {
	children: React.ReactNode
	code: string
}

export function CodeBlock({ children, code }: CodeBlockProps) {
	const [copied, setCopied] = useState(false)
	const resetTimerRef = useRef<number | null>(null)

	useEffect(() => {
		return () => {
			if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current)
		}
	}, [])

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code)
			setCopied(true)
			if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current)
			resetTimerRef.current = window.setTimeout(() => {
				setCopied(false)
				resetTimerRef.current = null
			}, 2000)
		} catch (error) {
			console.error('Failed to copy code:', error)
		}
	}

	return (
		<div className='code-block-wrapper'>
			<button
				type='button'
				onClick={handleCopy}
				className='code-block-copy-btn'
				aria-label={copied ? '已复制' : '复制代码'}
				title={copied ? '已复制' : '复制代码'}>
				<AnimatePresence initial={false} mode='sync'>
					<motion.span
						key={copied ? 'check' : 'copy'}
						initial={{ opacity: 0, scale: 0.96 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.96 }}
						transition={{ duration: 0.12, ease: APPLE_EASE_OUT }}
						className='absolute inset-0 flex items-center justify-center'>
						{copied ? <Check size={16} aria-hidden='true' /> : <Copy size={16} aria-hidden='true' />}
					</motion.span>
				</AnimatePresence>
			</button>
			{children}
		</div>
	)
}
