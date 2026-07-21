'use client'

import { lazy, Suspense, useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import GridView, { type Blogger } from './grid-view'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import initialList from './list.json'
import type { AvatarItem } from './components/avatar-upload-dialog'
import { Pencil } from 'lucide-react'
import { PRESSABLE_HOVER, PRESSABLE_TAP } from '@/lib/motion'

const CreateDialog = lazy(() => import('./components/create-dialog'))

export default function Page() {
	const [bloggers, setBloggers] = useState<Blogger[]>(initialList as Blogger[])
	const [originalBloggers, setOriginalBloggers] = useState<Blogger[]>(initialList as Blogger[])
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [editingBlogger, setEditingBlogger] = useState<Blogger | null>(null)
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [avatarItems, setAvatarItems] = useState<Map<string, AvatarItem>>(new Map())
	const keyInputRef = useRef<HTMLInputElement>(null)

	const { isAuth, authenticatePrivateKey } = useAuthStore()
	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

	const handleUpdate = (updatedBlogger: Blogger, oldBlogger: Blogger, avatarItem?: AvatarItem) => {
		setBloggers(prev => prev.map(b => (b.url === oldBlogger.url ? updatedBlogger : b)))
		if (avatarItem) {
			setAvatarItems(prev => {
				const newMap = new Map(prev)
				newMap.set(updatedBlogger.url, avatarItem)
				return newMap
			})
		}
	}

	const handleAdd = () => {
		setEditingBlogger(null)
		setIsCreateDialogOpen(true)
	}

	const handleSaveBlogger = (updatedBlogger: Blogger) => {
		if (editingBlogger) {
			const updated = bloggers.map(b => (b.url === editingBlogger.url ? updatedBlogger : b))
			setBloggers(updated)
		} else {
			setBloggers([...bloggers, updatedBlogger])
		}
	}

	const handleDelete = (blogger: Blogger) => {
		if (confirm(`确定要删除 ${blogger.name} 吗？`)) {
			setBloggers(bloggers.filter(b => b.url !== blogger.url))
		}
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
			const { pushBloggers } = await import('./services/push-bloggers')
			await pushBloggers({
				bloggers,
				avatarItems
			})

			setOriginalBloggers(bloggers)
			setAvatarItems(new Map())
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
		setBloggers(originalBloggers)
		setAvatarItems(new Map())
		setIsEditMode(false)
	}

	const buttonText = isAuth ? '保存' : '导入密钥'

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditMode && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				setIsEditMode(true)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isEditMode])

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

			<GridView bloggers={bloggers} isEditMode={isEditMode} onUpdate={handleUpdate} onDelete={handleDelete} />

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
							onClick={handleCancel}
							disabled={isSaving}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							取消
						</motion.button>
						<motion.button
							whileHover={PRESSABLE_HOVER}
							whileTap={PRESSABLE_TAP}
							onClick={handleAdd}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							添加
						</motion.button>
						<motion.button whileHover={PRESSABLE_HOVER} whileTap={PRESSABLE_TAP} onClick={handleSaveClick} disabled={isSaving} className='brand-btn px-6'>
							{isSaving ? '保存中...' : buttonText}
						</motion.button>
					</>
				) : (
					!hideEditButton && (
						<motion.button
							whileHover={PRESSABLE_HOVER}
							whileTap={PRESSABLE_TAP}
							onClick={() => setIsEditMode(true)}
							aria-label='编辑博客名录'
							title='编辑博客名录'
							className='glass-panel glass-quiet pressable-icon text-secondary hover:text-primary flex h-10 w-10 items-center justify-center rounded-xl transition-colors'>
							<Pencil size={16} aria-hidden='true' />
						</motion.button>
					)
				)}
			</motion.div>

			<Suspense fallback={null}>
				{isCreateDialogOpen && <CreateDialog blogger={editingBlogger} onClose={() => setIsCreateDialogOpen(false)} onSave={handleSaveBlogger} />}
			</Suspense>
		</>
	)
}
