import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import dayjs from 'dayjs'
import { Pencil } from 'lucide-react'
import { buildGraph, getPublishedEntries } from '@/lib/knowledge/content'
import { getPublishedBlog, getPublishedBlogSlugs } from '@/lib/published-blog'
import { PublishedBlogPreview } from '@/components/published-blog-preview'
import { ArticleReadMarker } from '@/components/article-read-marker'

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

			<Link
				href={`/write/${id}`}
				aria-label='编辑文章'
				title='编辑文章'
				className='glass-panel glass-quiet pressable-icon text-secondary hover:text-primary fixed top-24 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-xl transition-colors max-sm:hidden'>
				<Pencil size={16} aria-hidden='true' />
			</Link>
		</>
	)
}
