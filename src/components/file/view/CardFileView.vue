<template>
  <div ref="fileRef" class="zfile-card-file-view-wrapper box animate__animated animate__fadeIn"
	   v-if="!fileDataStore.imgMode"
       v-loading="basicLoading"
       element-loading-text="拼命加载中"
       element-loading-background="rgba(255, 255, 255, 0.6)"
       :class="'zfile-card-size-' + storageConfigStore.globalConfig?.tableSize">
    <div v-for="item in fileDataStore.fileList" :key="item.index"
         @contextmenu="showCardFileMenu(item, $event)"
         @click="clickRow(item)"
         @dblclick="dblclickRow(item)"
         :class="{'select-row': selectRows.includes(item)}"
         class="zfile-card-file-item">
      <div class="mb-3">
        <div class="zfile-card-file-icon">
          <svg-icon :name="'file-type-' + item.icon"></svg-icon>
        </div>
      </div>
      <span class="zfile-card-file-name">
					{{ item.name }}
      </span>
    </div>
  </div>
</template>

<script setup>
// 业务代码
import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

import useFileLoading from "~/composables/file/useFileLoading";
const { basicLoading } = useFileLoading();

// 表格选择
import useFileSelect from "~/composables/file/useFileSelect";
let { initSelectFun, selectRowsChange } = useFileSelect();

// 文件操作
import useTableOperator from "~/composables/file/useTableOperator";
const { tableClickRow, tableDbClickRow } = useTableOperator();

import useFileContextMenu from "~/composables/file/useFileContextMenu";
const { showFileMenu } = useFileContextMenu();

const selectRows = ref([]);

const showCardFileMenu = (item, e) => {
  toggleRowSelection(item, true);
  showFileMenu(item, null, e);
};

const clickRow = (item) => {
  tableClickRow(item, {});
};

const dblclickRow = (item) => {
  tableDbClickRow(item);
};

const clearSelection = () => {
  selectRows.value = [];
  selectRowsChange(selectRows.value);
};

const toggleRowSelection = (row, selected) => {
  if (selected === undefined) {
    selected = !selectRows.value.includes(row);
  }

  if (selected) {
    selectRows.value.push(row);
  } else {
    selectRows.value = selectRows.value.filter((item) => item !== row);
  }
  selectRowsChange(selectRows.value);
};

// 可选择的文件列表
const computedFileList = computed(() => {
  // 第一个的 type 可能是 BACK，表示返回上一级，不可选
  return fileDataStore.fileList.filter((item) => item.type !== 'BACK');
});

const toggleAllSelection = () => {
  if (selectRows.value.length === computedFileList.value.length) {
    selectRows.value = [];
  } else {
    selectRows.value = computedFileList.value;
  }
  selectRowsChange(selectRows.value);
};

onMounted(() => {
  initSelectFun(
    clearSelection,
    toggleRowSelection,
    toggleAllSelection
  );
});
</script>

<style scoped lang="scss">
.zfile-card-file-view-wrapper {
  @apply grid grid-cols-2 md:grid-cols-4 lg:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-1 mt-4 select-none bg-white;
}

.zfile-card-file-item {
  @apply relative flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow
     hover:bg-gray-50 cursor-pointer;
  ;

  .zfile-card-file-icon {
    @apply w-12 h-12 rounded-lg flex items-center justify-center;
  }

  .zfile-card-file-name {
    @apply text-sm text-center text-gray-600 line-clamp-1 break-all;
  }
}

// small 模式
.zfile-card-size-small {
  @apply gap-2;
  .zfile-card-file-icon {
    @apply w-8 h-8;
  }

  .zfile-card-file-name {
    @apply text-xs;
  }
}

// large 模式
.zfile-card-size-large {
  .zfile-card-file-icon {
    @apply w-16 h-16;
  }

  .zfile-card-file-name {
    @apply text-base;
  }
}

// 文件行选中效果
.select-row {
  @apply bg-gray-100;
}
</style>