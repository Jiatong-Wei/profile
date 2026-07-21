'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'
import { Pencil, Plus, RefreshCw, X } from 'lucide-react'
import { DialogModal } from '@/components/dialog-modal'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import initialList from './list.json'
import { PageHeader } from '@/components/page-header'
import { APPLE_EASE_OUT, PRESSABLE_HOVER, PRESSABLE_TAP, pageReveal } from '@/lib/motion'

const getRandomSnippet = (list: string[]) => (list.length === 0 ? '' : list[Math.floor(Math.random() * list.length)])

export default function Page() {
	const [snippets, setSnippets] = useState<string[]>(initialList as string[])
	const [originalSnippets, setOriginalSnippets] = useState<string[]>(initialList as string[])
	const [currentSnippet, setCurrentSnippet] = useState<string>(getRandomSnippet(initialList as string[]))
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [isManageOpen, setIsManageOpen] = useState(false)
	const [draftSnippets, setDraftSnippets] = useState<string[]>([])
	const [newSnippet, setNewSnippet] = useState('')
	const keyInputRef = useRef<HTMLInputElement>(null)

	const { isAuth, authenticatePrivateKey } = useAuthStore()
	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

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

	const handleSave = async () => {
		setIsSaving(true)
		try {
			const { pushSnippets } = await import('./services/push-snippets')
			await pushSnippets({ snippets })
			setOriginalSnippets(snippets)
			setIsEditMode(false)
			toast.success('保存成功！')
		} catch (error: any) {
			console.error('Failed to save snippets:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleSaveClick = () => {
		if (!isAuth) {
			keyInputRef.current?.click()
		} else {
			void handleSave()
		}
	}

	const handleCancel = () => {
		setSnippets(originalSnippets)
		setIsEditMode(false)
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

	const openManageDialog = () => {
		setDraftSnippets(snippets)
		setNewSnippet('')
		setIsManageOpen(true)
	}

	const handleAddDraft = () => {
		const value = newSnippet.trim()
		if (!value) {
			toast.error('请输入句子')
			return
		}
		setDraftSnippets(prev => [...prev, value])
		setNewSnippet('')
	}

	const handleRemoveDraft = (index: number) => {
		setDraftSnippets(prev => prev.filter((_, i) => i !== index))
	}

	const applyManageChanges = () => {
		const cleaned = draftSnippets.map(item => item.trim()).filter(Boolean)
		if (cleaned.length === 0) {
			toast.error('请至少添加一句话')
			return
		}
		setSnippets(cleaned)
		if (!cleaned.includes(currentSnippet)) setCurrentSnippet(getRandomSnippet(cleaned))
		setIsManageOpen(false)
		toast.success('已更新列表')
	}

	const cancelManageChanges = () => {
		setIsManageOpen(false)
		setDraftSnippets([])
		setNewSnippet('')
	}

	const buttonText = isAuth ? '保存' : '导入密钥'

	return (
		<>
			<input
				ref={keyInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async e => {
					const file = e.target.files?.[0]
					if (file) await handleChoosePrivateKey(file)
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>

			<div className='public-page mx-auto flex min-h-[72vh] w-full max-w-4xl flex-col px-6 pt-28 max-sm:px-4 max-sm:pt-7'>
				<PageHeader title='随机片段' meta={`${snippets.length} 条`} className='max-w-3xl' />
				<motion.div
					variants={pageReveal}
					initial='hidden'
					animate='visible'
					className='card glass-primary relative mx-auto flex min-h-[260px] w-full max-w-3xl flex-col items-center justify-center rounded-[18px] px-10 py-12 text-center max-sm:px-6'>
					<AnimatePresence mode='wait' initial={false}>
						<motion.p
							key={currentSnippet}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -6 }}
							transition={{ duration: 0.2, ease: APPLE_EASE_OUT }}
							className='text-2xl leading-relaxed font-semibold max-sm:text-xl'>
							{currentSnippet || '无'}
						</motion.p>
					</AnimatePresence>
					<motion.button
						type='button'
						onClick={() => setCurrentSnippet(getRandomSnippet(snippets))}
						whileHover={PRESSABLE_HOVER}
						whileTap={PRESSABLE_TAP}
						aria-label='换一句'
						title='换一句'
						className='glass-panel glass-quiet text-secondary hover:text-primary absolute right-5 bottom-5 flex h-10 w-10 items-center justify-center rounded-xl'>
						<RefreshCw size={17} aria-hidden='true' />
					</motion.button>
				</motion.div>
			</div>

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
							onClick={openManageDialog}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							管理
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
							aria-label='编辑随机片段'
							title='编辑随机片段'
							className='glass-panel glass-quiet pressable-icon text-secondary hover:text-primary flex h-10 w-10 items-center justify-center rounded-xl transition-colors'>
							<Pencil size={16} aria-hidden='true' />
						</motion.button>
					)
				)}
			</motion.div>

			<DialogModal open={isManageOpen} onClose={cancelManageChanges} className='card static w-[520px] max-sm:w-full'>
				<div className='space-y-4'>
					<div className='flex items-center gap-3'>
						<input
							type='text'
							value={newSnippet}
							onChange={e => setNewSnippet(e.target.value)}
							placeholder='新增'
							className='flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none'
						/>
						<button onClick={handleAddDraft} className='brand-btn flex items-center gap-1 px-4 py-2 text-sm'>
							<Plus className='h-4 w-4' />
							新增
						</button>
					</div>

					<div className='max-h-[320px] space-y-2 overflow-y-auto pr-1'>
						{draftSnippets.length === 0 && <p className='text-secondary py-6 text-center text-sm'>暂无内容</p>}
						{draftSnippets.map((item, index) => (
							<div key={`${item}-${index}`} className='group flex items-start gap-3 rounded-lg px-3 py-2 text-sm'>
								<p className='flex-1 leading-relaxed text-gray-800'>{item}</p>
								<button onClick={() => handleRemoveDraft(index)} className='text-gray-400 transition-colors hover:text-red-500'>
									<X className='h-4 w-4' />
								</button>
							</div>
						))}
					</div>

					<div className='mt-4 flex gap-3'>
						<button
							onClick={cancelManageChanges}
							className='flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm transition-colors hover:bg-gray-50'>
							取消
						</button>
						<button onClick={applyManageChanges} className='brand-btn flex-1 justify-center px-4'>
							保存
						</button>
					</div>
				</div>
			</DialogModal>
		</>
	)
}
