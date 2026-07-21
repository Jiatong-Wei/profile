export const GITHUB_TOKEN_CACHE_KEY = 'github_token'
export const ADMIN_SESSION_CHANGE_EVENT = 'profile-admin-session-change'

export function hasAdminSession(): boolean {
	if (typeof sessionStorage === 'undefined') return false

	try {
		return Boolean(sessionStorage.getItem(GITHUB_TOKEN_CACHE_KEY))
	} catch {
		return false
	}
}

export function notifyAdminSessionChange(): void {
	if (typeof window === 'undefined') return
	window.dispatchEvent(new Event(ADMIN_SESSION_CHANGE_EVENT))
}
