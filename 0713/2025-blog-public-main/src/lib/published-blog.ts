import 'server-only'

import { cache } from 'react'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import blogIndex from '@/../public/blogs/index.json'
import type { BlogConfig, BlogIndexItem } from '@/app/blog/types'
import { renderMarkdown, type TocItem } from '@/lib/markdown-renderer'
import { getReadingStats, type ReadingStats } from '@/lib/reading-stats'

export type PublishedBlog = {
	slug: string
	config: BlogConfig
	html: string
	toc: TocItem[]
	readingStats: ReadingStats
	cover?: string
}

const publishedIndex = (blogIndex as BlogIndexItem[]).filter(item => item.slug && item.hidden !== true)

export function getPublishedBlogSlugs(): string[] {
	return publishedIndex.map(item => item.slug)
}

export const getPublishedBlog = cache(async (slug: string): Promise<PublishedBlog | null> => {
	const indexEntry = publishedIndex.find(item => item.slug === slug)
	if (!indexEntry) return null

	const blogDirectory = path.join(process.cwd(), 'public', 'blogs', slug)
	const [configSource, markdown] = await Promise.all([
		readFile(path.join(blogDirectory, 'config.json'), 'utf8'),
		readFile(path.join(blogDirectory, 'index.md'), 'utf8')
	])
	const config = JSON.parse(configSource) as BlogConfig
	if (config.hidden === true) return null

	const { html, toc } = await renderMarkdown(markdown)
	return {
		slug,
		config: { ...indexEntry, ...config },
		html,
		toc,
		readingStats: getReadingStats(markdown),
		cover: config.cover ?? indexEntry.cover
	}
})
