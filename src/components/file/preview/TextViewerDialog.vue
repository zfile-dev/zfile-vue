<template>
  <z-dialog
    v-model="visible"
    draggable
    top="5vh"
    class="zfile-text-viewer-dialog"
    :title="name"
    width="90%"
    :showFooter="false"
  >
    <TextViewer :file-name="name"
                :file-url="url"
                v-if="visible && name.indexOf('.md') === -1"/>
    <MarkdownViewer :file-name="name"
                    :file-url="url"
                    v-if="visible && name.indexOf('.md') !== -1"/>
  </z-dialog>
</template>

<script setup>
import ZDialog from "~/components/common/dialog/ZDialog.vue";
import MarkdownViewerDialogAsyncLoading from "~/components/file/preview/MarkdownViewerDialogAsyncLoading.vue";

const TextViewer = defineAsyncComponent({
  loader: () => import("~/components/file/preview/TextViewer.vue"),
  loadingComponent: MarkdownViewerDialogAsyncLoading
})
const MarkdownViewer = defineAsyncComponent({
  loader: () => import("~/components/file/preview/MarkdownViewer.vue"),
  loadingComponent: MarkdownViewerDialogAsyncLoading
})

import useTextViewerDialog from "~/composables/file/useTextViewerDialog";
const { visible, name, url } = useTextViewerDialog();
</script>

<style scoped lang="scss">
:deep(.zfile-text-viewer-dialog) {
  overflow: hidden;
  height: 90%;

  .el-dialog__body {
    @apply overflow-hidden p-0 h-full;
  }

  &.is-fullscreen {
    .markdown-body {
      height: 90vh;
    }
    height: 100%;
  }
}
</style>