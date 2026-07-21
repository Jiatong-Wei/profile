import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	output: 'export',
	basePath: '/profile',
	trailingSlash: true,
	devIndicators: false,
	reactStrictMode: true,
	reactCompiler: true,
	images: {
		unoptimized: true
	},
	pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
	turbopack: {
		rules: {
			'*.svg': {
				loaders: ['@svgr/webpack'],
				as: '*.js'
			}
			// ...codeInspectorPlugin({
			// 	bundler: 'turbopack'
			// })
		},

		resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json', 'css']
	},
	webpack: config => {
		config.module.rules.push({
			test: /\.svg$/i,
			use: [{ loader: '@svgr/webpack', options: { svgo: false } }]
		})

		return config
	}
}

export default nextConfig
