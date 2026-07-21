import useSWR from 'swr'
import { useAuthStore } from '@/hooks/use-auth'
import type { BlogIndexItem } from '@/app/blog/types'
import { withSiteBase } from '@/lib/site-path'
import blogIndex from '@/../public/blogs/index.json'

export type { BlogIndexItem } from '@/app/blog/types'

const initialBlogIndex = blogIndex as BlogIndexItem[]

// 改进 fetcher，抛出状态码以便处理 404
const fetcher = async (url: string) => {
	const res = await fetch(url, { cache: 'no-store' })
	if (!res.ok) {
		const error: any = new Error('Fetch failed')
		error.status = res.status
		throw error
	}
	const data = await res.json()
	return Array.isArray(data) ? data : []
}

export function useBlogIndex(fallbackData: BlogIndexItem[] = initialBlogIndex) {
	const { isAuth } = useAuthStore()
	const { data, error, isLoading } = useSWR<BlogIndexItem[]>(withSiteBase('/blogs/index.json'), fetcher, {
		fallbackData,
		revalidateOnFocus: false,
		revalidateOnReconnect: true
	})

	let result = data || []
	if (!isAuth) {
		result = result.filter(item => !item.hidden)
	}

	return {
		items: result,
		loading: isLoading && data === undefined,
		error
	}
}

export function useLatestBlog() {
	const { items, loading, error } = useBlogIndex()

	const latestBlog = items.length > 0 ? [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null

	return {
		blog: latestBlog,
		loading,
		error
	}
}
