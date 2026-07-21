export const REPO_SOURCE_ROOT = '0713/2025-blog-public-main'

export function withRepoSourceRoot(value: string): string {
	const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '')
	if (normalized.split('/').some(segment => segment === '..')) {
		throw new Error('Repository paths cannot escape the configured source root')
	}
	if (!REPO_SOURCE_ROOT) return normalized
	if (normalized === REPO_SOURCE_ROOT || normalized.startsWith(`${REPO_SOURCE_ROOT}/`)) return normalized
	return `${REPO_SOURCE_ROOT}/${normalized}`
}
