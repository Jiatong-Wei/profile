import '@/styles/globals.css'

import type { Metadata, Viewport } from 'next'
import Layout from '@/layout'
import siteContent from '@/config/site-content.json'
import { SITE_BASE_PATH, SITE_URL } from '@/lib/site-path'

const {
	meta: { title, description },
	theme
} = siteContent

const hasBackdrop = Boolean(
	siteContent.currentBackgroundImageId && siteContent.backgroundImages?.some(item => item.id === siteContent.currentBackgroundImageId && item.url?.trim())
)

export const metadata: Metadata = {
	title,
	description,
	manifest: `${SITE_BASE_PATH}/manifest.json`,
	metadataBase: new URL(SITE_URL),
	icons: {
		icon: [
			{ url: `${SITE_BASE_PATH}/favicon-32.png`, sizes: '32x32', type: 'image/png' },
			{ url: `${SITE_BASE_PATH}/icon-192.png`, sizes: '192x192', type: 'image/png' },
			{ url: `${SITE_BASE_PATH}/favicon.png`, sizes: '512x512', type: 'image/png' }
		],
		apple: `${SITE_BASE_PATH}/icon-192.png`
	},
	openGraph: {
		title,
		description,
		type: 'website'
	},
	twitter: {
		title,
		description,
		card: 'summary'
	}
}

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	themeColor: '#f2f5f6'
}

const htmlStyle = {
	cursor: `url(${SITE_BASE_PATH}/images/cursor.svg) 2 1, auto`,
	'--color-brand': theme.colorBrand,
	'--color-primary': theme.colorPrimary,
	'--color-secondary': theme.colorSecondary,
	'--color-brand-secondary': theme.colorBrandSecondary,
	'--color-bg': theme.colorBg,
	'--color-border': theme.colorBorder,
	'--color-card': theme.colorCard,
	'--color-article': theme.colorArticle
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang='zh-CN' suppressHydrationWarning style={htmlStyle} data-has-backdrop={hasBackdrop ? 'true' : 'false'} data-scroll-behavior='smooth'>
			<body>
				<script
					dangerouslySetInnerHTML={{
						__html: `
					if (/windows|win32/i.test(navigator.userAgent)) {
						document.documentElement.classList.add('windows');
					}
		      `
					}}
				/>

				<Layout>{children}</Layout>
			</body>
		</html>
	)
}
