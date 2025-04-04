<template>
  <div class="zfile-batch-operator-result-dialog-wrapper">
    <el-dialog
      custom-class="zfile-batch-operator-result-dialog"
      title="批量操作结果"
      v-model="visible"
      draggable
      top="10vh"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <el-table
        class="mt-5"
        :data="operatorResultListComputed"
        border
        stripe>
        <el-table-column
          prop="success"
          label="文件"
          show-overflow-tooltip>
          <template #header="{row}">
            <div class="flex justify-between items-center">
              <span>文件文件文件文件</span>
              <el-checkbox v-model="containAll">包含成功</el-checkbox>
            </div>
          </template>
          <template #default="{row}">
            <span class="mr-2">
              <CheckCircleIcon v-if="row.success" class="inline h-4 text-green-500 box animate__animated animate__fadeIn"/>
              <XCircleIcon   v-else class="inline h-4 text-red-400 box animate__animated animate__fadeIn"/>
            </span>
            <span>{{ concatPath(row.path, row.name) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="message"
          label="消息"
          show-overflow-tooltip>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { concatPath } from "~/utils";
import useBatchOperatorResult from "~/composables/file/useBatchOperatorResult";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/vue/24/solid";
const { visible, operatorResultList } = useBatchOperatorResult();

const containAll = ref(false);

const operatorResultListComputed = computed(() => {
  return containAll.value ? operatorResultList.value: operatorResultList.value.filter(item => !item.success);
});

</script>

<style scoped lang="scss">
.zfile-batch-operator-result-dialog-wrapper {
  :deep(.el-overlay-dialog) {
    @apply overflow-hidden;
  }

  :deep(.el-dialog) {
    @apply w-11/12 sm:w-3/4 md:w-1/2;
  }

  :deep(.el-dialog__body) {
    @apply h-[70vh] sm:h-[75vh] overflow-auto;
  }
}
</style>