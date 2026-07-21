'use client'

import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { SearchItem } from '@/lib/knowledge/types'

export function KnowledgeSearch({ items }: { items: SearchItem[] }) {
	const [query, setQuery] = useState('')
	const normalized = query.trim().toLocaleLowerCase()
	const results = useMemo(() => {
		if (!normalized) return items.slice(0, 7)
		const terms = normalized.split(/\s+/).filter(Boolean)
		return items
			.filter(item => {
				const searchable = [item.title, item.summary, item.body, item.collection, ...item.tags].join(' ').toLocaleLowerCase()
				return terms.every(term => searchable.includes(term))
			})
			.slice(0, 12)
	}, [items, normalized])

	return (
		<section className='knowledge-search' aria-label='搜索公开内容'>
		<label htmlFor='knowledge-search-input'>搜索 Wiki、paper 和 project</label>
		<div className='knowledge-search-input-wrap'>
			<Search aria-hidden='true' size={18} />
			<input
				id='knowledge-search-input'
				value={query}
				onChange={event => setQuery(event.target.value)}
				placeholder='输入主题、标签或标题'
			/>
			{query && (
				<button type='button' onClick={() => setQuery('')} aria-label='清除搜索'>
					<X aria-hidden='true' size={17} />
				</button>
			)}
		</div>
		<div className='knowledge-search-results' aria-live='polite'>
			{results.length ? (
				results.map(item => (
					<Link href={item.href} key={item.id}>
						<span>{item.collection}</span>
						<strong>{item.title}</strong>
						<small>{item.summary}</small>
					</Link>
				))
			) : (
				<p>没有匹配的公开内容。</p>
			)}
		</div>
	</section>
	)
}
