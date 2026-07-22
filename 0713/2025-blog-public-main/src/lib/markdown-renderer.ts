import { marked } from 'marked'
import type { Tokens } from 'marked'
import { withSiteBase } from '@/lib/site-path'

export type TocItem = { id: string; text: string; level: number }

export interface MarkdownRenderResult {
	html: string
	toc: TocItem[]
}

export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
}

function escapeHtml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeHtmlAttribute(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;')
}

function resolveMarkdownUrl(value: string): string {
	return value.startsWith('/') ? withSiteBase(value) : value
}

// ── Module-level extension state (math extensions are global in marked) ──
let mathExtensionsRegistered = false
let currentKatexModule: any = null

function renderMathWithKatex(content: string, displayMode: boolean): string {
	if (!currentKatexModule) {
		return displayMode ? `$$${content}$$` : `$${content}$`
	}
	try {
		return currentKatexModule.renderToString(content, {
			displayMode,
			throwOnError: false,
			output: 'html',
			strict: 'ignore'
		})
	} catch {
		return displayMode ? `$$${content}$$` : `$${content}$`
	}
}

// Lazy load shiki to handle environments where it's not available (e.g., Cloudflare Workers)
let shikiModule: typeof import('shiki') | null = null
let shikiLoadAttempted = false

async function loadShiki() {
	if (shikiLoadAttempted) {
		return shikiModule
	}
	shikiLoadAttempted = true

	try {
		shikiModule = await import('shiki')
		return shikiModule
	} catch (error) {
		console.warn('Failed to load shiki module:', error)
		return null
	}
}

// Lazy load katex to handle environments where it's not available (e.g., Cloudflare Workers)
let katexModule: typeof import('katex') | null = null
let katexLoadAttempted = false

async function loadKatex() {
	if (katexModule) return katexModule
	if (katexLoadAttempted) return null
	katexLoadAttempted = true

	try {
		// katex is published as CJS; depending on bundler/runtime the dynamic import
		// may return either the exports object directly or as `default`.
		const mod: any = await import('katex')
		katexModule = (mod?.default ?? mod) as any
		return katexModule
	} catch (error) {
		console.warn('Failed to load katex module:', error)
		return null
	}
}

