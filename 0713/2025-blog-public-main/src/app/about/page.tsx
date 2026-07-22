'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import type { AboutData } from './services/push-about'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { FileDown, Pencil } from 'lucide-react'
import EmailSVG from '@/svgs/email.svg'
import initialData from './list.json'
import { PageHeader } from '@/components/page-header'
import { APPLE_EASE_OUT, PRESSABLE_HOVER, PRESSABLE_TAP } from '@/lib/motion'
import { withSiteBase } from '@/lib/site-path'

export default function Page() {
	const [data, setData] = useState<AboutData>(initialData as AboutData)
	const [originalData, setOriginalData] = useState<AboutData>(initialData as AboutData)
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [isPreviewMode, setIsPreviewMode] = useState(false)
	const keyInputRef = useRef<HTMLInputElement>(null)

	const { isAuth, authenticatePrivateKey } = useAuthStore()
	const { siteContent } = useConfigStore()
	const { content, loading } = useMarkdownRender(data.content)
	const hideEditButton = siteContent.hideEditButton ?? false

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

	const handleEnterEditMode = () => {
		setIsEditMode(true)
		setIsPreviewMode(false)
	}

	const handleSave = async () => {
		setIsSaving(true)

		try {
			const { pushAbout } = await import('./services/push-about')
			await pushAbout(data)

			setOriginalData(data)
			setIsEditMode(false)
			setIsPreviewMode(false)
			toast.success('保存成功！')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setData(originalData)
		setIsEditMode(false)
		setIsPreviewMode(false)
	}

	const buttonText = isAuth ? '保存' : '导入密钥'

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditMode && isAuth && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				setIsEditMode(true)
				setIsPreviewMode(false)
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

			<div className='public-page flex flex-col items-center justify-center px-6 pt-28 max-sm:px-4 max-sm:pt-7'>
				<div className='w-full max-w-[960px]'>
					{isEditMode ? (
						isPreviewMode ? (
							<div className='space-y-6'>
								<PageHeader title={data.title || '标题预览'} meta={data.description || undefined} className='about-page-header max-w-[960px]' />

								{loading ? (
									<div className='text-secondary text-center'>预览渲染中...</div>
								) : (
									<div className='about-card card relative p-8 max-sm:p-5'>
										<div className='about-prose prose prose-sm max-w-none'>{content}</div>
									</div>
								)}
							</div>
						) : (
							<div className='space-y-6'>
								<div className='space-y-4'>
									<input
										type='text'
										placeholder='标题'
										className='w-full px-4 py-3 text-center text-2xl font-bold'
										value={data.title}
										onChange={e => setData({ ...data, title: e.target.value })}
									/>
									<input
										type='text'
										placeholder='描述'
										className='w-full px-4 py-3 text-center text-lg'
										value={data.description}
										onChange={e => setData({ ...data, description: e.target.value })}
									/>
								</div>

								<div className='card relative'>
									<textarea
										placeholder='Markdown 内容'
										className='min-h-[400px] w-full resize-none text-sm'
										value={data.content}
										onChange={e => setData({ ...data, content: e.target.value })}
									/>
								</div>
							</div>
						)
					) : (
						<>
							<PageHeader title={data.title} meta={data.description} className='about-page-header max-w-[960px]' />

							{loading ? (
								<div className='text-secondary text-center'>加载中...</div>
							) : (
								<motion.div
									initial={{ opacity: 0, scale: 0.96 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.22, ease: APPLE_EASE_OUT }}
									className='about-card card relative rounded-[18px] p-8 max-sm:p-5'>
									<div className='about-prose prose prose-sm max-w-none'>{content}</div>
								</motion.div>
							)}
						</>
					)}

					<div className='mt-8 flex items-center justify-center gap-6'>
						<motion.a
							href='mailto:joyetong58@gmail.com'
							aria-label='通过 Gmail 发送邮件'
							title='Gmail'
							initial={{ opacity: 0, scale: 0.96 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
							whileHover={PRESSABLE_HOVER}
							whileTap={PRESSABLE_TAP}
							className='glass-panel glass-quiet pressable-icon flex h-[53px] w-[53px] items-center justify-center rounded-full'>
							<EmailSVG className='size-8' aria-hidden='true' />
						</motion.a>
						<motion.a
							href={withSiteBase('/cv/Leo-CV.pdf')}
							download='Leo-CV.pdf'
							aria-label='下载 CV'
							title='下载 CV'
							initial={{ opacity: 0, scale: 0.96 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.22, delay: 0.04, ease: [0.23, 1, 0.32, 1] }}
							whileHover={PRESSABLE_HOVER}
							whileTap={PRESSABLE_TAP}
							className='glass-panel glass-quiet text-primary flex h-[53px] items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 text-sm font-medium'>
							<FileDown size={20} strokeWidth={1.8} aria-hidden='true' />
							<span>CV</span>
						</motion.a>
					</div>
				</div>
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
							onClick={() => setIsPreviewMode(prev => !prev)}
							disabled={isSaving}
							className={`rounded-xl border bg-white/60 px-6 py-2 text-sm`}>
							{isPreviewMode ? '继续编辑' : '预览'}
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
							onClick={handleEnterEditMode}
							aria-label='编辑关于页面'
							title='编辑关于页面'
							className='glass-panel glass-quiet pressable-icon text-secondary hover:text-primary flex h-10 w-10 items-center justify-center rounded-xl transition-colors'>
							<Pencil size={16} aria-hidden='true' />
						</motion.button>
					)
				)}
			</motion.div>
		</>
	)
}
