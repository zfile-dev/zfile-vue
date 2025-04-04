<template>
  <z-dialog
    v-model="visible"
    draggable
    top="5vh"
    width="90%"
    class="zfile-three-3d-dialog"
    :title="name"
    :showFooter="false"
  >
    <Three3dPreview v-if="visible" :fileName="name" :fileUrl="url"/>
  </z-dialog>
</template>

<script setup>
import ZDialog from "~/components/common/dialog/ZDialog.vue";
import MarkdownViewerDialogAsyncLoading from "~/components/file/preview/MarkdownViewerDialogAsyncLoading.vue";

const Three3dPreview = defineAsyncComponent({
  loader: () => import("~/components/file/preview/Three3dPreview.vue"),
  loadingComponent: MarkdownViewerDialogAsyncLoading
})

import useThree3dPreviewDialog from "~/composables/file/useThree3dPreviewDialog";
const { visible, name, url } = useThree3dPreviewDialog();
</script>

<style scoped lang="scss">
:deep(.el-dialog) {
  // 内容无边框
  @apply p-0;

  // 标题有边框
  .el-dialog__header {
    @apply p-2;
  }

  // 全屏时，视频播放器高度 90vh
  &.is-fullscreen {
    .viewer-container {
      height: calc(100vh - 41px - 32px - 4px);
    }
  }

  // 隐藏底部按钮
  .el-dialog__footer {
    display: none;
  }
}
</style>