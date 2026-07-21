'use client'

import { useId, useState, type KeyboardEvent } from 'react'
import { DialogModal } from '@/components/dialog-modal'
import { withSiteBase } from '@/lib/site-path'
import { motion, useReducedMotion } from 'motion/react'
import { SPRING_NAV } from '@/lib/motion'

type MarkdownImageProps = {
	src: string
	alt?: string
	title?: string
}

export function MarkdownImage({ src, alt = '', title = '' }: MarkdownImageProps) {
	const [display, setDisplay] = useState(false)
	const [placeholderSize, setPlaceholderSize] = useState({ width: 0, height: 0 })
	const reduceMotion = useReducedMotion()
	const imageId = useId()
	const layoutId = reduceMotion ? undefined : `markdown-image:${imageId}`
	const imageSrc = withSiteBase(src)
	const openPreview = (image: HTMLImageElement) => {
		const rect = image.getBoundingClientRect()
		setPlaceholderSize({ width: rect.width, height: rect.height })
		setDisplay(true)
	}
	const handleKeyDown = (event: KeyboardEvent<HTMLImageElement>) => {
		if (event.key !== 'Enter' && event.key !== ' ') return
		event.preventDefault()
		openPreview(event.currentTarget)
	}

	return (
		<>
			{display ? (
				<span className='markdown-image-placeholder' style={{ width: placeholderSize.width, height: placeholderSize.height }} aria-hidden='true' />
			) : (
				<motion.img
					layoutId={layoutId}
					transition={{ layout: SPRING_NAV }}
					src={imageSrc}
					alt={alt}
					title={title}
					loading='lazy'
					role='button'
					tabIndex={0}
					aria-label={alt ? `预览图片：${alt}` : '预览图片'}
					aria-haspopup='dialog'
					onClick={event => openPreview(event.currentTarget)}
					onKeyDown={handleKeyDown}
					className='cursor-pointer transition-opacity hover:opacity-80'
				/>
			)}
			<DialogModal open={display} onClose={() => setDisplay(false)} motionRole='shared' className='max-w-none bg-transparent p-0'>
				<motion.img
					layoutId={layoutId}
					transition={{ layout: SPRING_NAV, opacity: { duration: 0.16 } }}
					initial={reduceMotion ? { opacity: 0 } : false}
					animate={{ opacity: 1 }}
					exit={reduceMotion ? { opacity: 0 } : undefined}
					src={imageSrc}
					alt={alt}
					className='max-h-[90vh] max-w-full rounded-2xl object-contain'
				/>
			</DialogModal>
		</>
	)
}
