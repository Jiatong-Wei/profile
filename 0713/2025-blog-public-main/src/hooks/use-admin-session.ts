'use client'

import { useSyncExternalStore } from 'react'
import { ADMIN_SESSION_CHANGE_EVENT, hasAdminSession } from '@/lib/admin-session'

function subscribe(onStoreChange: () => void) {
	window.addEventListener(ADMIN_SESSION_CHANGE_EVENT, onStoreChange)
	window.addEventListener('storage', onStoreChange)

	return () => {
		window.removeEventListener(ADMIN_SESSION_CHANGE_EVENT, onStoreChange)
		window.removeEventListener('storage', onStoreChange)
	}
}

export function useAdminSession() {
	return useSyncExternalStore(subscribe, hasAdminSession, () => false)
}
