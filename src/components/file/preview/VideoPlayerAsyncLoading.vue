<template>
  <div class="zfile-async-loading">
    <el-skeleton class="w-full h-[40vh] sm:h-[80vh]" animated>
      <template #template>
        <div class="flex justify-center items-center h-full loading">
          <i-custom-file-type-video class="w-16 h-16" />
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup>
onMounted(() => {
  document.querySelector(".el-dialog .z-dialog-title").innerHTML = '加载中...';
})
</script>

<style lang="scss" scoped>

.zfile-async-loading {
  :deep(.el-skeleton__item) {
    height: 100%;
  }

  .loading {
    background: linear-gradient(
        100deg,
        rgba(255, 255, 255, 0) 40%,
        rgba(255, 255, 255, .5) 50%,
        rgba(255, 255, 255, 0) 60%
    ) #ededed;
    background-size: 200% 100%;
    background-position-x: 180%;
    animation: 1s loading ease-in-out infinite;
  }

  @keyframes loading {
    to {
      background-position-x: -20%;
    }
  }
}
</style>
