import parse, { domToReact, Element, type DOMNode, type HTMLReactParserOptions } from 'html-react-parser'
import { ExternalLink } from 'lucide-react'
import { renderMarkdown } from '@/lib/markdown-renderer'
import { renderWikiLinks } from '@/lib/knowledge/content'
import type { ContentEntry } from '@/lib/knowledge/types'
import { ContentLink, isExternalContentHref } from '@/components/content-link'
import { MarkdownImage } from '@/components/markdown-image'

export async function KnowledgeMarkdown({ entry }: { entry: ContentEntry }) {
	const { html } = await renderMarkdown(renderWikiLinks(entry))

	const options: HTMLReactParserOptions = {
		replace(node: DOMNode) {
			if (!(node instanceof Element)) return

			if (node.name === 'a') {
				const href = node.attribs.href || '#'
				const external = isExternalContentHref(href)
				return (
					<ContentLink href={href} title={node.attribs.title}>
						{domToReact(node.children as DOMNode[], options)}
						{external && <ExternalLink aria-hidden='true' size={13} />}
					</ContentLink>
				)
			}

			if (node.name === 'img') {
				const src = node.attribs.src || ''
				return <MarkdownImage src={src} alt={node.attribs.alt || ''} title={node.attribs.title} />
			}
		}
	}

	return <div className='knowledge-markdown'>{parse(html, options)}</div>
}
