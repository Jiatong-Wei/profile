'use client'

import { lazy, Suspense, useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import initialList from './list.json'
import { RandomLayout } from './components/random-layout'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import type { ImageItem } from '../projects/components/image-upload-dialog'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { PRESSABLE_HOVER, PRESSABLE_TAP } from '@/lib/motion'

const UploadDialog = lazy(() => import('./components/upload-dialog'))

export interface Picture {
	id: string
	uploadedAt: string
	description?: string
	image?: string
	images?: string[]
}

export default function Page() {
	const [pictures, setPictures] = useState<Picture[]>(initialList as Picture[])
	const [originalPictures, setOriginalPictures] = useState<Picture[]>(initialList as Picture[])
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
	const [imageItems, setImageItems] = useState<Map<string, ImageItem>>(new Map())
	const keyInputRef = useRef<HTMLInputElement>(null)
	const router = useRouter()

	const { isAuth, authenticatePrivateKey } = useAuthStore()
	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

	const handleUploadSubmit = ({ images, description }: { images: ImageItem[]; description: string }) => {
		const now = new Date().toISOString()

		if (images.length === 0) {
			toast.error('请至少选择一张图片')
			return
		}

		const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
		const desc = description.trim() || undefined

		const imageUrls = images.map(imageItem => (imageItem.type === 'url' ? imageItem.url : imageItem.previewUrl))

		const newPicture: Picture = {
			id,
			uploadedAt: now,
			description: desc,
			images: imageUrls
		}

		const newMap = new Map(imageItems)

		images.forEach((imageItem, index) => {
			if (imageItem.type === 'file') {
				newMap.set(`${id}::${index}`, imageItem)
			}
		})

		setPictures(prev => [...prev, newPicture])
		setImageItems(newMap)
		setIsUploadDialogOpen(false)
	}

	const handleDeleteSingleImage = (pictureId: string, imageIndex: number | 'single') => {
		setPictures(prev => {
			return prev
				.map(picture => {
					if (picture.id !== pictureId) return picture

					// 如果是 single image，删除整个 Picture
					if (imageIndex === 'single') {
						return null
					}

					// 如果是 images 数组中的图片
					if (picture.images && picture.images.length > 0) {
						const newImages = picture.images.filter((_, idx) => idx !== imageIndex)
						// 如果删除后数组为空，删除整个 Picture
						if (newImages.length === 0) {
							return null
						}
						return {
							...picture,
							images: newImages
						}
					}

					return picture
				})
				.filter((p): p is Picture => p !== null)
		})

		// 更新 imageItems Map
		setImageItems(prev => {
			const next = new Map(prev)
			if (imageIndex === 'single') {
				// 删除所有相关的文件项
				for (const key of next.keys()) {
					if (key.startsWith(`${pictureId}::`)) {
						next.delete(key)
					}
				}
			} else {
				// 删除特定索引的文件项
				next.delete(`${pictureId}::${imageIndex}`)

				// 重新索引：删除索引 imageIndex 后，后面的索引需要前移
				// 例如：删除索引 1，原来的索引 2 变成 1，索引 3 变成 2
				const keysToUpdate: Array<{ oldKey: string; newKey: string }> = []
				for (const key of next.keys()) {
					if (key.startsWith(`${pictureId}::`)) {
						const [, indexStr] = key.split('::')
						const oldIndex = Number(indexStr)
						if (!isNaN(oldIndex) && oldIndex > imageIndex) {
							const newIndex = oldIndex - 1
							keysToUpdate.push({
								oldKey: key,
								newKey: `${pictureId}::${newIndex}`
							})
						}
					}
				}

				// 执行重新索引
				for (const { oldKey, newKey } of keysToUpdate) {
					const value = next.get(oldKey)
					if (value) {
						next.set(newKey, value)
						next.delete(oldKey)
					}
				}
			}
			return next
		})
	}

	const handleDeleteGroup = (picture: Picture) => {
		if (!confirm('确定要删除这一组图片吗？')) return

		setPictures(prev => prev.filter(p => p.id !== picture.id))
		setImageItems(prev => {
			const next = new Map(prev)
			for (const key of next.keys()) {
				if (key.startsWith(`${picture.id}::`)) {
					next.delete(key)
				}
			}
			return next
		})
	}

	const handleChoosePrivateKey = async (file: File) => {
		try {
			const text = await file.text()
			await authenticatePrivateKey(text)
			toast.success('密钥验证成功，请再次点击保存')
		} catch (error) {
			console.error('Failed to authenticate private key:', error)
			toast.error('密钥验证失败，请确认文件与 GitHub App 匹配')
		}
	}

	const handleSaveClick = () => {
		if (!isAuth) {
			keyInputRef.current?.click()
		} else {
			handleSave()
		}
	}

	const handleSave = async () => {
		setIsSaving(true)

		try {
			const { pushPictures } = await import('./services/push-pictures')
			await pushPictures({
				pictures,
				imageItems
			})

			setOriginalPictures(pictures)
			setImageItems(new Map())
			setIsEditMode(false)
			toast.success('保存成功！')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setPictures(originalPictures)
		setImageItems(new Map())
		setIsEditMode(false)
	}

	const buttonText = isAuth ? '保存' : '导入密钥'

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditMode && isAuth && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				setIsEditMode(true)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isAuth, isEditMode])

	return (
		<>
			<input
				ref={keyInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async e => {
					const f = e.target.files?.[0]
					if (f) await handleChoosePrivateKey(f)
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>

			<div className='pointer-events-none relative z-30 mx-auto w-full max-w-7xl px-6 pt-28 max-sm:px-4 max-sm:pt-7'>
				<PageHeader title='图片' meta={`${pictures.length} 组`} />
			</div>
			<RandomLayout pictures={pictures} isEditMode={isEditMode} onDeleteSingle={handleDeleteSingleImage} onDeleteGroup={handleDeleteGroup} />

			{pictures.length === 0 && <div className='text-secondary flex min-h-screen items-center justify-center text-center text-sm'>还没有公开图片。</div>}

			<motion.div
				initial={{ opacity: 0, scale: 0.96 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
				className='fixed top-24 right-6 z-50 flex gap-3 max-sm:hidden'>
				{isEditMode ? (
					<>
						<motion.button
							whileHover={PRESSABLE_HOVER}
							whileTap={PRESSABLE_TAP}
							onClick={() => router.push('/image-toolbox')}
							className='rounded-xl border bg-blue-50 px-4 py-2 text-sm text-blue-700'>
							压缩工具
						</motion.button>
						<motion.button
							whileHover={PRESSABLE_HOVER}
							whileTap={PRESSABLE_TAP}
							onClick={handleCancel}
							disabled={isSaving}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							取消
						</motion.button>
						<motion.button
							whileHover={PRESSABLE_HOVER}
							whileTap={PRESSABLE_TAP}
							onClick={() => setIsUploadDialogOpen(true)}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							上传
						</motion.button>
						<motion.button whileHover={PRESSABLE_HOVER} whileTap={PRESSABLE_TAP} onClick={handleSaveClick} disabled={isSaving} className='brand-btn px-6'>
							{isSaving ? '保存中...' : buttonText}
						</motion.button>
					</>
				) : (
					(isAuth || !hideEditButton) && (
						<motion.button
							whileHover={PRESSABLE_HOVER}
							whileTap={PRESSABLE_TAP}
							onClick={() => setIsEditMode(true)}
							aria-label='编辑图片墙'
							title='编辑图片墙'
							className='glass-panel glass-quiet pressable-icon text-secondary hover:text-primary flex h-10 w-10 items-center justify-center rounded-xl transition-colors'>
							<Pencil size={16} aria-hidden='true' />
						</motion.button>
					)
				)}
			</motion.div>

			<Suspense fallback={null}>{isUploadDialogOpen && <UploadDialog onClose={() => setIsUploadDialogOpen(false)} onSubmit={handleUploadSubmit} />}</Suspense>
		</>
	)
}
