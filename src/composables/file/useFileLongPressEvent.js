import { onLongPress } from '@vueuse/core'

import uaBrowser from 'ua-browser'
const browserInfo = uaBrowser();

import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

import useFileContextMenu from "~/composables/file/useFileContextMenu";
const { showFileMenu } = useFileContextMenu();

/**
 * 绑定元素长按事件
 * @param 	elementRef		可长按区域元素引用
 * @param 	parseRowFunc	解析长按数据行的方法
 */
const bindElementLongPressEvent = (elementRef, parseRowFunc) => {
	function onLongPressCallbackHook(e) {
		const row = parseRowFunc(e, elementRef);
		if (row) {
			showFileMenu(row, null, e)
		} else {
			showFileMenu(e)
		}
	}

	onLongPress(
		elementRef,
		onLongPressCallbackHook,
		{
			modifiers: {
				prevent: true,
				stop: true,
				capture: true
			}
		}
	)
}

/**
 * 解析 el-table 下长按行数据
 * @param e				长按事件对象
 * @param elementRef	可长按区域元素引用
 */
const parseElTableRowFunc = (e, elementRef) => {
	const target = e.target;
	const ListTable = elementRef.value.querySelector('#ListTable')
	let row = null;
	if (ListTable.contains(target)) {
		let rowEle = target.closest('.el-table__row')
		if (rowEle) {
			let children = Array.from(rowEle.parentNode.children);
			let index = children.indexOf(rowEle);
			row = fileDataStore.fileList[index];
		}
	}
	return row;
}

export default function useFileLongPressEvent(elRef) {

	onMounted(() => {
		// Safari 浏览器在移动端长按事件 (因为不支持 contextmenu 事件)
		const isIOS = browserInfo.os === 'iOS';
		const isIPAD = browserInfo.os === 'MacOS' && browserInfo.device === 'Tablet';
		if (isIOS || isIPAD) {
			bindElementLongPressEvent(elRef, parseElTableRowFunc);
		}
	})

}