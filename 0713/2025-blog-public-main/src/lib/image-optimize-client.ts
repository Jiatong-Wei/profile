'use client'

type ResizeOptions = {
	width: number
	height?: number
	type: 'image/png' | 'image/webp'
	quality?: number
	fit?: 'contain' | 'cover'
}

function blobToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(String(reader.result || '').replace(/^data:[^;]+;base64,/, ''))
		reader.onerror = reject
		reader.readAsDataURL(blob)
	})
}

export async function resizeImageToBase64(file: File, options: ResizeOptions): Promise<string> {
	const bitmap = await createImageBitmap(file)
	const targetWidth = options.width
	const targetHeight = options.height ?? Math.max(1, Math.round((bitmap.height / bitmap.width) * targetWidth))
	const canvas = document.createElement('canvas')
	canvas.width = targetWidth
	canvas.height = targetHeight

	const context = canvas.getContext('2d')
	if (!context) {
		bitmap.close()
		throw new Error('无法创建图片处理画布')
	}

	context.imageSmoothingEnabled = true
	context.imageSmoothingQuality = 'high'

	if (options.fit === 'cover') {
		const scale = Math.max(targetWidth / bitmap.width, targetHeight / bitmap.height)
		const drawWidth = bitmap.width * scale
		const drawHeight = bitmap.height * scale
		context.drawImage(bitmap, (targetWidth - drawWidth) / 2, (targetHeight - drawHeight) / 2, drawWidth, drawHeight)
	} else {
		context.drawImage(bitmap, 0, 0, targetWidth, targetHeight)
	}
	bitmap.close()

	const blob = await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(result => (result ? resolve(result) : reject(new Error('图片压缩失败'))), options.type, options.quality)
	})

	if (blob.type !== options.type) throw new Error(`浏览器不支持输出 ${options.type}`)
	return blobToBase64(blob)
}
