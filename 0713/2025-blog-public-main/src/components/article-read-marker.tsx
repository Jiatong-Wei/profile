'use client'

import { useEffect } from 'react'
import { useReadArticles } from '@/hooks/use-read-articles'

export function ArticleReadMarker({ slug }: { slug: string }) {
	const markAsRead = useReadArticles(state => state.markAsRead)

	useEffect(() => {
		markAsRead(slug)
	}, [markAsRead, slug])

	return null
}