export async function renderMarkdown(markdown: string): Promise<MarkdownRenderResult> {
	// Load optional renderers first so they apply on the FIRST lex/parse pass.
	// (If we lex before registering extensions, math tokens won't ever be produced on a cold refresh.)
	const codeBlockMap = new Map<string, { html: string; original: string }>()
	const [shiki, katex] = await Promise.all([loadShiki(), loadKatex()])

	// Render HTML with heading ids
	const renderer = new marked.Renderer()
	const renderTable = renderer.table

	renderer.table = function (token: Tokens.Table) {
		const widthClass = token.header.length >= 4 ? ' table-scroll-wide' : ''
		return `<div class="table-scroll${widthClass}" role="region" aria-label="可横向滚动的表格" tabindex="0">${renderTable.call(this, token)}</div>`
	}

	renderer.link = ({ href, title, tokens }: Tokens.Link) => {
		const text = marked.parser(tokens) as string
		const titleAttribute = title ? ` title="${escapeHtmlAttribute(title)}"` : ''
		const resolvedHref = resolveMarkdownUrl(href)
			const relAttribute = /^(https?:|\/\/)/i.test(resolvedHref) ? ' rel="noreferrer noopener"' : ''
			return `<a href="${escapeHtmlAttribute(resolvedHref)}"${titleAttribute}${relAttribute}>${text}</a>`
	}

	renderer.image = ({ href, title, text }: Tokens.Image) => {
		const titleAttribute = title ? ` title="${escapeHtmlAttribute(title)}"` : ''
		return `<img src="${escapeHtmlAttribute(resolveMarkdownUrl(href))}" alt="${escapeHtmlAttribute(text || '')}"${titleAttribute}>`
	}

	renderer.heading = (token: Tokens.Heading) => {
		const id = slugify(token.text || '')
		return `<h${token.depth} id="${id}">${escapeHtml(token.text)}</h${token.depth}>`
	}

	renderer.code = (token: Tokens.Code) => {
		// Check if this code block was pre-processed
		const codeData = codeBlockMap.get(token.text)
		if (codeData) {
			// Add data-code attribute with original code for copy functionality
			// Escape HTML entities for attribute value
			const escapedCode = codeData.original.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
			if (codeData.html) {
				// Shiki highlighted code
				return `<pre data-code="${escapedCode}">${codeData.html}</pre>`
			}
			// Fallback for failed highlighting
			return `<pre data-code="${escapedCode}"><code>${codeData.original}</code></pre>`
		}
		// Fallback to default (inline code, not code block)
		return `<code>${token.text}</code>`
	}

	renderer.listitem = (token: Tokens.ListItem) => {
		// Render inline markdown inside list items (e.g. links, emphasis)
		let inner = token.text
		let tokens = token.tokens

		if (token.task) tokens = tokens.slice(1)
		inner = marked.parser(tokens) as string

		if (token.task) {
			const checkbox = token.checked ? '<input type="checkbox" checked disabled />' : '<input type="checkbox" disabled />'
			return `<li class="task-list-item">${checkbox} ${inner}</li>\n`
		}

		return `<li>${inner}</li>\n`
	}

	// Update the module-level katex reference so extension renderers can use it.
	currentKatexModule = katex

	// Register math extensions once (extensions are global in marked).
	if (!mathExtensionsRegistered) {
		marked.use({
			extensions: [
				// Block math: $$ ... $$
				{
					name: 'mathBlock',
					level: 'block',
					start(src: string) {
						return src.indexOf('$$')
					},
					tokenizer(src: string) {
						const match = src.match(/^\$\$([\s\S]+?)\$\$(?:\n+|$)/)
						if (!match) return
						return {
							type: 'mathBlock',
							raw: match[0],
							text: match[1].trim()
						} as any
					},
					renderer(token: any) {
						return `${renderMathWithKatex(token.text || '', true)}\n`
					}
				},
				// Inline math: $ ... $
				{
					name: 'mathInline',
					level: 'inline',
					start(src: string) {
						const idx = src.indexOf('$')
						return idx === -1 ? undefined : idx
					},
					tokenizer(src: string) {
						// Avoid $$ (block) and escaped dollars
						if (src.startsWith('$$')) return
						if (src.startsWith('\\$')) return

						const match = src.match(/^\$([^\n$]+?)\$/)
						if (!match) return

						const inner = match[1]
						// Heuristic: require some non-space content
						if (!inner || !inner.trim()) return

						return {
							type: 'mathInline',
							raw: match[0],
							text: inner.trim()
						} as any
					},
					renderer(token: any) {
						return renderMathWithKatex(token.text || '', false)
					}
				}
			]
		})
		mathExtensionsRegistered = true
	}

	// Set the per-call renderer (marked.use with renderer merely replaces the default — it is idempotent).
	marked.use({ renderer })

	// Pre-process with marked lexer first (after extensions are registered)
	const tokens = marked.lexer(markdown)

	// Extract TOC from parsed tokens (this correctly skips code blocks)
	const toc: TocItem[] = []
	function extractHeadings(tokenList: typeof tokens) {
		for (const token of tokenList) {
			if (token.type === 'heading' && token.depth <= 3) {
				// Use the parsed text (markdown syntax like links/code already stripped)
				const text = token.text
				const id = slugify(text)
				toc.push({ id, text, level: token.depth })
			}
			// Recursively check nested tokens (e.g., in blockquotes, lists)
			if ('tokens' in token && token.tokens) {
				extractHeadings(token.tokens as typeof tokens)
			}
		}
	}
	extractHeadings(tokens)

	// Pre-process code blocks with Shiki
	for (const token of tokens) {
		if (token.type === 'code') {
			const codeToken = token as Tokens.Code
			const originalCode = codeToken.text
			const key = `__SHIKI_CODE_${codeBlockMap.size}__`

			if (shiki) {
				try {
					const html = await shiki.codeToHtml(originalCode, {
						lang: codeToken.lang || 'text',
						theme: 'one-light'
					})
					codeBlockMap.set(key, { html, original: originalCode })
					codeToken.text = key
				} catch {
					// Keep original if highlighting fails
					codeBlockMap.set(key, { html: '', original: originalCode })
					codeToken.text = key
				}
			} else {
				// Fallback when shiki is not available
				codeBlockMap.set(key, { html: '', original: originalCode })
				codeToken.text = key
			}
		}
	}
	const html = (marked.parser(tokens) as string) || ''

	return { html, toc }
}
