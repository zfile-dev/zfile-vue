const selectRows = ref([]);
const selectFun = ref({
  clearSelection: null,
  toggleRowSelection: null,
  toggleAllSelection: null
})


export default function useFileSelect() {

  const initSelectFun = (clearSelection, toggleRowSelection, toggleAllSelection) => {
    selectFun.value.clearSelection = clearSelection;
    selectFun.value.toggleRowSelection = toggleRowSelection;
    selectFun.value.toggleAllSelection = toggleAllSelection;
  }

  const clearSelection = () => {
    selectFun.value.clearSelection();
  }

  const toggleRowSelection = (row, selected) => {
    if (row?.type === 'BACK') {
      return;
    }
    selectFun.value.toggleRowSelection(row, selected);
  }

  const toggleAllSelection = () => {
    selectFun.value.toggleAllSelection();
  }

  // 文件是否可被选择
  const checkSelectable = (row) => {
    return row.type === "FILE" || row.type === "FOLDER";
  };

  // 当前最后选中的文件行
  const selectRow = computed(() => {
    if (selectRows.value.length > 0) {
      return selectRows.value[selectRows.value.length - 1];
    } else {
      return null;
    }
  });

  // 当前选中的文件
  const selectFiles = computed(() => {
    return selectRows.value.filter((row) => {
      return row.type === "FILE";
    });
  });

  // 当前选中的文件夹
  const selectFolders = computed(() => {
    return selectRows.value.filter((row) => {
      return row.type === "FOLDER";
    });
  });

  // 更新选中的文件列表
  const selectRowsChange = (selection) => {
    selectRows.value = selection;
  };

  // 行选中 class
  const tableRowClassName = ({ row, rowIndex }) => {
    row.index = rowIndex;
    return selectRows.value.indexOf(row) !== -1 ? "select-row" : "";
  };

  // 多选统计信息
  const selectStatistics = computed(() => {
    let selectRowsLength = selectRows.value.length;
    let selectFilesLength = selectFiles.value.length;
    let selectFoldersLength = selectFolders.value.length;

    let isSingleSelect = selectRowsLength === 1;
    let isMultiSelect = selectRowsLength > 1;
    let isAllFile = selectFilesLength === selectRowsLength;
    let isAllFolder = selectFoldersLength === selectRowsLength;
    let isSingleSelectFile = isSingleSelect && selectFilesLength === 1;
    let isSingleSelectFolder = isSingleSelect && selectFoldersLength === 1;

    return {
      isSingleSelect,
      isMultiSelect,
      isAllFile,
      isAllFolder,
      isSingleSelectFile,
      isSingleSelectFolder
    };
  });

  return {
    initSelectFun,
    checkSelectable, tableRowClassName, selectRowsChange,
    selectRow, selectRows,
    selectFiles, selectFolders,
    selectStatistics,
    clearSelection, toggleRowSelection, toggleAllSelection
  };
}