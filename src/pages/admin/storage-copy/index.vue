<template>
  <el-dialog title="复制存储配置" v-model="dialogVisible" width="20%">
    <el-form @submit.navite.prevent :model="formData" :rules="rules" ref="storageCopyFormRef">
      <el-form-item label="新存储源名称" prop="toName">
        <el-input v-model="formData.toName" placeholder="请输入新存储源名称"></el-input>
      </el-form-item>

      <el-form-item label="新存储源别名" prop="toKey">
        <el-input v-model="formData.toKey" placeholder="请输入新存储源别名"></el-input>
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

</script>

<style scoped>

</style>
