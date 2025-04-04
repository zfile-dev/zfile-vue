<template>
  <z-dialog
    v-model="visible"
    draggable
    top="5vh"
    class="zfile-pdf-viewer-dialog"
    :title="name"
    :showFooter="false"
  >
    <pdf-viewer v-if="visible" :file-name="name" :file-url="url" />
  </z-dialog>
</template>

<script setup>
import ZDialog from "~/components/common/dialog/ZDialog.vue";
import MarkdownViewerDialogAsyncLoading from "~/components/file/preview/MarkdownViewerDialogAsyncLoading.vue";

const PdfViewer = defineAsyncComponent({
  loader: () => import("~/components/file/preview/PdfViewer.vue"),
  loadingComponent: MarkdownViewerDialogAsyncLoading
})

import usePdfViewerDialog from "~/composables/file/usePdfViewerDialog";
const { visible, name, url } = usePdfViewerDialog();
</script>

<style scoped lang="scss">
:deep(.zfile-pdf-viewer-dialog) {
  @apply min-w-[90%] sm:min-w-[80%] md:min-w-[70%] lg:min-w-[60%] xl:min-w-[50%];

  .el-dialog__body {
    @apply h-[80vh] overflow-auto;
  }

  &.is-fullscreen {
    .el-dialog__body {
      height: calc(100vh - 49px - 16px);
    }
  }
}
</style>