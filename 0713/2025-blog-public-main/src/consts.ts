export const INIT_DELAY = 0.3
export const ANIMATION_DELAY = 0.1
export const HOME_GRID = 8
export const CARD_SPACING = 32
export const CARD_SPACING_SM = 24
export const BLOG_SLUG_KEY = process.env.BLOG_SLUG_KEY || ''

export function snapToHomeGrid(value: number) {
	return Math.round(value / HOME_GRID) * HOME_GRID
}

/**
 * GitHub 仓库配置
 */
export const GITHUB_CONFIG = {
	OWNER: process.env.NEXT_PUBLIC_GITHUB_OWNER || 'Jiatong-Wei',
	REPO: process.env.NEXT_PUBLIC_GITHUB_REPO || 'profile',
	BRANCH: process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main',
	APP_ID: process.env.NEXT_PUBLIC_GITHUB_APP_ID || '4353467',
	// Must be set via env var when PEM caching is enabled — no default to avoid trivial reversal.
	ENCRYPT_KEY: process.env.NEXT_PUBLIC_GITHUB_ENCRYPT_KEY || '',
	SOURCE_ROOT: '0713/2025-blog-public-main'
} as const
