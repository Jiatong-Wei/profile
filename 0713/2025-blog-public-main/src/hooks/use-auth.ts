import { create } from 'zustand'
import { clearAllAuthCache, getAuthToken as getToken, hasAuth as checkAuth, getPemFromCache, savePemToCache } from '@/lib/auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
interface AuthStore {
	// State
	isAuth: boolean
	privateKey: string | null

	// Actions
	setPrivateKey: (key: string) => Promise<void>
	authenticatePrivateKey: (key: string) => Promise<void>
	clearAuth: () => void
	refreshAuthState: () => Promise<void>
	getAuthToken: () => Promise<string>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
	isAuth: false,
	privateKey: null,

	setPrivateKey: async (key: string) => {
		set({ isAuth: true, privateKey: key })
		const { siteContent } = useConfigStore.getState()
		if (siteContent?.isCachePem) {
			await savePemToCache(key)
		}
	},

	authenticatePrivateKey: async (key: string) => {
		clearAllAuthCache()
		set({ isAuth: false, privateKey: key })

		try {
			await getToken()
			set({ isAuth: true })
			const { siteContent } = useConfigStore.getState()
			if (siteContent?.isCachePem) {
				await savePemToCache(key)
			}
		} catch (error) {
			clearAllAuthCache()
			set({ isAuth: false, privateKey: null })
			throw error
		}
	},

	clearAuth: () => {
		clearAllAuthCache()
		set({ isAuth: false, privateKey: null })
	},

	refreshAuthState: async () => {
		const allowPemCache = useConfigStore.getState().siteContent?.isCachePem === true
		set({ isAuth: await checkAuth(allowPemCache) })
	},

	getAuthToken: async () => {
		const token = await getToken()
		get().refreshAuthState()
		return token
	}
}))

if (typeof window !== 'undefined') {
	const allowPemCache = useConfigStore.getState().siteContent?.isCachePem === true
	if (allowPemCache) {
		getPemFromCache().then(key => {
			if (key) useAuthStore.setState({ privateKey: key })
		})
	}

	checkAuth(allowPemCache).then(isAuth => {
		if (isAuth) useAuthStore.setState({ isAuth })
	})
}
