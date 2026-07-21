'use client'

import { motion } from 'motion/react'
import { pageReveal } from '@/lib/motion'
import { cn } from '@/lib/utils'

type PageHeaderProps = {
	title: string
	meta?: string
	className?: string
}

export function PageHeader({ title, meta, className }: PageHeaderProps) {
	return (
		<motion.header variants={pageReveal} initial='hidden' animate='visible' className={cn('page-header', className)}>
			<h1>{title}</h1>
			{meta && <p>{meta}</p>}
		</motion.header>
	)
}
