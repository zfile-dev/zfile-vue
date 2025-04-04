<template>
  <el-dialog append-to-body title="复制存储配置" v-model="dialogVisible">
    <el-form @submit.navite.prevent :model="formData" :rules="rules"
             :label-width="globalConfigStore.adminForm.labelWidth"
             :label-position="globalConfigStore.adminForm.labelPosition"
             :size="globalConfigStore.adminForm.size"
             status-icon
             class="z-admin-form"
             ref="storageCopyFormRef">
      <el-form-item label="新存储源名称" prop="toName">
        <el-input v-model="formData.toName" placeholder="请输入新存储源名称" />
      </el-form-item>

      <el-form-item label="新存储源别名" prop="toKey">
        <el-input v-model="formData.toKey" placeholder="请输入新存储源别名" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitForm(emit)" :loading="saveLoading">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import useStorageCopy from '~/composables/admin/storage/storage-copy'
const { dialogVisible, saveLoading, formData, rules, storageCopyFormRef, submitForm } = useStorageCopy();

const emit = defineEmits();

import useGlobalConfigStore from "~/stores/global-config";
const globalConfigStore = useGlobalConfigStore();
</script>

<style scoped>
.el-dialog {
  @apply w-[80%] sm:w-[60%] md:w-[40%] lg:w-[30%] xl:w-[20%];
}
</style>