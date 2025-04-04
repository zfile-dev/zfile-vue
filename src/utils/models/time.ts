import { reactive } from "vue";

type TimeUnit = 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y' | 'forever';

interface TimeItem {
	value: number;
	unit: TimeUnit;
}

export const getUnitMax = (unit: TimeUnit): number => {
	switch (unit) {
		case 's':
			return 59;
		case 'm':
			return 59;
		case 'h':
			return 23;
		case 'd':
			return 31;
		case 'w':
			return 52;
		case 'M':
			return 12;
		case 'y':
			return 100;
		case 'forever':
			return 99999999;
		default:
			return 0;
	}
}

export const generateSeconds = (item: TimeItem): number => {
	if (!item) return 0;
	if (!item.value) return 0;
	if (!item.unit) return 0;
	if (item.unit === 'forever') return -1;
	const value = parseInt(item.value.toString());
	switch (item.unit) {
		case "s":
			return value;
		case "m":
			return value * 60;
		case "h":
			return value * 60 * 60;
		case "d":
			return value * 60 * 60 * 24;
		case "w":
			return value * 60 * 60 * 24 * 7;
		case "M":
			return value * 60 * 60 * 24 * 30;
		case "y":
			return value * 60 * 60 * 24 * 365;
		default:
			return 0;
	}
}

interface Shortcut {
	text: string;
	value: () => [Date, Date];
}

export const shortcuts: Shortcut[] = [
	{
		text: '前一周',
		value: () => {
			const end = new Date();
			const start = new Date();
			start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
			return [start, end];
		},
	},
	{
		text: '前一月',
		value: () => {
			const end = new Date();
			const start = new Date();
			start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
			return [start, end];
		},
	},
	{
		text: '前三月',
		value: () => {
			const end = new Date();
			const start = new Date();
			start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
			return [start, end];
		},
	},
	{
		text: '前六月',
		value: () => {
			const end = new Date();
			const start = new Date();
			start.setTime(start.getTime() - 3600 * 1000 * 24 * 180);
			return [start, end];
		},
	},
	{
		text: '前一年',
		value: () => {
			const end = new Date();
			const start = new Date();
			start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
			return [start, end];
		},
	},
];

export const defaultTime = reactive([new Date(0, 0, 0, 0, 0, 0), new Date(0, 0, 0, 23, 59, 59)]);
export const dateValueFormat = 'YYYY-MM-DD HH:mm:ss';
