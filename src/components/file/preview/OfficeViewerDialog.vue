<template>
  <z-dialog
    v-model="visible"
    draggable
    top="5vh"
    width="90%"
    class="zfile-office-viewer-dialog"
    :title="name"
    :showFooter="false"
  >
    <office-viewer v-if="visible" :file-name="name" />
  </z-dialog>
</template>

<script setup>
import ZDialog from "~/components/common/dialog/ZDialog.vue";
import MarkdownViewerDialogAsyncLoading from "~/components/file/preview/MarkdownViewerDialogAsyncLoading.vue";

const OfficeViewer = defineAsyncComponent({
  loader: () => import("~/components/file/preview/OfficeViewer.vue"),
  loadingComponent: MarkdownViewerDialogAsyncLoading
})

import useOfficeViewerDialog from "~/composables/file/useOfficeViewerDialog";
const { visible, name } = useOfficeViewerDialog();
</script>

<style scoped lang="scss">
:deep(.el-dialog) {
  // 内容无边框
  @apply p-0 h-[80vh];

  .z-dialog-content {
    @apply h-[80vh];
  }

  // 标题有边框
  .el-dialog__header {
    @apply p-2;
  }

  // 全屏时，内容高度自适应
  &.is-fullscreen {
    height: 100%;
    .z-dialog-content {
      height: calc(100vh - 41px);
    }
  }

  // 隐藏底部按钮
  .el-dialog__footer {
    display: none;
  }
}
</style>