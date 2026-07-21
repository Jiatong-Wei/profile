import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')

const requiredFiles = [
	'index.html',
	'projects/index.html',
	'blog/index.html',
	'blog/embodied-ai-roadmap/index.html',
	'blog/full-stack-robotics/index.html',
	'blog/reinforcement-learning/index.html',
	'blog/underwater-robotics/index.html',
	'blog/3dgs-campus-reconstruction/index.html',
	'about/index.html',
	'share/index.html',
	'bloggers/index.html',
	'.nojekyll',
	'robots.txt',
	'rss.xml',
	'sitemap.xml'
]

function fail(message) {
	console.error(`export check failed: ${message}`)
	process.exitCode = 1
}

if (!fs.existsSync(outDir)) fail('out/ does not exist; run pnpm run build first')

for (const relative of requiredFiles) {
	if (!fs.existsSync(path.join(outDir, relative))) fail(`missing ${relative}`)
}

const htmlFiles = []
function collect(directory) {
	if (!fs.existsSync(directory)) return
	for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
		const fullPath = path.join(directory, item.name)
		if (item.isDirectory()) collect(fullPath)
		else if (item.isFile() && item.name.endsWith('.html')) htmlFiles.push(fullPath)
	}
}
collect(outDir)

const internalLinks = new Set()
for (const file of htmlFiles) {
	const html = fs.readFileSync(file, 'utf8')
	if (/\/profile\/profile(?:\/|["'#?])/.test(html)) fail(`${path.relative(outDir, file)} contains a duplicated base path`)
	if (/(?:href|src)=["']\/(?:images|blogs|music|manifest\.json)(?:\/|["'])/.test(html)) {
		fail(`${path.relative(outDir, file)} contains an unprefixed public asset path`)
	}
	if (/private-lab-notes|human-written|no AI generation|AI-free/i.test(html)) {
		fail(`${path.relative(outDir, file)} contains private content or an unsupported authorship claim`)
	}

	for (const match of html.matchAll(/(?:href|src)=["'](\/profile\/[^"'#?]+)["']/g)) {
		const value = match[1]
		if (value.includes('/_next/')) continue
		internalLinks.add(value)
	}
}

for (const link of internalLinks) {
	const logical = decodeURIComponent(link.replace(/^\/profile\/?/, '').replace(/\/$/, ''))
	if (!logical || logical.startsWith('http')) continue
	const candidates = [path.join(outDir, logical, 'index.html'), path.join(outDir, `${logical}.html`), path.join(outDir, logical)]
	if (!candidates.some(candidate => fs.existsSync(candidate))) fail(`internal link has no exported target: ${link}`)
}

if (process.exitCode) process.exit(process.exitCode)
console.log(`export check passed: ${htmlFiles.length} HTML files, ${internalLinks.size} internal targets inspected`)
