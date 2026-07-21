import fs from 'node:fs'
import path from 'node:path'

const outDir = path.join(process.cwd(), 'out')
if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true })
