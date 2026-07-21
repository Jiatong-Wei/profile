import { useEffect, useState, type ReactNode } from 'react'
import { renderMarkdown, type TocItem } from '@/lib/markdown-renderer'
import { renderMarkdownContent } from '@/lib/rendered-markdown-content'

type MarkdownRenderResult = {
	content: ReactNode
	toc: TocItem[]
	loading: boolean
}

export function useMarkdownRender(markdown: string): MarkdownRenderResult {
	const [content, setContent] = useState<ReactNode>(null)
	const [toc, setToc] = useState<TocItem[]>([])
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		let cancelled = false

		async function render() {
			setLoading(true)
			try {
				const { html, toc } = await renderMarkdown(markdown)
				if (!cancelled) {
					setContent(renderMarkdownContent(html))
					setToc(toc)
				}
			} catch (error) {
				console.error('Markdown render error:', error)
				if (!cancelled) {
					setContent(null)
					setToc([])
				}
			} finally {
				if (!cancelled) {
					setLoading(false)
				}
			}
		}

		render()

		return () => {
			cancelled = true
		}
	}, [markdown])

	return { content, toc, loading }
}
