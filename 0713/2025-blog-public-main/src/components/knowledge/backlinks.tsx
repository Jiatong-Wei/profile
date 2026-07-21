import Link from 'next/link'
import { CornerDownLeft } from 'lucide-react'
import type { Backlink } from '@/lib/knowledge/types'

export function KnowledgeBacklinks({ backlinks }: { backlinks: Backlink[] }) {
	return (
		<aside className='knowledge-backlinks' aria-labelledby='backlinks-title'>
			<div className='knowledge-aside-heading'>
				<CornerDownLeft aria-hidden='true' size={17} />
				<h2 id='backlinks-title'>反向链接</h2>
			</div>
			{backlinks.length ? (
				<ul>
					{backlinks.map(backlink => (
						<li key={backlink.id}>
							<Link href={`/${backlink.collection}/${backlink.slug}/`}>
								<strong>{backlink.title}</strong>
								<span>{backlink.summary}</span>
							</Link>
						</li>
					))}
				</ul>
			) : (
				<p className='knowledge-aside-empty'>暂时没有其它公开内容指向这里。</p>
			)}
		</aside>
	)
}
