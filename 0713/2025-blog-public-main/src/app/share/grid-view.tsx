'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { type LogoItem } from './components/logo-upload-dialog'
import { ShareCard, type Share } from './components/share-card'
import { PageHeader } from '@/components/page-header'
import { SELECTION_SPRING, SPRING_LAYOUT } from '@/lib/motion'

interface GridViewProps {
	shares: Share[]
	isEditMode?: boolean
	onUpdate?: (share: Share, oldShare: Share, logoItem?: LogoItem) => void
	onDelete?: (share: Share) => void
}

export default function GridView({ shares, isEditMode = false, onUpdate, onDelete }: GridViewProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedTag, setSelectedTag] = useState<string>('all')
	const [hasFiltered, setHasFiltered] = useState(false)

	const allTags = Array.from(new Set(shares.flatMap(share => share.tags)))

	const filteredShares = shares.filter(share => {
		const matchesSearch = share.name.toLowerCase().includes(searchTerm.toLowerCase()) || share.description.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesTag = selectedTag === 'all' || share.tags.includes(selectedTag)
		return matchesSearch && matchesTag
	})

	return (
		<div className='public-page mx-auto w-full max-w-7xl px-6 pt-28 max-sm:px-4 max-sm:pt-7'>
			<PageHeader title='推荐分享' meta={`${filteredShares.length} / ${shares.length} 项资源`} />
			<div className='mb-8 space-y-4'>
				<input
					type='text'
					placeholder='搜索资源...'
					value={searchTerm}
					onChange={e => {
						setHasFiltered(true)
						setSearchTerm(e.target.value)
					}}
					className='search-field glass-panel glass-quiet mx-auto block w-full max-w-md px-4 py-2.5 focus:outline-none'
				/>

				<div className='filter-chips flex flex-wrap justify-center gap-2'>
					<motion.button
						onClick={() => {
							setHasFiltered(true)
							setSelectedTag('all')
						}}
						className={`filter-chip ${selectedTag === 'all' ? 'is-selected' : ''}`}>
						{selectedTag === 'all' && <motion.span layoutId='share-filter-selection' className='filter-chip-selection' transition={SELECTION_SPRING} />}
						<span>全部</span>
					</motion.button>
					{allTags.map(tag => (
						<motion.button
							key={tag}
							onClick={() => {
								setHasFiltered(true)
								setSelectedTag(tag)
							}}
							className={`filter-chip ${selectedTag === tag ? 'is-selected' : ''}`}>
							{selectedTag === tag && <motion.span layoutId='share-filter-selection' className='filter-chip-selection' transition={SELECTION_SPRING} />}
							<span>{tag}</span>
						</motion.button>
					))}
				</div>
			</div>

			<motion.div layout className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3' transition={{ layout: SPRING_LAYOUT }}>
				<AnimatePresence mode='popLayout'>
					{filteredShares.map((share, index) => (
						<ShareCard
							key={share.url}
							share={share}
							index={index}
							stagger={!hasFiltered}
							isEditMode={isEditMode}
							onUpdate={onUpdate}
							onDelete={() => onDelete?.(share)}
						/>
					))}
				</AnimatePresence>
			</motion.div>

			{filteredShares.length === 0 && (
				<div className='mt-12 text-center text-gray-500'>
					<p>没有找到相关资源</p>
				</div>
			)}
		</div>
	)
}
