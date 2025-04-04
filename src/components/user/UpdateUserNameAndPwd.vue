<template>
  <z-dialog
    @confirm="submitForm"
    v-model="visible"
    draggable
    class="zfile-update-pwd-dialog"
    width="450px"
    title="重置管理员密码"
  >
  <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" @keyup.native.enter="submitForm">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="新密码" prop="password">
      <el-input v-model="form.password" type="password" show-password />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="form.confirmPassword" type="password" show-password />
    </el-form-item>
  </el-form>
  </z-dialog>
</template>

<script setup>
import { ElForm, ElFormItem, ElInput } from 'element-plus'
import { resetAdminPwdReq } from "~/api/home/user";
import ZDialog from "~/components/common/dialog/ZDialog.vue";
import useDialogFn from "~/components/common/dialog/useDialogWithForm";

const rules = ref({
  username: [
    { required: true, message: '请输入新的管理员用户名', trigger: ['change', 'blur'] }
  ],
  password: [
    { required: true, message: '请输入新的管理员密码', trigger: ['change', 'blur'] }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: ['change', 'blur'] },
    { validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入新密码'))
        } else if (value !== form.value.password) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      }, trigger: ['change', 'blur'] }
  ]
})

const formRef = ref(null);
let { visible, closeDialog, openDialog } = useDialogFn(formRef);

const form = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      resetAdminPwdReq(form.value).then(res => {
        ElMessage.success('修改成功');
        closeDialog();
      });
    }
  })
}

defineExpose({
  closeDialog,
  openDialog,
});
</script>

<style scoped lang="scss">
:deep(.zfile-update-pwd-dialog) {
  .el-dialog__body {
    @apply py-5;
  }
}
</style>