'use client'

import { useMemo } from 'react'
import { motion } from 'motion/react'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import { useSize } from '@/hooks/use-size'
import { BlogSidebar } from '@/components/blog-sidebar'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import type { GraphEdge, GraphNode } from '@/lib/knowledge/types'
import { ShieldCheck } from 'lucide-react'
import { pageReveal } from '@/lib/motion'
import { getReadingStats } from '@/lib/reading-stats'
import { ArticleReadingStats } from '@/components/article-reading-stats'

type BlogPreviewProps = {
	markdown: string
	title: string
	tags: string[]
	date: string
	summary?: string
	cover?: string
	slug?: string
	graph?: {
		nodes: GraphNode[]
		edges: GraphEdge[]
	}
}

export function BlogPreview({ markdown, title, tags, date, summary, cover, slug, graph }: BlogPreviewProps) {
	const { maxSM: isMobile } = useSize()
	const { content, toc, loading } = useMarkdownRender(markdown)
	const { siteContent } = useConfigStore()
	const summaryInContent = siteContent.summaryInContent ?? false
	const readingStats = useMemo(() => getReadingStats(markdown), [markdown])

	if (loading) {
		return <div className='text-secondary flex h-full items-center justify-center text-sm'>渲染中...</div>
	}

	return (
		<div className='article-page public-page mx-auto flex max-w-[1140px] justify-center gap-6 px-6 pt-28 max-sm:px-4 max-sm:pt-7'>
			<motion.article
				variants={pageReveal}
				initial='hidden'
				animate='visible'
				className='card glass-standard static flex-1 overflow-auto rounded-[var(--radius-card)] p-8 max-sm:p-5'>
				<div>
					<div className='text-center text-2xl font-semibold'>{title}</div>

					<div className='text-secondary mt-4 flex flex-wrap items-center justify-center gap-3 px-8 text-center text-sm'>
						{tags.map(t => (
							<span key={t}>#{t}</span>
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

					<div className='prose mt-6 max-w-none cursor-text'>{content}</div>
				</div>
			</motion.article>

			{!isMobile && <BlogSidebar cover={cover} summary={summary} summaryInContent={summaryInContent} toc={toc} slug={slug} graph={graph} />}
		</div>
	)
}
