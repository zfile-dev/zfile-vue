<template>
  <div class="zfile-async-loading p-10 h-[75vh] w-full">
    <div class="flex justify-between h-full">
      <div class="w-1/4">
        <el-skeleton animated count="6" />
      </div>
      <div class="w-20 h-full">
        <el-skeleton animated class="h-full">
          <template #template>
            <el-skeleton-item variant="rect" class="!h-full"></el-skeleton-item>
          </template>
        </el-skeleton>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
</style>