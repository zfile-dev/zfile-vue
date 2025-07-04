<template>
  <z-dialog
    v-model="visible"
    draggable
    top="5vh"
    width="90%"
    class="zfile-kkfile-viewer-dialog"
    :title="name"
    :showFooter="false"
  >
    <kkfileview-viewer v-if="visible" :url="url" :name="name" />
  </z-dialog>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import ZDialog from "~/components/common/dialog/ZDialog.vue";
import MarkdownViewerDialogAsyncLoading from "~/components/file/preview/MarkdownViewerDialogAsyncLoading.vue";
import useKkFileViewDialog from "~/composables/file/useKkFileViewDialog";

// 使用异步组件加载，提升性能
const KkfileviewViewer = defineAsyncComponent({
  loader: () => import("~/components/file/preview/KkFileViewer.vue"),
  loadingComponent: MarkdownViewerDialogAsyncLoading
});

const { visible, name, url } = useKkFileViewDialog();
</script>

<style scoped lang="scss">
/* 样式可以复用 OfficeViewerDialog 的 */
:deep(.el-dialog) {
  @apply p-0 h-[80vh];
  .z-dialog-content { @apply h-[80vh]; }
  .el-dialog__header { @apply p-2; }
  &.is-fullscreen {
    height: 100%;
    .z-dialog-content { height: calc(100vh - 41px); }
  }
  .el-dialog__footer { display: none; }
}
</style>