import parse, { domToReact, type HTMLReactParserOptions, Element, type DOMNode } from 'html-react-parser'
import { Fragment, type ReactNode } from 'react'
import { MarkdownImage } from '@/components/markdown-image'
import { CodeBlock } from '@/components/code-block'
import { ContentLink } from '@/components/content-link'

export function renderMarkdownContent(html: string): ReactNode {
	const codeBlocks: Array<{ placeholder: string; code: string; preHtml: string }> = []
	const processedHtml = html.replace(/<pre\s+data-code="([^"]*)"([^>]*)>([\s\S]*?)<\/pre>/g, (_match, codeAttr, _attrs, content) => {
		const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`
		const code = codeAttr
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&amp;/g, '&')

		codeBlocks.push({ placeholder, code, preHtml: `${content}` })
		return placeholder
	})

	const options: HTMLReactParserOptions = {
		replace(domNode: DOMNode) {
			if (domNode instanceof Element && domNode.name === 'a') {
				const href = domNode.attribs.href || '#'

				return (
					<ContentLink href={href} title={domNode.attribs.title}>
						{domToReact(domNode.children as DOMNode[], options)}
					</ContentLink>
				)
			}

			if (domNode instanceof Element && domNode.name === 'img') {
				const { src, alt, title } = domNode.attribs
				return <MarkdownImage src={src} alt={alt} title={title} />
			}

			if (domNode.type === 'text' && domNode.data?.includes('__CODE_BLOCK_')) {
				return (
					<>
						{domNode.data
							.split(/(__CODE_BLOCK_\d+__)/)
							.filter(Boolean)
							.map((item, index) => {
								if (!item.startsWith('__CODE_BLOCK_')) return <Fragment key={index}>{item}</Fragment>

								const block = codeBlocks.find(candidate => candidate.placeholder === item)
								if (!block) return null

								return (
									<CodeBlock key={block.placeholder} code={block.code}>
										{parse(block.preHtml)}
									</CodeBlock>
								)
							})}
					</>
				)
			}
		}
	}

	return parse(processedHtml, options)
}
