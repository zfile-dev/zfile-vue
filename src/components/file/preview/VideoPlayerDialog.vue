<template>
  <z-dialog
    v-model="visible"
    draggable
    top="5vh"
    width="90%"
    class="zfile-video-player-dialog"
    :title="name"
    :showFooter="false"
  >
    <video-player v-if="visible" />
  </z-dialog>
</template>

<script setup>
import ZDialog from "~/components/common/dialog/ZDialog.vue";
import VideoPlayerAsyncLoading from "~/components/file/preview/VideoPlayerAsyncLoading.vue";

const VideoPlayer = defineAsyncComponent({
  loader: () => import("~/components/file/preview/VideoPlayer.vue"),
  loadingComponent: VideoPlayerAsyncLoading
})

import useVideoPlayerDialog from "~/composables/file/useVideoPlayerDialog";
const { visible, name } = useVideoPlayerDialog();
</script>

<style scoped lang="scss">
:deep(.el-dialog) {
  // 视频无边框
  @apply p-0;

  // 标题有边框
  .el-dialog__header {
    @apply p-2;
  }

  // 全屏时，视频播放器高度 90vh
  &.is-fullscreen {
    .artplayer-app {
      @apply h-[50vh] md:h-[80vh];
    }
  }

  // 隐藏底部按钮
  .el-dialog__footer {
    display: none;
  }
}
</style>