import LikeButton from '@/components/like-button'
import { CARD_SPACING, snapToHomeGrid } from '@/consts'
import { motion } from 'motion/react'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { HomeDraggableLayer } from './home-draggable-layer'
import { withSiteBase } from '@/lib/site-path'
import { SPRING_LAYOUT } from '@/lib/motion'
import { useLayoutEditStore } from './stores/layout-edit-store'
import { useSize } from '@/hooks/use-size'

export default function LikePosition() {
	const center = useCenterStore()
	const { maxLG, init } = useSize()
	const { cardStyles, siteContent } = useConfigStore()
	const styles = cardStyles.likePosition
	const hiCardStyles = cardStyles.hiCard
	const socialButtonsStyles = cardStyles.socialButtons
	const musicCardStyles = cardStyles.musicCard
	const shareCardStyles = cardStyles.shareCard
	const editingLayout = useLayoutEditStore(state => state.editing)
	const interactingLayout = useLayoutEditStore(state => state.interacting)
	const layoutInteraction = useLayoutEditStore(state => state.interaction)
	const isLayoutDragging = layoutInteraction?.cardKey === 'likePosition' && (layoutInteraction.phase === 'dragging' || layoutInteraction.phase === 'resizing')

	const x =
		styles.offsetX !== null
			? center.x + styles.offsetX
			: snapToHomeGrid(center.x + hiCardStyles.width / 2 - socialButtonsStyles.width + shareCardStyles.width + CARD_SPACING)
	const y =
		styles.offsetY !== null
			? center.y + styles.offsetY
			: snapToHomeGrid(center.y + hiCardStyles.height / 2 + CARD_SPACING + socialButtonsStyles.height + CARD_SPACING + musicCardStyles.height + CARD_SPACING)

	return (
		<HomeDraggableLayer cardKey='likePosition' x={x} y={y} width={styles.width} height={styles.height}>
			<motion.div
				layout={editingLayout && !interactingLayout ? 'position' : false}
				layoutDependency={`${x}:${y}:${maxLG}`}
				transition={{ layout: SPRING_LAYOUT }}
				className={`${maxLG && init ? 'static' : 'absolute'} layout-interaction-target max-sm:mt-8 ${isLayoutDragging ? 'is-layout-dragging' : ''}`}
				style={{ left: x, top: y }}>
				{siteContent.enableChristmas && (
					<>
						<img
							src={withSiteBase('/images/christmas/snow-13.webp')}
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 40, left: -4, top: -4, opacity: 0.9 }}
						/>
					</>
				)}

				<LikeButton />
			</motion.div>
		</HomeDraggableLayer>
	)
}
