'use client'

import { lazy, Suspense, useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { getProjectKey, ProjectCard, type Project } from './components/project-card'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import initialList from './list.json'
import type { ImageItem } from './components/image-upload-dialog'
import { PageHeader } from '@/components/page-header'
import { PRESSABLE_HOVER, PRESSABLE_TAP } from '@/lib/motion'

const CreateDialog = lazy(() => import('./components/create-dialog'))

export default function Page() {
	const [projects, setProjects] = useState<Project[]>(initialList as Project[])
	const [originalProjects, setOriginalProjects] = useState<Project[]>(initialList as Project[])
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [editingProject, setEditingProject] = useState<Project | null>(null)
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [imageItems, setImageItems] = useState<Map<string, ImageItem>>(new Map())
	const keyInputRef = useRef<HTMLInputElement>(null)

	const { isAuth, authenticatePrivateKey } = useAuthStore()
	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

	const handleUpdate = (updatedProject: Project, oldProject: Project, imageItem?: ImageItem) => {
		setProjects(prev => prev.map(p => (getProjectKey(p) === getProjectKey(oldProject) ? updatedProject : p)))
		if (imageItem) {
			setImageItems(prev => {
				const newMap = new Map(prev)
				newMap.set(getProjectKey(updatedProject), imageItem)
				return newMap
			})
		}
	}

	const handleAdd = () => {
		setEditingProject(null)
		setIsCreateDialogOpen(true)
	}

	const handleSaveProject = (updatedProject: Project) => {
		if (editingProject) {
			const updated = projects.map(p => (p.url === editingProject.url ? updatedProject : p))
			setProjects(updated)
		} else {
			setProjects([...projects, updatedProject])
		}
	}

	const handleDelete = (project: Project) => {
		if (confirm(`确定要删除 ${project.name} 吗？`)) {
			setProjects(projects.filter(p => getProjectKey(p) !== getProjectKey(project)))
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
			const { pushProjects } = await import('./services/push-projects')
			await pushProjects({
				projects,
				imageItems
			})

			setOriginalProjects(projects)
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
		setProjects(originalProjects)
		setImageItems(new Map())
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

			<div className='public-page flex flex-col items-center justify-center px-6 pt-28 max-sm:px-4 max-sm:pt-7'>
				<PageHeader title='我的项目' meta={`${projects.length} 个项目`} />
				<div className='grid w-full max-w-[1200px] grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1'>
					{projects.length ? (
						projects.map((project, index) => (
							<ProjectCard
								key={getProjectKey(project)}
								index={index}
								project={project}
								isEditMode={isEditMode}
								onUpdate={handleUpdate}
								onDelete={() => handleDelete(project)}
							/>
						))
					) : (
						<div className='template-empty-state'>暂无公开项目卡片</div>
					)}
				</div>
			</div>

			<motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className='fixed top-24 right-6 z-50 flex gap-3 max-sm:hidden'>
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
							aria-label='编辑项目'
							title='编辑项目'
							className='glass-panel glass-quiet text-secondary hover:text-primary flex h-10 w-10 items-center justify-center rounded-xl transition-colors'>
							<Pencil size={16} aria-hidden='true' />
						</motion.button>
					)
				)}
			</motion.div>

			<Suspense fallback={null}>
				{isCreateDialogOpen && <CreateDialog project={editingProject} onClose={() => setIsCreateDialogOpen(false)} onSave={handleSaveProject} />}
			</Suspense>
		</>
	)
}
