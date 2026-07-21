import { marked, type Token, type Tokens } from 'marked'

export type ReadingStats = {
	wordCount: number
	readingMinutes: number
}

const CJK_CHARACTER_PATTERN = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu
const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu

function extractTokenText(token: Token | Tokens.Generic): string {
	switch (token.type) {
		case 'space':
		case 'hr':
		case 'code':
		case 'codespan':
		case 'html':
		case 'image':
		case 'def':
		case 'mathBlock':
		case 'mathInline':
			return ''
		case 'table': {
			const table = token as Tokens.Table
			const cells = [...table.header, ...table.rows.flat()]
			return cells.map(cell => extractTokenList(cell.tokens)).join(' ')
		}
		case 'list':
			return (token as Tokens.List).items.map(item => extractTokenText(item)).join(' ')
		default: {
			const nestedTokens = 'tokens' in token ? token.tokens : undefined
			if (Array.isArray(nestedTokens)) return extractTokenList(nestedTokens)
			return token.type === 'text' || token.type === 'escape' ? String('text' in token ? token.text : '') : ''
		}
	}
}

function extractTokenList(tokens: Array<Token | Tokens.Generic>): string {
	return tokens.map(extractTokenText).filter(Boolean).join(' ')
}

export function getReadingStats(markdown: string): ReadingStats {
	const readableText = extractTokenList(marked.lexer(markdown))
	const cjkCharacterCount = readableText.match(CJK_CHARACTER_PATTERN)?.length ?? 0
	const textWithoutCjk = readableText.replace(CJK_CHARACTER_PATTERN, ' ')
	const wordCount = textWithoutCjk.match(WORD_PATTERN)?.length ?? 0
	const totalCount = cjkCharacterCount + wordCount
	const readingMinutes = Math.max(1, Math.ceil(cjkCharacterCount / 300 + wordCount / 200))

	return {
		wordCount: totalCount,
		readingMinutes
	}
}
