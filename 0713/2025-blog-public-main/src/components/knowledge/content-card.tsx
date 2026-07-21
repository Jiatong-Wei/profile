import Link from 'next/link'
import { ArrowUpRight, CalendarDays } from 'lucide-react'
import type { ContentEntry } from '@/lib/knowledge/types'

const collectionLabel = {
	wiki: 'Wiki',
	papers: 'Paper',
	projects: 'Project'
}

export function KnowledgeContentCard({ entry }: { entry: ContentEntry }) {
	const date = entry.meta.updated ?? entry.meta.period ?? entry.meta.year

	return (
		<article className={`knowledge-content-card knowledge-content-card-${entry.collection}`}>
			<div className='knowledge-card-meta'>
				<span>{collectionLabel[entry.collection]}</span>
				{entry.meta.status && <span className='knowledge-status'>{entry.meta.status}</span>}
			</div>
			<h3>
				<Link href={`/${entry.collection}/${entry.slug}/`}>
					{entry.meta.title}
					<ArrowUpRight aria-hidden='true' size={16} />
				</Link>
			</h3>
			<p>{entry.meta.summary}</p>
			<div className='knowledge-card-footer'>
				<div className='knowledge-tags'>
					{entry.meta.tags.slice(0, 3).map(tag => (
						<Link href={`/tags/${encodeURIComponent(tag)}/`} key={tag}>
							{tag}
						</Link>
					))}
				</div>
				{date && (
					<span className='knowledge-card-date'>
						<CalendarDays aria-hidden='true' size={14} />
						{date}
					</span>
				)}
			</div>
		</article>
	)
}
