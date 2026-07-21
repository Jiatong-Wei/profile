'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { type AvatarItem } from './components/avatar-upload-dialog'
import { BloggerCard } from './components/blogger-card'
import { PageHeader } from '@/components/page-header'
import { SELECTION_SPRING, SPRING_LAYOUT } from '@/lib/motion'

export type BloggerStatus = 'recent' | 'disconnected'

export interface Blogger {
	name: string
	avatar: string
	url: string
	description: string
	stars: number
	status?: BloggerStatus
}

interface GridViewProps {
	bloggers: Blogger[]
	isEditMode?: boolean
	onUpdate?: (blogger: Blogger, oldBlogger: Blogger, avatarItem?: AvatarItem) => void
	onDelete?: (blogger: Blogger) => void
}

export default function GridView({ bloggers, isEditMode = false, onUpdate, onDelete }: GridViewProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedCategory, setSelectedCategory] = useState<BloggerStatus>('recent')
	const [hasFiltered, setHasFiltered] = useState(false)

	const filteredBloggers = bloggers.filter(blogger => {
		const status = blogger.status ?? 'recent'
		const matchesCategory = status === selectedCategory
		const matchesSearch = blogger.name.toLowerCase().includes(searchTerm.toLowerCase()) || blogger.description.toLowerCase().includes(searchTerm.toLowerCase())
		return matchesCategory && matchesSearch
	})

	return (
		<div className='public-page mx-auto w-full max-w-7xl px-6 pt-28 max-sm:px-4 max-sm:pt-7'>
			<PageHeader title='优秀博客' meta={`${filteredBloggers.length} / ${bloggers.length} 位博主`} />
			<div className='mb-8 space-y-4'>
				<input
					type='text'
					placeholder='搜索博主...'
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
							setSelectedCategory('recent')
						}}
						className={`filter-chip ${selectedCategory === 'recent' ? 'is-selected' : ''}`}>
						{selectedCategory === 'recent' && <motion.span layoutId='blogger-filter-selection' className='filter-chip-selection' transition={SELECTION_SPRING} />}
						<span>近期更新</span>
					</motion.button>
					<motion.button
						onClick={() => {
							setHasFiltered(true)
							setSelectedCategory('disconnected')
						}}
						className={`filter-chip ${selectedCategory === 'disconnected' ? 'is-selected' : ''}`}>
						{selectedCategory === 'disconnected' && (
							<motion.span layoutId='blogger-filter-selection' className='filter-chip-selection' transition={SELECTION_SPRING} />
						)}
						<span>长期失联</span>
					</motion.button>
				</div>
			</div>

			<motion.div layout className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3' transition={{ layout: SPRING_LAYOUT }}>
				<AnimatePresence mode='popLayout'>
					{filteredBloggers.map((blogger, index) => (
						<BloggerCard
							key={blogger.url}
							blogger={blogger}
							index={index}
							stagger={!hasFiltered}
							isEditMode={isEditMode}
							onUpdate={onUpdate}
							onDelete={() => onDelete?.(blogger)}
						/>
					))}
				</AnimatePresence>
			</motion.div>

			{filteredBloggers.length === 0 && (
				<div className='mt-12 text-center text-gray-500'>
					<p>没有找到相关博主</p>
				</div>
			)}
		</div>
	)
}
