import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useLatestBlog } from '@/hooks/use-blog-index'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING, snapToHomeGrid } from '@/consts'
import dayjs from 'dayjs'
import Link from 'next/link'
import { HomeDraggableLayer } from './home-draggable-layer'
import { withSiteBase } from '@/lib/site-path'
import { FileText } from 'lucide-react'

export default function ArticleCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const { blog, loading } = useLatestBlog()
	const styles = cardStyles.articleCard
	const hiCardStyles = cardStyles.hiCard
	const socialButtonsStyles = cardStyles.socialButtons

	const x =
		styles.offsetX !== null
			? center.x + styles.offsetX
			: snapToHomeGrid(center.x + hiCardStyles.width / 2 - socialButtonsStyles.width - CARD_SPACING - styles.width)
	const y = styles.offsetY !== null ? center.y + styles.offsetY : snapToHomeGrid(center.y + hiCardStyles.height / 2 + CARD_SPACING)

	return (
		<HomeDraggableLayer cardKey='articleCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card cardKey='articleCard' glassTone='standard' order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='space-y-2 max-[899px]:static'>
				{siteContent.enableChristmas && (
					<img
						src={withSiteBase('/images/christmas/snow-9.webp')}
						alt='Christmas decoration'
						className='pointer-events-none absolute'
						style={{ width: 140, left: -12, top: -16, opacity: 0.8 }}
					/>
				)}

				<h2 className='text-secondary text-xs font-medium'>最新文章</h2>

				{loading ? (
					<div className='flex h-[60px] items-center justify-center'>
						<span className='text-secondary text-xs'>加载中...</span>
					</div>
				) : blog ? (
					<Link href={`/blog/${blog.slug}`} className='home-article-link flex items-start gap-3 rounded-xl'>
						{blog.cover ? (
							<img src={withSiteBase(blog.cover)} alt='' loading='lazy' decoding='async' className='h-12 w-12 shrink-0 rounded-xl border object-cover' />
						) : (
							<div className='text-brand-ink grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/60' aria-hidden='true'>
								<FileText size={18} />
							</div>
						)}
						<div className='min-w-0 flex-1'>
							<h3 className='line-clamp-1 text-sm font-medium'>{blog.title || blog.slug}</h3>
							{blog.summary && <p className='text-secondary mt-1 line-clamp-2 text-xs leading-relaxed'>{blog.summary}</p>}
							<p className='text-secondary mt-2 text-[11px]'>{dayjs(blog.date).format('YYYY/M/D')}</p>
						</div>
					</Link>
				) : (
					<div className='flex h-[60px] items-center justify-center'>
						<span className='text-secondary text-xs'>暂无文章</span>
					</div>
				)}
			</Card>
		</HomeDraggableLayer>
	)
}
