'use client'

import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import { SHARED_TRANSITION } from '@/lib/motion'

type ArticleMotionTitleProps = {
	slug: string
	as?: 'h1' | 'span'
	children: ReactNode
	className?: string
}

export function ArticleMotionTitle({ slug, as = 'h1', children, className }: ArticleMotionTitleProps) {
	const reduceMotion = useReducedMotion()
	const sharedProps = {
		layoutId: reduceMotion ? undefined : `article-title:${slug}`,
		transition: SHARED_TRANSITION
	}

	if (as === 'span') {
		return (
			<motion.span {...sharedProps} data-article-motion-title className={cn('inline-block max-w-full align-middle', className)}>
				{children}
			</motion.span>
		)
	}

	return (
		<motion.h1 {...sharedProps} data-article-motion-title className={className}>
			{children}
		</motion.h1>
	)
}

type ArticleMotionSurfaceProps = ComponentPropsWithoutRef<typeof motion.article>

export function ArticleMotionSurface({ children, className, ...props }: ArticleMotionSurfaceProps) {
	return (
		<motion.article initial={false} className={className} {...props}>
			{children}
		</motion.article>
	)
}
