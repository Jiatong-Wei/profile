import { motion } from 'motion/react'
import { BlogPreview } from '@/components/blog-preview'
import { useWriteData } from '../hooks/use-write-data'
import type { PublishForm } from '../types'
import { PRESSABLE_HOVER, PRESSABLE_TAP } from '@/lib/motion'

type WritePreviewProps = {
	form: PublishForm
	coverPreviewUrl: string | null
	onClose: () => void
	slug?: string
}

export function WritePreview({ form, coverPreviewUrl, onClose, slug }: WritePreviewProps) {
	const previewData = useWriteData()
	return (
		<div>
			<div onClick={e => e.stopPropagation()}>
				<BlogPreview
					markdown={previewData.markdown}
					title={previewData.title}
					tags={form.tags}
					date={previewData.date}
					summary={form.summary}
					cover={coverPreviewUrl || undefined}
					slug={slug}
				/>
			</div>
			<motion.button
				initial={{ opacity: 0, scale: 0.96 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
				whileHover={PRESSABLE_HOVER}
				whileTap={PRESSABLE_TAP}
				className='fixed top-24 right-6 z-50 rounded-xl border bg-white/60 px-6 py-2 text-sm'
				onClick={onClose}>
				关闭预览
			</motion.button>
		</div>
	)
}
