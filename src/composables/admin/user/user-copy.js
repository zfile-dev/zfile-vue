import { copyUserReq, checkUsernameDuplicateReq } from "~/api/admin/admin-user";

const formData = reactive({
  toUsername: '',
  toNickname: '',
  toPassword: '',
  fromId: null
});

const rules = {
  toUsername: [
    { required: true, message: '请输入新用户名' },
    { min: 1, max: 255, message: '长度应在 1 到 255 个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === undefined || value === null || value === '') {
          callback();
          return;
        }
        checkUsernameDuplicateReq({ username: value }).then((res) => {
          if (res.data) {
            callback(new Error('该用户名已存在，请修改。'));
          } else {
            callback();
          }
        })
      }
    }
  ],
  toNickname: [
    { required: true, message: '请输入新用户昵称', trigger: 'blur' },
  ],
}

const dialogVisible = ref(false);
const saveLoading = ref(false);
export default function useUserCopy() {

  const openDialog = (row) => {
    dialogVisible.value = true;
    formData.fromId = row.id;
    formData.toUsername = row.username;
    formData.toNickname = row.nickname;
  }

  const closeDialog = () => {
    dialogVisible.value = false;
  }

  const userCopyFormRef = ref(null);

  const submitForm = (emit) => {
    saveLoading.value = true;
    userCopyFormRef.value.validate((valid) => {
      if (valid) {
        copyUserReq(formData).then((res) => {
            ElMessage.success('复制成功');
            dialogVisible.value = false;
            emit('close');
        }).finally(() => {
          saveLoading.value = false;
        })
      } else {
        saveLoading.value = false;
      }
    });
  };

  return {
    dialogVisible,
    openDialog,
    closeDialog,
    formData,
    rules,
    userCopyFormRef,
    submitForm,
    saveLoading
  }
}
