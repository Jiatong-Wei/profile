'use client'

import Live2DViewer from './live2d-viewer'
import { PageHeader } from '@/components/page-header'
import { motion } from 'motion/react'
import { pageReveal } from '@/lib/motion'

export default function Live2DPage() {
	return (
		<div className='public-page mx-auto w-full max-w-[760px] px-6 pt-28 max-sm:px-4 max-sm:pt-7'>
			<PageHeader title='Live2D' className='max-w-[720px]' />
			<motion.div
				variants={pageReveal}
				initial='hidden'
				animate='visible'
				className='card glass-primary relative mx-auto aspect-square w-full max-w-[680px] overflow-hidden rounded-[18px] p-0'>
				<Live2DViewer />
			</motion.div>
		</div>
	)
}
