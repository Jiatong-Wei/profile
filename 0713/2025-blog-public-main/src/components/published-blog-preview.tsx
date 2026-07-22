import { ShieldCheck } from 'lucide-react'
import { BlogSidebar } from '@/components/blog-sidebar'
import { renderMarkdownContent } from '@/lib/rendered-markdown-content'
import { withSiteBase } from '@/lib/site-path'
import siteContent from '@/config/site-content.json'
import type { TocItem } from '@/lib/markdown-renderer'
import type { GraphEdge, GraphNode } from '@/lib/knowledge/types'
import type { ReadingStats } from '@/lib/reading-stats'
import { ArticleMotionSurface, ArticleMotionTitle } from '@/components/article-motion'
import { ArticleReadingStats } from '@/components/article-reading-stats'

type PublishedBlogPreviewProps = {
	html: string
	toc: TocItem[]
	title: string
	tags: string[]
	date: string
	readingStats: ReadingStats
	summary?: string
	cover?: string
	slug: string
	graph: {
		nodes: GraphNode[]
		edges: GraphEdge[]
	}
}

export function PublishedBlogPreview({ html, toc, title, tags, date, readingStats, summary, cover, slug, graph }: PublishedBlogPreviewProps) {
	const summaryInContent = siteContent.summaryInContent ?? false

	return (
		<div className='article-page public-page mx-auto flex max-w-[1140px] justify-center gap-6 px-6 pt-28 max-sm:px-4 max-sm:pt-7'>
			<ArticleMotionSurface className='card glass-standard static flex-1 overflow-auto rounded-[var(--radius-card)] p-8 max-sm:p-5'>
				<div>
					<ArticleMotionTitle slug={slug} className='text-center text-2xl font-semibold'>
						{title}
					</ArticleMotionTitle>

					<div className='text-secondary mt-4 flex flex-wrap items-center justify-center gap-3 px-8 text-center text-sm'>
						{tags.map(tag => (
							<span key={tag}>#{tag}</span>
						))}
					</div>

					<div className='mt-3 flex flex-wrap items-center justify-center gap-2 text-sm'>
						<span className='text-secondary'>{date}</span>
						<ArticleReadingStats stats={readingStats} />
						<span className='human-certified-badge' title='由Leo亲自掌勺，GenAI添加量为0' aria-label='Human certified，由Leo亲自掌勺，GenAI添加量为0'>
							<ShieldCheck size={13} aria-hidden='true' />
							Human certified
						</span>
					</div>

					{summary && summaryInContent && <div className='text-secondary mt-6 cursor-text text-center text-sm'>“{summary}”</div>}

					<div className='prose mt-6 max-w-none cursor-text'>{renderMarkdownContent(html)}</div>
				</div>
			</ArticleMotionSurface>

			<BlogSidebar cover={cover ? withSiteBase(cover) : undefined} summary={summary} summaryInContent={summaryInContent} toc={toc} slug={slug} graph={graph} />
		</div>
	)
}
