'use client'

import ArtCard from '@/app/(home)/art-card'
import ArticleCard from '@/app/(home)/aritcle-card'
import BeianCard from '@/app/(home)/beian-card'
import CalendarCard from '@/app/(home)/calendar-card'
import ClockCard from '@/app/(home)/clock-card'
import HatCard from '@/app/(home)/hat-card'
import HiCard from '@/app/(home)/hi-card'
import LikePosition from '@/app/(home)/like-position'
import ShareCard from '@/app/(home)/share-card'
import SocialButtons from '@/app/(home)/social-buttons'
import WriteButtons from '@/app/(home)/write-buttons'
import SnowfallBackground from '@/layout/backgrounds/snowfall'
import { useConfigStore } from './stores/config-store'
import { useLayoutEditStore } from './stores/layout-edit-store'
import { useSize } from '@/hooks/use-size'
import { lazy, Suspense, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { PRESSABLE_HOVER, PRESSABLE_TAP } from '@/lib/motion'
import { useAdminSession } from '@/hooks/use-admin-session'

const ConfigDialog = lazy(() => import('@/app/(home)/config-dialog/index'))
export default function HomeClient() {
	const { maxSM, maxLG } = useSize()
	const { cardStyles, configDialogOpen, setConfigDialogOpen, siteContent } = useConfigStore()
	const editing = useLayoutEditStore(state => state.editing)
	const saveEditing = useLayoutEditStore(state => state.saveEditing)
	const cancelEditing = useLayoutEditStore(state => state.cancelEditing)
	const isAuth = useAdminSession()

	const handleSave = () => {
		saveEditing()
		toast.success('首页布局偏移已保存（尚未提交到远程配置）')
	}

	const handleCancel = () => {
		cancelEditing()
		toast.info('已取消此次拖拽布局修改')
	}

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (isAuth && (event.ctrlKey || event.metaKey) && (event.key === 'l' || event.key === ',')) {
				event.preventDefault()
				setConfigDialogOpen(true)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isAuth, setConfigDialogOpen])

	return (
		<>
			{siteContent.enableChristmas && <SnowfallBackground zIndex={0} count={!maxSM ? 36 : 12} />}

			{editing && (
				<div className='pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-6'>
					<div className='pointer-events-auto flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-2 shadow-lg backdrop-blur'>
						<span className='text-xs text-gray-600'>正在编辑首页布局，拖拽卡片调整位置</span>
						<div className='flex gap-2'>
							<motion.button
								type='button'
								whileHover={PRESSABLE_HOVER}
								whileTap={PRESSABLE_TAP}
								onClick={handleCancel}
								className='rounded-xl border bg-white px-3 py-1 text-xs font-medium text-gray-700'>
								取消
							</motion.button>
							<motion.button type='button' whileHover={PRESSABLE_HOVER} whileTap={PRESSABLE_TAP} onClick={handleSave} className='brand-btn px-3 py-1 text-xs'>
								保存偏移
							</motion.button>
						</div>
					</div>
				</div>
			)}

			<div className='max-lg:flex max-lg:w-full max-lg:flex-col max-lg:items-center max-lg:gap-6 max-lg:pb-4 max-sm:pt-6 sm:max-lg:pt-24'>
				{cardStyles.artCard?.enabled !== false && <ArtCard />}
				{cardStyles.hiCard?.enabled !== false && <HiCard />}
				{!maxLG && cardStyles.clockCard?.enabled !== false && <ClockCard />}
				{!maxLG && cardStyles.calendarCard?.enabled !== false && <CalendarCard />}
				{cardStyles.socialButtons?.enabled !== false && <SocialButtons />}
				{!maxLG && cardStyles.shareCard?.enabled !== false && <ShareCard />}
				{cardStyles.articleCard?.enabled !== false && <ArticleCard />}
				{!maxLG && cardStyles.writeButtons?.enabled !== false && <WriteButtons />}
				{cardStyles.likePosition?.enabled !== false && <LikePosition />}
				{cardStyles.hatCard?.enabled !== false && <HatCard />}
				{cardStyles.beianCard?.enabled !== false && <BeianCard />}
			</div>

			<Suspense fallback={null}>{isAuth && configDialogOpen && <ConfigDialog open onClose={() => setConfigDialogOpen(false)} />}</Suspense>
		</>
	)
}
