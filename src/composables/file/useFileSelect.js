const selectRows = ref([]);
let vueInstance = null;
let tableRef = computed(() => {
    return vueInstance.proxy.$refs.fileTableRef;
});

export default function useFileSelect(currentInstance) {

  if (currentInstance) {
    vueInstance = currentInstance;
  }

  const clearSelection = () => {
    tableRef.value.clearSelection();
  }

  const toggleRowSelection = (row, selected) => {
    if (row?.type === 'BACK') {
      return;
    }
    tableRef.value.toggleRowSelection(row, selected);
  }

  const toggleAllSelection = () => {
    tableRef.value.toggleAllSelection();
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

    return {
      isSingleSelect,
      isMultiSelect,
      isAllFile,
      isAllFolder
    };
  });

  return {
    checkSelectable, tableRowClassName, selectRowsChange,
    selectRow, selectRows,
    selectFiles, selectFolders,
    selectStatistics,
    tableRef, clearSelection, toggleRowSelection, toggleAllSelection
  };
}