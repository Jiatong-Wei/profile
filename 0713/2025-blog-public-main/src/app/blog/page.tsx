'use client'

import Link from 'next/link'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { AnimatePresence, motion } from 'motion/react'

dayjs.extend(weekOfYear)
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import ShortLineSVG from '@/svgs/short-line.svg'
import { useBlogIndex, type BlogIndexItem } from '@/hooks/use-blog-index'
import { useCategories } from '@/hooks/use-categories'
import { useReadArticles } from '@/hooks/use-read-articles'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { cn } from '@/lib/utils'
import { Check, CheckCircle2, LogOut, Pencil } from 'lucide-react'
import { BlogCoverHoverPreview, useBlogCoverHover } from './components/blog-cover-hover'
import { PageHeader } from '@/components/page-header'
import { APPLE_EASE_OUT, PRESSABLE_HOVER, PRESSABLE_TAP, SELECTION_SPRING, SPRING_SNAPPY, pageReveal } from '@/lib/motion'
import { ArticleMotionTitle } from '@/components/article-motion'

const CategoryModal = lazy(() => import('./components/category-modal').then(module => ({ default: module.CategoryModal })))
const MotionLink = motion.create(Link)

type DisplayMode = 'day' | 'week' | 'month' | 'year' | 'category'

