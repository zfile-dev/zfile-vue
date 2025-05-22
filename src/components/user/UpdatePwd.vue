<template>
  <z-dialog
    @confirm="submitForm"
    v-model="visible"
    draggable
    class="zfile-update-pwd-dialog"
    width="450px"
    title="修改密码"
  >
  <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
    <el-form-item label="原密码" prop="oldPassword">
      <el-input v-model="form.oldPassword" type="password" show-password></el-input>
	  <div class="el-form-item-tips">单点登录未主动设置过密码的用户，可不填写原密码。</div>
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="form.newPassword" type="password" show-password></el-input>
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="form.confirmPassword" type="password" show-password></el-input>
    </el-form-item>
  </el-form>
  </z-dialog>
</template>

<script setup>
import { ElForm, ElFormItem, ElInput } from 'element-plus'
import { updatePwdReq } from "~/api/home/user";
import ZDialog from "~/components/common/dialog/ZDialog.vue";
import useDialogFn from "~/components/common/dialog/useDialogWithForm";

const rules = ref({
  newPassword: [
    { required: true, message: '请输入新密码', trigger: ['change', 'blur'] }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: ['change', 'blur'] },
    { validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入新密码'))
        } else if (value !== form.value.newPassword) {
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
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      updatePwdReq(form.value).then(res => {
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
	@apply max-w-[90%];
  .el-dialog__body {
    @apply py-5;
  }
}
</style>