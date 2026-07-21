import { KJUR, KEYUTIL } from 'jsrsasign'

export function createAppJwt(appId: string, privateKeyPem: string): string {
	const now = Math.floor(Date.now() / 1000)
	const header = { alg: 'RS256', typ: 'JWT' }
	const payload = { iat: now - 60, exp: now + 8 * 60, iss: appId }
	const privateKey = KEYUTIL.getKey(privateKeyPem) as unknown as string
	return KJUR.jws.JWS.sign('RS256', JSON.stringify(header), JSON.stringify(payload), privateKey)
}
