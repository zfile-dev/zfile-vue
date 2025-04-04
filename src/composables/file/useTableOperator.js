import { useKeyModifier } from '@vueuse/core'

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

// 按键监听
const mateState = useKeyModifier('Meta');
const controlState = useKeyModifier('Control');
const shiftState = useKeyModifier('Shift');

// 是否按住了 Ctrl(Windows) 或者 Command(Mac) 键
let isMultiSelectState = computed(() => {
    return mateState.value || controlState.value;
});

import useFileOperator from "~/composables/file/useFileOperator";
let { batchDelete } = useFileOperator();

import useFileData from "~/composables/file/useFileData";
const { openRow } = useFileData();

import useFileLoading from "~/composables/file/useFileLoading";
const { skeletonLoading } = useFileLoading();

import useFileSelect from "~/composables/file/useFileSelect";
const { selectRows, selectRow, clearSelection, toggleRowSelection, toggleAllSelection } = useFileSelect();

// ctrl + a 全选
window.addEventListener("keydown", function(e) {
    if (e.key === 'Escape' && allowShortcuts()) {
        clearSelection();
    } else if (e.key === 'a' && (e.metaKey || e.ctrlKey) && allowShortcuts()) {
        e.preventDefault();
        toggleAllSelection();
    } else if (e.key === 'Delete' && allowShortcuts()) {  // 如果按了删除键，且当前状态允许快捷键操作
        if (batchDelete && selectRows?.value?.length > 0) {
            e.preventDefault();
            batchDelete();
        }
    }  else if (e.key === 'Backspace' && allowShortcuts()) {  // 如果按了删除键，且当前状态允许快捷键操作
        if (fileDataStore.fileList.length > 0 && fileDataStore.fileList[0].type === 'BACK') {
            tableClickRow(fileDataStore.fileList[0]);
        }
    }
}, false);

export const allowShortcuts = () => {
    // 仅鼠标悬浮在 table 上时且没有打开 dialog 时，才允许快捷键操作.
    return hoverBody() && hasDialog() === false;
}

// 是否悬浮在首页上
export const hoverBody = () => {
    // 仅鼠标悬浮在 table 上时且没有打开 dialog 时，才允许快捷键操作.
    return document.querySelector(".zfile-index-body:hover")
}

// 当前是否打开了 dialog
export const hasDialog = () => {
    return !!document.querySelector(".el-popup-parent--hidden")
}

// 当前是否聚焦在密码输入框
export const hasPasswordInputFocus = () => {
    return document.querySelector(".is-message-box .el-input__inner") === document.activeElement;
}


// 当前是否聚焦在搜索输入框
export const hasSearchInputFocus = () => {
    return document.querySelector(".zfile-search-input .el-input__inner") === document.activeElement;
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


let tableClickRow;

export default function useTableOperator() {

    // 文件单击事件
    tableClickRow = (row, event) => {
        if (event === undefined) {
            openRow(row);
            return;
        }

        let isClickSelection = event.type === 'selection';

        // 如果点击的是文件或文件夹, 且点击的不是 checkbox 列, 且操作习惯是单击打开, 则打开文件/文件夹
        if (!isClickSelection && storageConfigStore.globalConfig.fileClickMode === 'click') {
            openRow(row);
            return;
        }

        // 加载骨架屏时，点击无效.
        if (skeletonLoading.value) {
            return;
        }

        let isClickSelf = selectRows.value.length === 1 && selectRow.value?.name === row.name;

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
