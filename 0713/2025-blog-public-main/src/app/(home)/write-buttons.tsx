import { CARD_SPACING, snapToHomeGrid } from '@/consts'
import PenSVG from '@/svgs/pen.svg'
import { motion } from 'motion/react'
import { useConfigStore } from './stores/config-store'
import { useCenterStore } from '@/hooks/use-center'
import { useRouter } from 'next/navigation'
import { useSize } from '@/hooks/use-size'
import DotsSVG from '@/svgs/dots.svg'
import { HomeDraggableLayer } from './home-draggable-layer'
import { withSiteBase } from '@/lib/site-path'
import { PRESSABLE_HOVER, PRESSABLE_TAP, windowReveal } from '@/lib/motion'
import { useLayoutEditStore } from './stores/layout-edit-store'

export default function WriteButton() {
	const center = useCenterStore()
	const { cardStyles, setConfigDialogOpen, siteContent } = useConfigStore()
	const { maxSM } = useSize()
	const router = useRouter()
	const styles = cardStyles.writeButtons
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const layoutInteraction = useLayoutEditStore(state => state.interaction)
	const isLayoutDragging = layoutInteraction?.cardKey === 'writeButtons' && (layoutInteraction.phase === 'dragging' || layoutInteraction.phase === 'resizing')

	if (maxSM) return null

	const x = styles.offsetX !== null ? center.x + styles.offsetX : snapToHomeGrid(center.x + CARD_SPACING + hiCardStyles.width / 2)
	const y =
		styles.offsetY !== null
			? center.y + styles.offsetY
			: snapToHomeGrid(center.y - clockCardStyles.offset - styles.height - CARD_SPACING / 2 - clockCardStyles.height)

	return (
		<HomeDraggableLayer cardKey='writeButtons' x={x} y={y} width={styles.width} height={styles.height}>
			<motion.div
				variants={windowReveal(Math.min(Math.max(0, styles.order - 1) * 0.03, 0.16))}
				initial='hidden'
				animate='visible'
				style={{ left: x, top: y }}
				className={`layout-interaction-target absolute flex items-center gap-4 ${isLayoutDragging ? 'is-layout-dragging' : ''}`}>
				<motion.button
					onClick={() => router.push('/write')}
					whileHover={PRESSABLE_HOVER}
					whileTap={PRESSABLE_TAP}
					style={{ boxShadow: 'inset 0 0 12px rgba(255, 255, 255, 0.4)' }}
					className='brand-btn whitespace-nowrap'>
					{siteContent.enableChristmas && (
						<>
							<img
								src={withSiteBase('/images/christmas/snow-8.webp')}
								alt='Christmas decoration'
								className='pointer-events-none absolute'
								style={{ width: 60, left: -2, top: -4, opacity: 0.95 }}
							/>
						</>
					)}

					<PenSVG />
					<span>写文章</span>
				</motion.button>
				<motion.button
					whileHover={PRESSABLE_HOVER}
					whileTap={PRESSABLE_TAP}
					onClick={() => setConfigDialogOpen(true)}
					aria-label='打开站点设置'
					title='站点设置'
					className='p-2'>
					<DotsSVG className='h-6 w-6' />
				</motion.button>
			</motion.div>
		</HomeDraggableLayer>
	)
}
