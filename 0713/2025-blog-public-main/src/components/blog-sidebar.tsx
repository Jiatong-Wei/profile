import LikeButton from '@/components/like-button'
import { BlogToc } from '@/components/blog-toc'
import { ScrollTopButton } from '@/components/scroll-top-button'
import { DeferredKnowledgeGraph } from '@/components/deferred-knowledge-graph'
import type { GraphEdge, GraphNode } from '@/lib/knowledge/types'
import type { CSSProperties } from 'react'

type TocItem = {
	id: string
	text: string
	level: number
}

type BlogSidebarProps = {
	cover?: string
	summary?: string
	summaryInContent?: boolean
	toc: TocItem[]
	slug?: string
	graph?: {
		nodes: GraphNode[]
		edges: GraphEdge[]
	}
}

export function BlogSidebar({ cover, summary, summaryInContent = false, toc, slug, graph }: BlogSidebarProps) {
	const hasSummaryPanel = Boolean(summary && !summaryInContent)
	const tocDelay = (Number(Boolean(cover)) + Number(hasSummaryPanel)) * 40
	const graphDelay = tocDelay + 40
	const entranceStyle = (delay: number) => ({ '--article-sidebar-delay': `${delay}ms` }) as CSSProperties

	return (
		<div className='sticky flex w-[360px] shrink-0 flex-col items-start gap-3 self-start max-lg:w-[280px] max-sm:hidden' style={{ top: 24 }}>
			<div className='article-inspector glass-panel glass-standard w-full rounded-[var(--radius-card)] p-3' aria-label='文章信息'>
				{cover && (
					<div className='article-inspector-section article-sidebar-enter' style={entranceStyle(0)}>
						<img src={cover} alt='cover' loading='lazy' decoding='async' className='h-auto w-full rounded-xl border object-cover' />
					</div>
				)}

				{summary && !summaryInContent && (
					<div className='article-inspector-section article-sidebar-enter text-sm' style={entranceStyle(cover ? 40 : 0)}>
						<h2 className='text-secondary mb-2 font-medium'>摘要</h2>
						<div className='text-secondary scrollbar-none max-h-[240px] cursor-text overflow-auto'>{summary}</div>
					</div>
				)}

				<BlogToc toc={toc} entranceDelay={tocDelay} embedded />

				{graph && graph.nodes.length > 0 && (
					<div className='article-inspector-section article-sidebar-enter' style={entranceStyle(graphDelay)}>
						<h2 className='text-secondary mb-2 font-medium'>知识图谱</h2>
						<div className='text-secondary mb-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px]' aria-label='图谱节点类型'>
							<span className='inline-flex items-center gap-1'>
								<i className='bg-brand h-2 w-2 rounded-full' aria-hidden='true' />
								笔记
							</span>
							<span className='inline-flex items-center gap-1'>
								<i className='bg-brand-secondary h-2 w-2 rounded-full' aria-hidden='true' />
								项目
							</span>
						</div>
						<DeferredKnowledgeGraph nodes={graph.nodes} edges={graph.edges} currentNodeId={slug ? `wiki:${slug}` : undefined} />
					</div>
				)}
			</div>

			<LikeButton slug={slug} />

			<ScrollTopButton />
		</div>
	)
}
