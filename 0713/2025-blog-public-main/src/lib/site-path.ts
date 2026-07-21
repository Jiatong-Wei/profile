export const SITE_BASE_PATH = '/profile'
export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://jiatong-wei.github.io').replace(/\/$/, '')
export const SITE_URL = `${SITE_ORIGIN}${SITE_BASE_PATH}`

const externalPattern = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i

export function withSiteBase(value: string): string {
	if (!value || externalPattern.test(value)) return value

	const path = value.startsWith('/') ? value : `/${value}`
	if (path === SITE_BASE_PATH || path.startsWith(`${SITE_BASE_PATH}/`)) return path

	return `${SITE_BASE_PATH}${path}`
}

export function withoutSiteBase(value: string): string {
	if (value === SITE_BASE_PATH) return '/'
	if (value.startsWith(`${SITE_BASE_PATH}/`)) return value.slice(SITE_BASE_PATH.length)
	return value
}
