'use client'

import { motion } from 'motion/react'
import StarRating from '@/components/star-rating'
import { useSize } from '@/hooks/use-size'
import { cn } from '@/lib/utils'
import EditableStarRating from '@/components/editable-star-rating'
import { forwardRef, useState } from 'react'
import LogoUploadDialog, { type LogoItem } from './logo-upload-dialog'
import { APPLE_EASE_OUT, SPRING_LAYOUT, WINDOW_HOVER } from '@/lib/motion'

export interface Share {
	name: string
	logo: string
	url: string
	description: string
	tags: string[]
	stars: number
}

interface ShareCardProps {
	share: Share
	index?: number
	stagger?: boolean
	isEditMode?: boolean
	onUpdate?: (share: Share, oldShare: Share, logoItem?: LogoItem) => void
	onDelete?: () => void
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
	{ share, index = 0, stagger = true, isEditMode = false, onUpdate, onDelete },
	ref
) {
	const [expanded, setExpanded] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const { maxSM } = useSize()
	const [localShare, setLocalShare] = useState(share)
	const [showLogoDialog, setShowLogoDialog] = useState(false)
	const [logoItem, setLogoItem] = useState<LogoItem | null>(null)
	const [logoFailed, setLogoFailed] = useState(false)

	const handleFieldChange = (field: keyof Share, value: any) => {
		const updated = { ...localShare, [field]: value }
		setLocalShare(updated)
		onUpdate?.(updated, share, logoItem || undefined)
	}

	const handleLogoSubmit = (logo: LogoItem) => {
		setLogoItem(logo)
		setLogoFailed(false)
		const logoUrl = logo.type === 'url' ? logo.url : logo.previewUrl
		const updated = { ...localShare, logo: logoUrl }
		setLocalShare(updated)
		onUpdate?.(updated, share, logo)
	}

	const handleTagsChange = (tagsStr: string) => {
		const tags = tagsStr
			.split(',')
			.map(t => t.trim())
			.filter(t => t)
		handleFieldChange('tags', tags)
	}

	const handleCancel = () => {
		setLocalShare(share)
		setIsEditing(false)
		setLogoItem(null)
	}

	const canEdit = isEditMode && isEditing

	return (
		<motion.div
			ref={ref}
			layout
			initial={{ opacity: 0, y: 10, scale: 0.98 }}
			{...(maxSM ? { animate: { opacity: 1, y: 0, scale: 1 } } : { whileInView: { opacity: 1, y: 0, scale: 1 }, viewport: { once: true, amount: 0.15 } })}
			exit={{ opacity: 0, y: -4, scale: 0.99, transition: { duration: 0.16, ease: APPLE_EASE_OUT } }}
			whileHover={!isEditMode && !maxSM ? WINDOW_HOVER : undefined}
			transition={{ layout: SPRING_LAYOUT, duration: 0.22, delay: stagger ? Math.min(index, 6) * 0.04 : 0, ease: APPLE_EASE_OUT }}
			className='card glass-standard relative block overflow-hidden rounded-[18px]'>
			{isEditMode && (
				<div className='absolute top-3 right-3 z-10 flex gap-2'>
					{isEditing ? (
						<>
							<button onClick={handleCancel} className='rounded-lg px-2 py-1.5 text-xs text-gray-400 transition-colors hover:text-gray-600'>
								取消
							</button>
							<button onClick={() => setIsEditing(false)} className='rounded-lg px-2 py-1.5 text-xs text-blue-400 transition-colors hover:text-blue-600'>
								完成
							</button>
						</>
					) : (
						<>
							<button onClick={() => setIsEditing(true)} className='rounded-lg px-2 py-1.5 text-xs text-blue-400 transition-colors hover:text-blue-600'>
								编辑
							</button>
							<button onClick={onDelete} className='rounded-lg px-2 py-1.5 text-xs text-red-400 transition-colors hover:text-red-600'>
								删除
							</button>
						</>
					)}
				</div>
			)}

			<div>
				<div className='mb-4 flex items-center gap-4'>
					<div className='group relative'>
						{localShare.logo && !logoFailed ? (
							<img
								src={localShare.logo}
								alt={localShare.name}
								className={cn('h-16 w-16 rounded-xl object-cover', canEdit && 'cursor-pointer')}
								onError={() => setLogoFailed(true)}
								onClick={() => canEdit && setShowLogoDialog(true)}
							/>
						) : (
							<button
								type='button'
								className={cn(
									'bg-brand/10 text-brand flex h-16 w-16 items-center justify-center rounded-xl text-lg font-semibold',
									canEdit && 'cursor-pointer'
								)}
								onClick={() => canEdit && setShowLogoDialog(true)}>
								{localShare.name.slice(0, 2).toUpperCase()}
							</button>
						)}
						{canEdit && (
							<div className='ev pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
								<span className='text-xs text-white'>更换</span>
							</div>
						)}
					</div>
					<div className='flex-1'>
						<h3
							contentEditable={canEdit}
							suppressContentEditableWarning
							onBlur={e => handleFieldChange('name', e.currentTarget.textContent || '')}
							className={cn('group-hover:text-brand text-lg font-bold transition-colors focus:outline-none', canEdit && 'cursor-text')}>
							{localShare.name}
						</h3>
						{canEdit ? (
							<div
								contentEditable
								suppressContentEditableWarning
								onBlur={e => handleFieldChange('url', e.currentTarget.textContent || '')}
								className='text-secondary mt-1 block max-w-[200px] cursor-text truncate text-xs focus:outline-none'>
								{localShare.url}
							</div>
						) : (
							<a
								href={localShare.url}
								target='_blank'
								rel='noopener noreferrer'
								className='text-secondary hover:text-brand mt-1 block max-w-[200px] truncate text-xs hover:underline'>
								{localShare.url}
							</a>
						)}
					</div>
				</div>

				{canEdit ? (
					<EditableStarRating stars={localShare.stars} editable={true} onChange={stars => handleFieldChange('stars', stars)} />
				) : (
					<StarRating stars={localShare.stars} />
				)}

				<div className='mt-3 flex flex-wrap gap-1.5'>
					{canEdit ? (
						<input
							type='text'
							value={localShare.tags.join(', ')}
							onChange={e => handleTagsChange(e.target.value)}
							placeholder='标签，用逗号分隔'
							className='w-full rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-xs focus:outline-none'
						/>
					) : (
						localShare.tags.map(tag => (
							<span key={tag} className='bg-secondary/10 rounded-full px-2.5 py-0.5 text-xs'>
								{tag}
							</span>
						))
					)}
				</div>

				<motion.p
					layout='position'
					transition={{ layout: SPRING_LAYOUT }}
					contentEditable={canEdit}
					suppressContentEditableWarning
					onBlur={e => handleFieldChange('description', e.currentTarget.textContent || '')}
					onClick={e => {
						if (!canEdit) {
							e.preventDefault()
							setExpanded(!expanded)
						}
					}}
					className={cn(
						'mt-3 text-sm leading-relaxed text-gray-600 transition-colors focus:outline-none',
						canEdit ? 'cursor-text' : 'cursor-pointer',
						!canEdit && (expanded ? 'line-clamp-none' : 'line-clamp-3')
					)}>
					{localShare.description}
				</motion.p>
			</div>

			{canEdit && showLogoDialog && <LogoUploadDialog currentLogo={localShare.logo} onClose={() => setShowLogoDialog(false)} onSubmit={handleLogoSubmit} />}
		</motion.div>
	)
})

ShareCard.displayName = 'ShareCard'
