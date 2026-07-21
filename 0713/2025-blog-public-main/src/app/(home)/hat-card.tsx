import { useState, type CSSProperties } from 'react'
import { useConfigStore } from './stores/config-store'
import { useCenterStore } from '@/hooks/use-center'
import { useSize } from '@/hooks/use-size'
import { HomeDraggableLayer } from './home-draggable-layer'
import { withSiteBase } from '@/lib/site-path'
import { snapToHomeGrid } from '@/consts'

export default function HatCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const { maxSM } = useSize()
	const styles = cardStyles.hatCard

	const [number, setNumber] = useState(1)

	const hatIndex = siteContent.currentHatIndex ?? 1
	const hatFlipped = siteContent.hatFlipped ?? false

	if (maxSM) return null

	const x = styles.offsetX !== null ? center.x + styles.offsetX : snapToHomeGrid(center.x - styles.width / 2)
	const y = styles.offsetY !== null ? center.y + styles.offsetY : snapToHomeGrid(center.y - styles.height)
	const style = {
		left: x,
		top: y,
		width: styles.width,
		height: styles.height,
		'--card-reveal-delay': `${Math.min(styles.order, 6) * 0.05}s`,
		'--card-hover-scale': 1.02,
		'--card-tap-scale': 0.985
	} as CSSProperties

	return (
		<HomeDraggableLayer cardKey='hatCard' x={x} y={y} width={styles.width} height={styles.height}>
			<div style={style} onClick={() => setNumber(current => current + 1)} className='card-reveal absolute flex h-full w-full items-center justify-center'>
				{new Array(number)
					.fill(0)
					.map((_, index) =>
						index === 0 ? (
							<img
								key={index}
								src={withSiteBase(`/images/hats/${hatIndex}.webp`)}
								alt='hat'
								className='h-full w-full object-contain'
								style={{ width: styles.width, height: styles.height, transform: hatFlipped ? 'scaleX(-1)' : 'none' }}
							/>
						) : (
							<img
								key={index}
								src={withSiteBase(`/images/hats/${hatIndex}.webp`)}
								alt='hat'
								className='absolute h-full w-full object-contain'
								style={{ width: styles.width, height: styles.height, transform: hatFlipped ? 'scaleX(-1)' : 'none', bottom: index * 16 }}
							/>
						)
					)}
			</div>
		</HomeDraggableLayer>
	)
}
