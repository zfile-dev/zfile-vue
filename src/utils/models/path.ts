import { strIsEmpty } from "~/utils";

export const concatPath = (...paths: (string | null | undefined)[]): string => {
	let result: string | null = null;
	for (let path of paths) {
		if (!path) {
			continue;
		}
		if (result === null) {
			result = path;
			continue;
		}
		result = result + '/' + path;
	}
	if (result === null) {
		return '';
	}
	return removeDuplicateSeparator(result);
}

export const concatPathAndEncodeAll = (...paths: (string | null | undefined)[]): string => {
	return encodeAllIgnoreSlashes(concatPath(...paths));
}

export const removeDuplicateSeparator = (path: string): string => {
	let result = '';

	if (path.indexOf("http://") === 0) {
		result = "http://";
	} else if (path.indexOf("https://") === 0) {
		result = "https://";
	}

	for (let i = result.length; i < path.length - 1; i++) {
		let current = path.charAt(i);
		let next = path.charAt(i + 1);
		if (!(current === '/' && next === '/')) {
			result += current;
		}
	}
	result += path.charAt(path.length - 1);
	return result;
}

export const encodeAllIgnoreSlashes = (str: string): string => {
	if (strIsEmpty(str)) {
		return '';
	}

	let result = '';
	let prevIndex = -1;

	for (let i = 0; i < str.length; i++) {
		const c = str.charAt(i);
		if (c === '/') {
			if (prevIndex < i) {
				let subStr = str.substring(prevIndex + 1, i);
				result += encodeURIComponent(subStr);
				prevIndex = i;
			}
			result += c;
		}

		if (i === str.length - 1 && prevIndex < i) {
			let subStr = str.substring(prevIndex + 1, i + 1);
			result += encodeURIComponent(subStr);
		}
	}
	return result;
}

export function buildKkFileViewUrl(file: any, kkFileViewUrl: string) {
	const originalFileName = file.name;
	const fileUrl = file.url;

	if (!kkFileViewUrl || !fileUrl || !originalFileName) {
		console.error("构建 kkFileView URL 失败：缺少必要参数。");
		return null;
	}

	// 1. 构造安全文件名
	const lastDotIndex = originalFileName.lastIndexOf('.');
	const extension = (lastDotIndex !== -1) ? originalFileName.substring(lastDotIndex) : '';
	let safeBaseName;
	if (typeof window.crypto?.randomUUID === 'function') {
		safeBaseName = window.crypto.randomUUID();
	} else {
		safeBaseName = Date.now().toString(36) + Math.random().toString(36).substring(2);
	}
	const safeFileName = `${safeBaseName}${extension}`;

	// 2. 拼接 fullfilename 参数
	const separator = fileUrl.includes('?') ? '&' : '?';
	const urlToEncode = `${fileUrl}${separator}fullfilename=${safeFileName}`;

	// 3. Base64 编码
	const encoder = new TextEncoder();
	const utf8Bytes = encoder.encode(urlToEncode);
	const byteString = String.fromCharCode(...utf8Bytes);
	const base64Url = btoa(byteString);

	// 4. URL 编码
	const finalEncodedUrl = encodeURIComponent(base64Url);

	// 5. 返回最终 URL
	return `${kkFileViewUrl}/onlinePreview?url=${finalEncodedUrl}`;
}
