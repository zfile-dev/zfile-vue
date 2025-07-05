<template>
  <div class="zfile-kkfile-viewer">
    <div v-if="isLoading" class="viewer-status">
      正在加载预览, 请稍候...
    </div>

    <div v-else-if="errorMessage" class="viewer-status error">
      加载预览失败：{{ errorMessage }}
    </div>

    <iframe v-else-if="iframeSrc"
            :src="iframeSrc"
            width="100%"
            height="100%"
            frameborder="0">
    </iframe>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import useStorageConfigStore from "~/stores/storage-config";
import { buildKkFileViewUrl } from "~/utils/models/path";

const storageConfigStore = useStorageConfigStore();

const props = defineProps({
  url: String,
  name: String
});

const isLoading = ref(true);
const errorMessage = ref('');
const iframeSrc = ref('');

watchEffect(() => {
  isLoading.value = true;
  errorMessage.value = '';
  iframeSrc.value = '';

  const kkFileViewUrl = storageConfigStore.globalConfig.kkFileViewUrl;
  const fileUrl = props.url;
  const originalFileName = props.name;

  if (!kkFileViewUrl) {
    errorMessage.value = "预览服务地址未配置。";
    isLoading.value = false;
    return;
  }

  if (!fileUrl) {
    errorMessage.value = "文件URL无效，无法预览。";
    isLoading.value = false;
    return;
  }

  if (!originalFileName) {
    errorMessage.value = "文件名无效，无法预览。";
    isLoading.value = false;
    return;
  }

  const file = { name: originalFileName, url: fileUrl };

  iframeSrc.value = buildKkFileViewUrl(file, kkFileViewUrl);
  isLoading.value = false;
});
</script>

<style scoped>
.zfile-kkfile-viewer {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7f7f7;
}
.viewer-status {
  color: #888;
  font-size: 16px;
}
.viewer-status.error {
  color: #f56c6c;
}
</style>