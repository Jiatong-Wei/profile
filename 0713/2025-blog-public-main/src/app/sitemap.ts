import type { MetadataRoute } from 'next'
import blogIndex from '@/../public/blogs/index.json'
import type { BlogIndexItem } from '@/app/blog/types'
import { SITE_URL } from '@/lib/site-path'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
	const posts: BlogIndexItem[] = blogIndex
	const staticPaths = ['/', '/blog/', '/projects/', '/about/', '/share/', '/bloggers/', '/pictures/', '/snippets/', '/clock/', '/live2d/', '/image-toolbox/', '/svgs/']

	const staticEntries: MetadataRoute.Sitemap = staticPaths.map(path => ({
		url: `${SITE_URL}${path}`,
		lastModified: new Date('2026-07-13T00:00:00.000Z'),
		changeFrequency: 'weekly',
		priority: path === '/' ? 1 : 0.8
	}))

	const postEntries: MetadataRoute.Sitemap = posts.filter(post => post.slug && !post.hidden).map(post => ({
		url: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}/`,
		lastModified: post.date ? new Date(post.date) : undefined,
		changeFrequency: 'monthly',
		priority: 0.6
	}))

	return [...staticEntries, ...postEntries]
}
