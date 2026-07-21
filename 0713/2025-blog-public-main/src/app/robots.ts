import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-path'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/profile/',
				disallow: '/profile/write/'
			}
		],
		sitemap: `${SITE_URL}/sitemap.xml`
	}
}