export default function BlogPage() {
	const { items, loading } = useBlogIndex()
	const { categories: categoriesFromServer } = useCategories()
	const { isRead } = useReadArticles()
	const { isAuth, authenticatePrivateKey, clearAuth } = useAuthStore()
	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false
	const enableCategories = siteContent.enableCategories ?? false

	const keyInputRef = useRef<HTMLInputElement>(null)
	const [editMode, setEditMode] = useState(false)
	const [editableItems, setEditableItems] = useState<BlogIndexItem[]>([])
	const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set())
	const [saving, setSaving] = useState(false)
	const [displayMode, setDisplayMode] = useState<DisplayMode>('year')
	const [categoryModalOpen, setCategoryModalOpen] = useState(false)
	const [categoryList, setCategoryList] = useState<string[]>([])
	const [newCategory, setNewCategory] = useState('')
	const [readStateReady, setReadStateReady] = useState(false)

	const { cancelCoverPreview, onCoverLinkMouseEnter, hoverCoverPreview } = useBlogCoverHover(editMode)

	useEffect(() => {
		if (!editMode) {
			setEditableItems(items)
		}
	}, [items, editMode])

	useEffect(() => {
		setCategoryList(categoriesFromServer || [])
	}, [categoriesFromServer])

	useEffect(() => {
		setReadStateReady(true)
	}, [])

	const displayItems = editMode ? editableItems : items

	const { groupedItems, groupKeys, getGroupLabel } = useMemo(() => {
		const sorted = [...displayItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

		const grouped = sorted.reduce(
			(acc, item) => {
				let key: string
				let label: string
				const date = dayjs(item.date)

				switch (displayMode) {
					case 'category':
						key = item.category || '未分类'
						label = key
						break
					case 'day':
						key = date.format('YYYY-MM-DD')
						label = date.format('YYYY年MM月DD日')
						break
					case 'week':
						const week = date.week()
						key = `${date.format('YYYY')}-W${week.toString().padStart(2, '0')}`
						label = `${date.format('YYYY')}年第${week}周`
						break
					case 'month':
						key = date.format('YYYY-MM')
						label = date.format('YYYY年MM月')
						break
					case 'year':
					default:
						key = date.format('YYYY')
						label = date.format('YYYY年')
						break
				}

				if (!acc[key]) {
					acc[key] = { items: [], label }
				}
				acc[key].items.push(item)
				return acc
			},
			{} as Record<string, { items: BlogIndexItem[]; label: string }>
		)

		const keys = Object.keys(grouped).sort((a, b) => {
			if (displayMode === 'category') {
				const categoryOrder = new Map(categoryList.map((c, index) => [c, index]))
				const aOrder = categoryOrder.has(a) ? categoryOrder.get(a)! : Number.MAX_SAFE_INTEGER
				const bOrder = categoryOrder.has(b) ? categoryOrder.get(b)! : Number.MAX_SAFE_INTEGER
				if (aOrder !== bOrder) return aOrder - bOrder
				return a.localeCompare(b)
			}
			// 按时间倒序排序
			if (displayMode === 'week') {
				// 周格式：YYYY-WW
				const [yearA, weekA] = a.split('-W').map(Number)
				const [yearB, weekB] = b.split('-W').map(Number)
				if (yearA !== yearB) return yearB - yearA
				return weekB - weekA
			}
			return b.localeCompare(a)
		})

		return {
			groupedItems: grouped,
			groupKeys: keys,
			getGroupLabel: (key: string) => grouped[key]?.label || key
		}
	}, [displayItems, displayMode, categoryList])

	const selectedCount = selectedSlugs.size
	const buttonText = isAuth ? '保存' : '导入密钥'

	const enterEditMode = useCallback(() => {
		if (!isAuth) {
			keyInputRef.current?.click()
			return
		}

		setEditableItems(items)
		setSelectedSlugs(new Set())
		setEditMode(true)
	}, [isAuth, items])

	const toggleSelect = useCallback((slug: string) => {
		setSelectedSlugs(prev => {
			const next = new Set(prev)
			if (next.has(slug)) {
				next.delete(slug)
			} else {
				next.add(slug)
			}
			return next
		})
	}, [])

	// 全选所有文章
	const handleSelectAll = useCallback(() => {
		setSelectedSlugs(new Set(editableItems.map(item => item.slug)))
	}, [editableItems])

	// 全选/取消全选某个时间维度分组
	const handleSelectGroup = useCallback(
		(groupKey: string) => {
			const group = groupedItems[groupKey]
			if (!group) return

			// 检查该分组是否所有文章都已选中
			const allSelected = group.items.every(item => selectedSlugs.has(item.slug))

			setSelectedSlugs(prev => {
				const next = new Set(prev)
				if (allSelected) {
					// 如果已全选，则取消该分组的选择
					group.items.forEach(item => {
						next.delete(item.slug)
					})
				} else {
					// 如果未全选，则全选该分组
					group.items.forEach(item => {
						next.add(item.slug)
					})
				}
				return next
			})
		},
		[groupedItems, selectedSlugs]
	)

	// 取消全选
	const handleDeselectAll = useCallback(() => {
		setSelectedSlugs(new Set())
	}, [])

	const handleItemClick = useCallback(
		(event: React.MouseEvent, slug: string) => {
			if (!editMode) return
			event.preventDefault()
			event.stopPropagation()
			toggleSelect(slug)
		},
		[editMode, toggleSelect]
	)

	const handleDeleteSelected = useCallback(() => {
		if (selectedCount === 0) {
			toast.info('请选择要删除的文章')
			return
		}

		const selectedTitles = editableItems.filter(item => selectedSlugs.has(item.slug)).map(item => item.title || item.slug)
		const confirmed = window.confirm(
			`将以下 ${selectedTitles.length} 篇文章标记为待删除：\n\n${selectedTitles.join('\n')}\n\n此时尚未修改 GitHub，点击“保存”后还会再次确认。`
		)
		if (!confirmed) return

		setEditableItems(prev => prev.filter(item => !selectedSlugs.has(item.slug)))
		setSelectedSlugs(new Set())
		toast.info('已标记为待删除，尚未提交到 GitHub')
	}, [editableItems, selectedCount, selectedSlugs])

	const handleAssignCategory = useCallback((slug: string, category?: string) => {
		setEditableItems(prev =>
			prev.map(item => {
				if (item.slug !== slug) return item
				const nextCategory = category?.trim()
				if (!nextCategory) return { ...item, category: undefined }
				return { ...item, category: nextCategory }
			})
		)
	}, [])

	const handleAddCategory = useCallback(() => {
		const value = newCategory.trim()
		if (!value) {
			toast.info('请输入分类名称')
			return
		}
		setCategoryList(prev => (prev.includes(value) ? prev : [...prev, value]))
		setNewCategory('')
	}, [newCategory])

	const handleRemoveCategory = useCallback((category: string) => {
		setCategoryList(prev => prev.filter(item => item !== category))
		setEditableItems(prev => prev.map(item => (item.category === category ? { ...item, category: undefined } : item)))
	}, [])

	const handleReorderCategories = useCallback((nextList: string[]) => {
		setCategoryList(nextList)
	}, [])

	const handleCancel = useCallback(() => {
		setEditableItems(items)
		setSelectedSlugs(new Set())
		setEditMode(false)
	}, [items])

	const handleSave = useCallback(async () => {
		const removedSlugs = items.filter(item => !editableItems.some(editItem => editItem.slug === item.slug)).map(item => item.slug)
		const normalizedCategoryList = categoryList.map(c => c.trim()).filter(Boolean)
		const categoryListChanged = JSON.stringify(normalizedCategoryList) !== JSON.stringify((categoriesFromServer || []).map(c => c.trim()).filter(Boolean))
		const categoryAssignmentChanged = items.some(origin => {
			const next = editableItems.find(editItem => editItem.slug === origin.slug)
			const originCategory = origin.category || ''
			const nextCategory = next?.category || ''
			return originCategory !== nextCategory
		})
		const hasChanges = removedSlugs.length > 0 || categoryListChanged || categoryAssignmentChanged

		if (!hasChanges) {
			toast.info('没有需要保存的改动')
			return
		}

		if (removedSlugs.length > 0) {
			const removedTitles = items.filter(item => removedSlugs.includes(item.slug)).map(item => item.title || item.slug)
			const confirmed = window.confirm(
				`即将从 GitHub 仓库永久删除以下 ${removedTitles.length} 篇文章及其文件：\n\n${removedTitles.join('\n')}\n\n该操作会产生提交并触发网站重新部署，确认继续吗？`
			)
			if (!confirmed) return
		}

		try {
			setSaving(true)
			const { saveBlogEdits } = await import('./services/save-blog-edits')
			await saveBlogEdits(items, editableItems, normalizedCategoryList)
			setEditMode(false)
			setSelectedSlugs(new Set())
			setCategoryModalOpen(false)
		} catch (error: any) {
			console.error(error)
			toast.error(error?.message || '保存失败')
		} finally {
			setSaving(false)
		}
	}, [items, editableItems, categoryList, categoriesFromServer])

	const handleSaveClick = useCallback(() => {
		if (!isAuth) {
			keyInputRef.current?.click()
			return
		}
		void handleSave()
	}, [handleSave, isAuth])

	const handlePrivateKeySelection = useCallback(
		async (file: File) => {
			try {
				const pem = await file.text()
				await authenticatePrivateKey(pem)
				if (!editMode) {
					setEditableItems(items)
					setSelectedSlugs(new Set())
					setEditMode(true)
					toast.success('密钥验证成功，已进入管理模式')
				} else {
					toast.success('密钥验证成功，请再次点击保存')
				}
			} catch (error) {
				console.error(error)
				toast.error('密钥验证失败，请确认文件与 GitHub App 匹配')
			}
		},
		[authenticatePrivateKey, editMode, items]
	)

	const handleLogout = useCallback(() => {
		clearAuth()
		setEditableItems(items)
		setSelectedSlugs(new Set())
		setEditMode(false)
		toast.success('已退出管理模式')
	}, [clearAuth, items])

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!editMode && isAuth && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				enterEditMode()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [editMode, enterEditMode, isAuth])

	return (
		<>
			<input
				ref={keyInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async e => {
					const f = e.target.files?.[0]
					if (f) await handlePrivateKeySelection(f)
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>

			<div className='public-page flex flex-col items-center justify-center gap-6 px-6 pt-24 max-sm:px-4 max-sm:pt-7'>
				<PageHeader title='近期文章' meta={loading ? '正在载入' : `${items.length} 篇文章`} className='max-w-[840px]' />
				{items.length > 0 && (
					<motion.div
						variants={pageReveal}
						initial='hidden'
						animate='visible'
						className='segmented-control glass-panel glass-quiet relative mx-auto flex items-center gap-1 p-1'>
						{[
							{ value: 'day', label: '日' },
							{ value: 'week', label: '周' },
							{ value: 'month', label: '月' },
							{ value: 'year', label: '年' },
							...(enableCategories ? ([{ value: 'category', label: '分类' }] as const) : [])
						].map(option => (
							<motion.button
								key={option.value}
								onClick={() => setDisplayMode(option.value as DisplayMode)}
								className={cn('segmented-option', displayMode === option.value && 'is-selected')}>
								{displayMode === option.value && <motion.span layoutId='blog-mode-selection' className='segmented-selection' transition={SELECTION_SPRING} />}
								<span>{option.label}</span>
							</motion.button>
						))}
					</motion.div>
				)}

				<AnimatePresence mode='popLayout'>
					{groupKeys.map((groupKey, index) => {
						const group = groupedItems[groupKey]
						if (!group) return null

						return (
							<motion.div
								layout='position'
								onMouseLeave={cancelCoverPreview}
								key={`${displayMode}:${groupKey}`}
								initial={{ opacity: 0, y: 4 }}
								whileInView={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -2 }}
								viewport={{ once: true, amount: 0.15 }}
								transition={{ layout: SELECTION_SPRING, duration: 0.18, delay: Math.min(index, 6) * 0.025, ease: APPLE_EASE_OUT }}
								className='card glass-standard relative w-full max-w-[840px] space-y-6 rounded-[var(--radius-card)]'>
								<div className='mb-3 flex items-center justify-between gap-3 text-base'>
									<div className='flex items-center gap-3'>
										<div className='font-medium'>{getGroupLabel(groupKey)}</div>
										<div className='h-2 w-2 rounded-full bg-[#D9D9D9]'></div>
										<div className='text-secondary text-sm'>{group.items.length} 篇文章</div>
									</div>
									{editMode &&
										(() => {
											const groupAllSelected = group.items.every(item => selectedSlugs.has(item.slug))
											return (
												<motion.button
													whileHover={PRESSABLE_HOVER}
													whileTap={PRESSABLE_TAP}
													onClick={() => handleSelectGroup(groupKey)}
													className={cn(
														'rounded-lg border px-3 py-1 text-xs transition-colors',
														groupAllSelected
															? 'border-brand/40 bg-brand/10 text-brand hover:bg-brand/20'
															: 'text-secondary hover:border-brand/40 hover:text-brand border-transparent bg-white/60 hover:bg-white/80'
													)}>
													{groupAllSelected ? '取消全选' : '全选该分组'}
												</motion.button>
											)
										})()}
								</div>
								<div>
									{group.items.map(it => {
										const hasRead = readStateReady && isRead(it.slug)
										const isSelected = selectedSlugs.has(it.slug)
										return (
											<MotionLink
												layout='position'
												layoutId={`blog-row:${it.slug}`}
												onMouseEnter={event => onCoverLinkMouseEnter(it.cover, { x: event.clientX, y: event.clientY })}
												onMouseLeave={cancelCoverPreview}
												href={`/blog/${it.slug}`}
												key={it.slug}
												onClick={event => handleItemClick(event, it.slug)}
												whileTap={editMode ? undefined : { scale: 0.99, transition: SPRING_SNAPPY }}
												transition={{ layout: SELECTION_SPRING }}
												className={cn(
													'article-row group flex min-h-10 items-center gap-3 py-3 transition-[background-color,border-color] duration-150',
													editMode
														? cn(
																'rounded-lg border px-3',
																isSelected ? 'border-brand/60 bg-brand/5' : 'hover:border-brand/40 border-transparent hover:bg-white/60'
															)
														: 'cursor-pointer'
												)}>
												{editMode && (
													<span
														className={cn(
															'flex h-4 w-4 items-center justify-center rounded-full border text-[10px] font-semibold',
															isSelected ? 'border-brand bg-brand text-white' : 'border-[#D9D9D9] text-transparent'
														)}>
														<Check />
													</span>
												)}
												<span className='text-secondary w-[44px] shrink-0 text-sm font-medium'>{dayjs(it.date).format('MM-DD')}</span>

												<div className='relative flex h-2 w-2 items-center justify-center'>
													<div className='article-row-dot bg-secondary h-2 w-2 scale-[0.625] rounded-full'></div>
													<ShortLineSVG className='absolute bottom-4' />
												</div>
												<div className={cn('article-row-title flex-1 truncate text-sm font-medium', editMode && 'article-row-title-static')}>
													<ArticleMotionTitle slug={it.slug} as='span'>
														{it.title || it.slug}
													</ArticleMotionTitle>
													{hasRead && (
														<span className='text-brand-ink ml-2 inline-flex items-center align-middle' title='已阅读' aria-label='已阅读'>
															<CheckCircle2 size={13} aria-hidden='true' />
														</span>
													)}
												</div>
												<div className='flex flex-wrap items-center gap-2 max-sm:hidden'>
													{(it.tags || []).map(t => (
														<span key={t} className='text-secondary text-sm'>
															#{t}
														</span>
													))}
												</div>
											</MotionLink>
										)
									})}
								</div>
							</motion.div>
						)
					})}
				</AnimatePresence>
			</div>

			<div className='pt-12'>
				{!loading && items.length === 0 && <div className='text-secondary py-6 text-center text-sm'>暂无文章</div>}
				{loading && <div className='text-secondary py-6 text-center text-sm'>加载中...</div>}
			</div>

			<motion.div
				initial={{ opacity: 0, scale: 0.96 }}
				animate={{ opacity: 1, scale: 1 }}
				className='fixed top-24 right-6 z-50 flex items-center gap-3 max-sm:hidden'>
				{editMode ? (
					<>
						{enableCategories && (
							<motion.button
								whileHover={PRESSABLE_HOVER}
								whileTap={PRESSABLE_TAP}
								onClick={() => setCategoryModalOpen(true)}
								disabled={saving}
								className='rounded-xl border bg-white/60 px-4 py-2 text-sm transition-colors hover:bg-white/80'>
								分类
							</motion.button>
						)}
						<motion.button
							whileHover={PRESSABLE_HOVER}
							whileTap={PRESSABLE_TAP}
							onClick={handleCancel}
							disabled={saving}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							取消
						</motion.button>
						<motion.button
							whileHover={PRESSABLE_HOVER}
							whileTap={PRESSABLE_TAP}
							onClick={handleLogout}
							disabled={saving}
							aria-label='退出管理模式'
							title='退出管理模式'
							className='pressable-icon text-secondary hover:text-primary flex h-10 w-10 items-center justify-center rounded-xl border bg-white/60 transition-colors'>
							<LogOut size={16} aria-hidden='true' />
						</motion.button>
						<motion.button
							whileHover={PRESSABLE_HOVER}
							whileTap={PRESSABLE_TAP}
							onClick={selectedCount === editableItems.length ? handleDeselectAll : handleSelectAll}
							className='rounded-xl border bg-white/60 px-4 py-2 text-sm transition-colors hover:bg-white/80'>
							{selectedCount === editableItems.length ? '取消全选' : '全选'}
						</motion.button>
						<motion.button
							whileHover={PRESSABLE_HOVER}
							whileTap={PRESSABLE_TAP}
							onClick={handleDeleteSelected}
							disabled={selectedCount === 0}
							className='rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 transition-colors disabled:opacity-60'>
							标记删除(已选:{selectedCount}篇)
						</motion.button>
						<motion.button whileHover={PRESSABLE_HOVER} whileTap={PRESSABLE_TAP} onClick={handleSaveClick} disabled={saving} className='brand-btn px-6'>
							{saving ? '保存中...' : buttonText}
						</motion.button>
					</>
				) : (
					(isAuth || !hideEditButton) && (
						<motion.button
							whileHover={PRESSABLE_HOVER}
							whileTap={PRESSABLE_TAP}
							onClick={enterEditMode}
							aria-label='编辑文章列表'
							title='编辑文章列表'
							className='glass-panel glass-quiet text-secondary hover:text-primary flex h-10 w-10 items-center justify-center rounded-xl transition-colors'>
							<Pencil size={16} aria-hidden='true' />
						</motion.button>
					)
				)}
			</motion.div>

			<BlogCoverHoverPreview preview={hoverCoverPreview} />

			<Suspense fallback={null}>
				{categoryModalOpen && (
					<CategoryModal
						open
						onClose={() => setCategoryModalOpen(false)}
						categoryList={categoryList}
						newCategory={newCategory}
						onNewCategoryChange={setNewCategory}
						onAddCategory={handleAddCategory}
						onRemoveCategory={handleRemoveCategory}
						onReorderCategories={handleReorderCategories}
						editableItems={editableItems}
						onAssignCategory={handleAssignCategory}
					/>
				)}
			</Suspense>
		</>
	)
}
