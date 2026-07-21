import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING, snapToHomeGrid } from '@/consts'
import { HomeDraggableLayer } from './home-draggable-layer'
import { withSiteBase } from '@/lib/site-path'
import Link from 'next/link'

export default function ArtCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const styles = cardStyles.artCard
	const hiCardStyles = cardStyles.hiCard

	const x = styles.offsetX !== null ? center.x + styles.offsetX : snapToHomeGrid(center.x - styles.width / 2)
	const y = styles.offsetY !== null ? center.y + styles.offsetY : snapToHomeGrid(center.y - hiCardStyles.height / 2 - styles.height - CARD_SPACING)

	const artImages = siteContent.artImages ?? []
	const currentId = siteContent.currentArtImageId
	const currentArt = (currentId ? artImages.find(item => item.id === currentId) : undefined) ?? artImages[0]
	const artUrl = withSiteBase(currentArt?.url || '/portrait-photonew2.jpg')

	return (
		<HomeDraggableLayer cardKey='artCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card
				cardKey='artCard'
				glassTone='standard'
				motionRole='pressable'
				className='p-2 max-lg:static max-lg:translate-0'
				order={styles.order}
				width={styles.width}
				height={styles.height}
				x={x}
				y={y}>
				{siteContent.enableChristmas && (
					<>
						<img
							src={withSiteBase('/images/christmas/snow-3.webp')}
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 160, right: -8, top: -16, opacity: 0.9 }}
						/>
					</>
				)}

				<Link href='/pictures' className='group block h-full w-full overflow-hidden rounded-[18px]' aria-label='查看图片'>
					<img src={artUrl} alt='wall art' className='home-art-image h-full w-full object-cover' />
				</Link>
			</Card>
		</HomeDraggableLayer>
	)
}
