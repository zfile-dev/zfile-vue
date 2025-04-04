<template>
  <!-- 文档模式显示 -->
  <el-card v-if="storageConfigStore.globalConfig.showDocument
                && storageKey
                && storageConfigStore.folderConfig.readmeDisplayMode === displayMode
                && storageConfigStore.folderConfig.readmeText">
    <v-md-preview :text="storageConfigStore.folderConfig.readmeText"></v-md-preview>
  </el-card>
</template>

<script setup>
import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

let { storageKey } = useRouterData();

defineProps({
  displayMode: {
    required: true
  },
})
</script>

<style scoped>

</style>