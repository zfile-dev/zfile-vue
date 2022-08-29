<template>
  <div class="copy-content">
    <!-- 复制按钮 -->
    <div
      class="copy-btn code-data-copy"
      @click="copyMessage">
      <svg-icon name="copy2"/>
    </div>
  </div>
</template>

<script setup>
import { toClipboard } from '@soerenmartius/vue3-clipboard'

const props = defineProps({
  code: String
});

const copyMessage = () => {
  toClipboard(props.code).then(() => {
    ElMessage.success('复制成功');
  }).catch(() => {
    ElMessage.success('复制失败');
  })
}
</script>

<style lang="scss" scoped>
.copy-content {
  height: 0;
}
.copy-btn {
  user-select: none;
  opacity: 0;
  position: absolute;
  right: 5px;
  top: 5px;
  cursor: pointer;
  padding: 5px;
  border-radius: 3px;
  transition: 0.3s;
  background: rgba(255, 255, 255, 0.2);
  &:active {
    background: rgba(253, 253, 253, 0.575);
  }
}
</style>