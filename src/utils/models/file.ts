export const fileSizeFormat = (bytes: number): string => {
	if (bytes === 0) return '-';
	if (bytes === -1) return '未知';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

export const fileSizeFilter = (row: { type: string, size?: number }, column: any, bytes: number): string => {
	if (row.type === "BACK") return '';
	if (row.type === "FOLDER" && !row.size) return '-';
	if (bytes === 0) return '0 B';
	if (bytes === -1) return '未知';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return fileSizeFormat(bytes);
}

export const getFileIconName = (file: { type: string, name: string }): string => {
	let iconName: string;
	if (file.type === 'BACK' || file.type === 'FOLDER' || file.type === 'ROOT') {
		return file.type.toLowerCase();
	} else {
		const fileSuffix = getFileSuffix(file.name);
		const fileType = getFileType(file.name);

		if (constant.iconFileType.indexOf(fileSuffix) !== -1) {
			iconName = fileSuffix;
		} else if (fileType) {
			iconName = fileType;
		} else {
			iconName = 'file';
		}
	}
	return iconName;
}

export const getFileSuffix = (name: string): string => {
	const lastIndex = name.lastIndexOf('.');
	if (lastIndex === -1) {
		return 'other';
	}
	return name.substring(lastIndex + 1).toLowerCase();
}

export const getFileName = (name: string): string => {
	const lastIndex = name.lastIndexOf('/');
	if (lastIndex === -1) {
		return name;
	}
	return name.substring(lastIndex + 1);
}

export const getFileNameIgnoreExt = (name: string): string => {
	const lastIndex = name.lastIndexOf('.');
	if (lastIndex === -1) {
		return '';
	}
	return name.substring(0, lastIndex);
}

export const getFileType = (name: string): string | undefined => {
	let fileType: string | undefined;
	for (const key in constant.fileTypeMap) {
		const suffix = getFileSuffix(name);
		if (constant.fileTypeMap[key].indexOf(suffix) !== -1) {
			fileType = key;
			break;
		}
	}
	return fileType;
}
