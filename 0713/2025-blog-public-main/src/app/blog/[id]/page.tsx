import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import dayjs from 'dayjs'
import { buildGraph, getPublishedEntries } from '@/lib/knowledge/content'
import { getPublishedBlog, getPublishedBlogSlugs } from '@/lib/published-blog'
import { PublishedBlogPreview } from '@/components/published-blog-preview'
import { ArticleReadMarker } from '@/components/article-read-marker'
import { AdminEditLink } from '@/components/admin-edit-link'

export const dynamicParams = false

export function generateStaticParams() {
	return getPublishedBlogSlugs().map(id => ({ id }))
}

type BlogDetailProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: BlogDetailProps): Promise<Metadata> {
	const { id } = await params
	const blog = await getPublishedBlog(id)
	if (!blog) return {}

	return {
		title: blog.config.title,
		description: blog.config.summary
	}
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
	const { id } = await params
	const blog = await getPublishedBlog(id)
	if (!blog) notFound()

	const publicEntries = getPublishedEntries().filter(entry => entry.collection === 'wiki' || entry.collection === 'projects')
	const title = blog.config.title || id
	const date = dayjs(blog.config.date).format('YYYY年 M月 D日')

	return (
		<>
			<ArticleReadMarker slug={id} />
			<PublishedBlogPreview
				html={blog.html}
				toc={blog.toc}
				title={title}
				tags={blog.config.tags || []}
				date={date}
				readingStats={blog.readingStats}
				summary={blog.config.summary}
				cover={blog.cover}
				slug={id}
				graph={buildGraph(publicEntries)}
			/>

			<AdminEditLink href={`/write/${id}`} label='编辑文章' />
		</>
	)
}
