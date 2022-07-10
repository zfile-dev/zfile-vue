import { useKeyModifier } from '@vueuse/core'
import {removeDuplicateSlashes} from "fast-glob/out/managers/patterns";

import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();

import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

import useFileData from "~/composables/file/useFileData";

// table ref 相关操作
import useFileRef from "~/composables/file/useFileRef";
const { clearSelection, toggleRowSelection, toggleAllSelection } = useFileRef();

import useFileOperator from "~/composables/file/useFileOperator";

// 按键监听
const mateState = useKeyModifier('Meta');
const controlState = useKeyModifier('Control');
const shiftState = useKeyModifier('Shift');

// 是否按住了 Ctrl(Windows) 或者 Command(Mac) 键
let isMultiSelectState = computed(() => {
    return mateState.value || controlState.value;
});

let batchDelete;
let selectRowsInfo;

// ctrl + a 全选
window.addEventListener("keydown", function(e) {
    if (e.key === 'Escape' && allowShortcuts()) {
        clearSelection();
    } else if (e.key === 'a' && (e.metaKey || e.ctrlKey) && allowShortcuts()) {
        e.preventDefault();
        toggleAllSelection();
    } else if (e.key === 'Delete' && allowShortcuts()) {  // 如果按了删除键，且当前状态允许快捷键操作
        if (batchDelete && selectRowsInfo?.value?.length > 0) {
            e.preventDefault();
            batchDelete();
        }
    }  else if (e.key === 'Backspace' && allowShortcuts()) {  // 如果按了删除键，且当前状态允许快捷键操作
        if (fileDataStore.fileList.length > 0 && fileDataStore.fileList[0].type === 'BACK') {
            outerTableClickRow(fileDataStore.fileList[0]);
        }
    }
}, false);

export const allowShortcuts = () => {
    // 仅鼠标悬浮在 table 上时且没有打开 dialog 时，才允许快捷键操作.
    return document.querySelector(".zfile-index-body:hover") &&
        !document.querySelector(".el-popup-parent--hidden")
}


// 拖拽选择相关
// 开始拖拽的文件行索引
const startDragClickIndex = ref(-1);
// 结束拖拽的文件行索引
const endDragClickIndex = ref(-1);
// 是否按下鼠标左键
import { useMousePressed } from '@vueuse/core'
const { pressed } = useMousePressed()

watch(() => pressed.value, (value, oldValue) => {
    // 如果之前是点击状态, 现在松开了则清除记录的拖拽索引
    if (value === false && oldValue === true) {
        startDragClickIndex.value = -1;
        endDragClickIndex.value = -1;
    }
})

let globalCurrentPath;
let outerTableClickRow;

export default function useTableOperator(router, route) {

    const { storageKey, skeletonLoading, openRow, selectRows, selectRow, currentPath } = useFileData(router, route);

    globalCurrentPath = currentPath;
    batchDelete = useFileOperator(router, route).batchDelete;

    selectRowsInfo = selectRows;

    // 文件单击事件
    const tableClickRow = (row, event) => {
        if (row.type === 'BACK') {
            if (globalConfigStore.zfileConfig.fileList.backHandler === 'click') {
                let fullPath = removeDuplicateSlashes('/' + storageKey.value + '/' + row.path);
                router.push(fullPath);
            }
            return;
        }

        // 加载骨架屏时，点击无效.
        if (skeletonLoading.value) {
            return;
        }

        let isClickSelf = selectRows.value.length === 1 && selectRow.value?.name === row.name;
        let isClickSelection = event.type === 'selection';

        // 如果按住了 shift 选中
        if (shiftState.value) {

            // 上一个选择的 index
            let prevSelectIndex = fileDataStore.fileList.findIndex(value => value.name === selectRow.value.name);

            // 如果选中行之前也按 shift 选中过行，表示要进行多选
            if (prevSelectIndex !== null) {
                let currentShiftIndex = fileDataStore.fileList.findIndex(value => value.name === row.name);

                let start = Math.min(currentShiftIndex, prevSelectIndex);
                let end = Math.max(currentShiftIndex, prevSelectIndex);

                for (let i = start + 1; i < end; i++) {
                    let item = fileDataStore.fileList[i];
                    toggleRowSelection(item, true);
                }
            }
        }
        // 如果不是以下情况，则取消所有选择：
        //      1. 多选状态：按住 command (Mac) 或 Ctrl (Windows)
        //      2. 选中当前文件: 如目前只选中了一个文件，且就是当前文件, 则不需要取消所有选择, 取消后, 无法 toggle 当前行.
        //      3. 点击的区域不是 selection, 如果点击的是 selection, 则可能为误触, 实际想点击的是 checkbox
        else if (!isMultiSelectState.value && !isClickSelf && !isClickSelection) {
            clearSelection();
        }
        toggleRowSelection(row);
    }
    outerTableClickRow = tableClickRow;

    // 文件双击事件
    const tableDbClickRow = (row) => {
        // 加载骨架屏时，点击无效.
        if (skeletonLoading.value) {
            return;
        }
        openRow(row);
    }

    // 进入悬浮事件
    const tableHoverRow = (row, column, cell, event) => {
        // 如果当前是点击状态，且开始拖拽选中索引不为 -1, 表示要进行拖拽了.
        if (event.buttons === 1 && startDragClickIndex.value !== -1) {
            // 将开始拖拽的行选中
            if (endDragClickIndex.value === -1) {
                clearSelection();
                let item = fileDataStore.fileList[startDragClickIndex.value];
                toggleRowSelection(item, true);
            }


            let newEndDragClickIndex = row.index;

            let oldEndDragClickIndex = endDragClickIndex.value >= 0 ? endDragClickIndex.value : newEndDragClickIndex - 1;

            // 可能是倒序拖拽的，所以要区分 start 和 end
            let start = Math.min(oldEndDragClickIndex, newEndDragClickIndex);
            let end = Math.max(oldEndDragClickIndex, newEndDragClickIndex);
            for (let i = start; i <= end; i++) {
                let item = fileDataStore.fileList[i];
                toggleRowSelection(item, true);
            }

            endDragClickIndex.value = newEndDragClickIndex;
        }
    }

    // 离开悬浮事件
    const tableLeaveRow = (row, column, cell, event) => {
        if (event.buttons === 1 && startDragClickIndex.value === -1) {
            startDragClickIndex.value = row.index;
        }
    }

    return {
        tableClickRow, tableDbClickRow,
        tableHoverRow, tableLeaveRow
    }
}