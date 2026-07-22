import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING, snapToHomeGrid } from '@/consts'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { cn } from '@/lib/utils'
import { HomeDraggableLayer } from './home-draggable-layer'
import { withSiteBase } from '@/lib/site-path'
import type { CSSProperties } from 'react'

dayjs.locale('zh-cn')

export default function CalendarCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const now = dayjs()
	const currentDate = now.date()
	const firstDayOfMonth = now.startOf('month')
	const firstDayWeekday = (firstDayOfMonth.day() + 6) % 7
	const daysInMonth = now.daysInMonth()
	const currentWeekday = (now.day() + 6) % 7
	const styles = cardStyles.calendarCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard

	const x = styles.offsetX !== null ? center.x + styles.offsetX : snapToHomeGrid(center.x + CARD_SPACING + hiCardStyles.width / 2)
	const y = styles.offsetY !== null ? center.y + styles.offsetY : snapToHomeGrid(center.y - clockCardStyles.offset + CARD_SPACING)

	return (
		<HomeDraggableLayer cardKey='calendarCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card cardKey='calendarCard' glassTone='quiet' motionRole='static' order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='flex flex-col'>
				{siteContent.enableChristmas && (
					<>
						<img
							src={withSiteBase('/images/christmas/snow-7.webp')}
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 150, right: -12, top: -12, opacity: 0.8 }}
						/>
					</>
				)}

				<h3 className='text-secondary text-sm'>
					{now.format('YYYY/M/D')} {now.format('ddd')}
				</h3>
				<ul className={cn('text-secondary mt-3 grid h-[206px] flex-1 grid-cols-7 gap-2 text-sm', (styles.height < 240 || styles.width < 240) && 'text-xs')}>
					{new Array(7).fill(0).map((_, index) => {
						const isCurrentWeekday = index === currentWeekday
						return (
							<li key={index} className={cn('flex items-center justify-center font-medium', isCurrentWeekday && 'text-brand-ink')}>
								{dates[index]}
							</li>
						)
					})}

					{new Array(firstDayWeekday).fill(0).map((_, index) => (
						<li key={`empty-${index}`} />
					))}

					{new Array(daysInMonth).fill(0).map((_, index) => {
						const day = index + 1
						const isToday = day === currentDate
						return (
							<li
								key={day}
								className={cn('flex items-center justify-center rounded-lg', isToday && 'calendar-today font-medium')}
								style={isToday ? todayCellStyle : undefined}>
								{day}
							</li>
						)
					})}
				</ul>
			</Card>
		</HomeDraggableLayer>
	)
}

const todayCellStyle = {
	border: '1px solid rgba(255, 248, 238, 0.72)',
	background: 'linear-gradient(145deg, #d98945 0%, #b85b38 50%, #8f4532 100%)',
	color: '#fff',
	boxShadow: '0 7px 16px -11px rgba(125, 63, 40, 0.78), inset 0 1px 0 rgba(255, 248, 238, 0.42)',
	textShadow: '0 1px 1px rgba(79, 36, 25, 0.3)'
} satisfies CSSProperties

const dates = ['一', '二', '三', '四', '五', '六', '日']
