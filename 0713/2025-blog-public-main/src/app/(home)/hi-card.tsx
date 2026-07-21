import { useCenterStore } from '@/hooks/use-center'
import { snapToHomeGrid } from '@/consts'
import Card from '@/components/card'
import { useConfigStore } from './stores/config-store'
import { HomeDraggableLayer } from './home-draggable-layer'
import Link from 'next/link'
import { withSiteBase } from '@/lib/site-path'
import { motion } from 'motion/react'
import { PRESSABLE_HOVER, PRESSABLE_TAP, SPRING_SNAPPY } from '@/lib/motion'

function getGreeting() {
	const hour = new Date().getHours()

	if (hour >= 6 && hour < 12) {
		return 'Good Morning'
	} else if (hour >= 12 && hour < 18) {
		return 'Good Afternoon'
	} else if (hour >= 18 && hour < 22) {
		return 'Good Evening'
	} else {
		return 'Good Night'
	}
}

export default function HiCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const greeting = getGreeting()
	const styles = cardStyles.hiCard
	const username = siteContent.meta.username || 'Suni'

	const x = styles.offsetX !== null ? center.x + styles.offsetX : snapToHomeGrid(center.x - styles.width / 2)
	const y = styles.offsetY !== null ? center.y + styles.offsetY : snapToHomeGrid(center.y - styles.height / 2)

	return (
		<HomeDraggableLayer cardKey='hiCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card
				cardKey='hiCard'
				order={styles.order}
				width={styles.width}
				height={styles.height}
				x={x}
				y={y}
				glassTone='primary'
				interactiveGlass
				className='relative text-center max-lg:static max-lg:translate-0'>
				{siteContent.enableChristmas && (
					<>
						<img
							src={withSiteBase('/images/christmas/snow-1.webp')}
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 180, left: -20, top: -25, opacity: 0.9 }}
						/>
						<img
							src={withSiteBase('/images/christmas/snow-2.webp')}
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 160, bottom: -12, right: -8, opacity: 0.9 }}
						/>
					</>
				)}
				<Link
					href='/live2d'
					aria-label='查看 Live2D'
					title='Live2D'
					className='focus-visible:outline-brand/50 inline-block rounded-full focus-visible:outline-2 focus-visible:outline-offset-4'>
					<motion.picture tabIndex={-1} whileHover={PRESSABLE_HOVER} whileTap={PRESSABLE_TAP} transition={SPRING_SNAPPY} className='block'>
						<source srcSet={withSiteBase('/images/avatar.webp')} type='image/webp' />
						<img
							src={withSiteBase('/images/avatar.png')}
							alt='Leo'
							width={120}
							height={120}
							className='mx-auto rounded-full border border-white/90'
							style={{ boxShadow: '0 16px 32px -5px rgba(23, 53, 63, 0.12)' }}
						/>
					</motion.picture>
				</Link>
				<h1 className='font-averia mt-2 text-[21px] leading-7 font-medium'>
					{greeting} <br /> I'm{' '}
					<span className='leo-name text-[28px]' aria-label={username}>
						{Array.from(username).map((letter, index) => {
							const tone =
								username.length === 1
									? 'leo-name-letter-middle'
									: index === 0
										? 'leo-name-letter-red'
										: index === username.length - 1
											? 'leo-name-letter-orange'
											: 'leo-name-letter-middle'
							return (
								<span className={tone} key={`${letter}-${index}`} aria-hidden='true'>
									{letter}
								</span>
							)
						})}
					</span>
					, nice to meet you!
				</h1>
			</Card>
		</HomeDraggableLayer>
	)
}
