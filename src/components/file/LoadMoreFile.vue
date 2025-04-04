<template>
  <div v-if="isShow" class="text-center my-2">
    <el-tooltip placement="top">
      <template #content>
        <span>共 {{ allSize }} 个文件, 当前已加载 {{ fileDataStore.loadFileSize }} 条，点击将再加载 {{ storageConfigStore.globalConfig.loadMoreSize }} 条</span>
      </template>
      <el-button @click="loadMoreSize" type="primary">加载更多</el-button>
    </el-tooltip>
  </div>
</template>

<script setup>
import useFileDataStore from "~/stores/file-data";
import useStorageConfigStore from "~/stores/storage-config";

let fileDataStore = useFileDataStore();
let storageConfigStore = useStorageConfigStore();

const allSize = computed(() => {
  return fileDataStore.fileListSource[0]?.type === 'BACK' ? fileDataStore.fileListSource.length - 1 : fileDataStore.fileListSource.length;
});

const isShow = computed(() => { return allSize.value !== 0 && fileDataStore.loadFileSize < allSize.value; });


const loadMoreSize = () => {
  fileDataStore.updateLoadFileSize(fileDataStore.loadFileSize + storageConfigStore.globalConfig.loadMoreSize);
}

</script>

<style scoped>

</style>