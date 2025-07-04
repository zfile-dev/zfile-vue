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

const storageConfigStore = useStorageConfigStore();

const props = defineProps({
  url: String,
  name: String
});

const isLoading = ref(true);
const errorMessage = ref('');
const iframeSrc = ref('');

/**
 * 对字符串进行 Base64 编码, 同时兼容中文等 Unicode 字符.
 */
function base64Encode(str) {
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(str);
  const byteString = String.fromCharCode(...utf8Bytes);
  return btoa(byteString);
}

/**
 * 生成一个安全的、唯一的字符串ID.
 * 优先使用 crypto.randomUUID, 如果不可用则回退到一个简单的随机字符串.
 */
function generateSafeId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // 回退方案: 使用时间戳和随机数，足以保证在当前场景下的唯一性
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

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

  const lastDotIndex = originalFileName.lastIndexOf('.');
  const extension = (lastDotIndex !== -1) ? originalFileName.substring(lastDotIndex) : '';
  
  const safeBaseName = generateSafeId();
  
  const safeFileName = `${safeBaseName}${extension}`;
  
  const separator = fileUrl.includes('?') ? '&' : '?';
  const urlToEncode = `${fileUrl}${separator}fullfilename=${safeFileName}`;

  const base64Url = base64Encode(urlToEncode);
  const finalEncodedUrl = encodeURIComponent(base64Url);

  iframeSrc.value = `${kkFileViewUrl}/onlinePreview?url=${finalEncodedUrl}`;
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