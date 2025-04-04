export const isEmpty = (obj: any): boolean => {
	return typeof obj === "undefined" || obj === null || obj === "";
}

export const strIsEmpty = (str: string | null | undefined): boolean => {
	return !str || str.length === 0;
}

export const strIsNotEmpty = (str: string | null | undefined): boolean => {
	return !strIsEmpty(str);
}

export const convertStr = (value: string): boolean | null | any[] | string => {
	if (value === "true") {
		return true;
	} else if (value === "false") {
		return false;
	} else if (value === "null") {
		return null;
	} else if (value === "[]") {
		return [];
	}
	return value;
}

export const getSize = (obj: any): number => {
	if (isEmpty(obj)) {
		return 0;
	}
	if (Array.isArray(obj)) {
		return obj.length;
	}
	return Object.keys(obj).length;
}
