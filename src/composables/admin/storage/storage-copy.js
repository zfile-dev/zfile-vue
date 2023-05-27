import { copyStorageReq, existStorageKeyReq } from "~/api/admin-storage";

const formData = reactive({
  toName: '',
  toKey: '',
  fromId: null
});

const rules = {
  toName: [
    { required: true, message: '请输入新存储源名称', trigger: 'blur' }
  ],
  toKey: [
    { required: true, message: '请输入新存储源别名', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === undefined || value === null || value === '') {
          callback('请输入存储源别名');
          return;
        }

        let systemNames = ['admin', 'file', 'login', 'install', 's', 'onedrive', 'api', 'sharepoint', 's3', 'webdav'];
        if (systemNames.includes(value)) {
          callback(new Error('不可占用系统级名称，请修改。'));
          return;
        }

        let reg = /^[\w\-]+$/;
        if (!reg.test(value)) {
          callback(new Error('只允许使用字母、数字、下划线、横杠'));
          return;
        }

        existStorageKeyReq({storageKey: value}).then((res) => {
          if (res.data) {
            callback(new Error('该存储源别名已存在，请修改。'));
          } else {
            callback();
          }
        })
      },
    }
  ],
}

const dialogVisible = ref(false);
const saveLoading = ref(false);
export default function useStorageCopy() {

  const openDialog = (row) => {
    dialogVisible.value = true;
    formData.fromId = row.id;
    formData.toKey = row.key;
    formData.toName = row.name;
  }

  const closeDialog = () => {
    dialogVisible.value = false;
  }

  const storageCopyFormRef = ref(null);

  const submitForm = (emit) => {
    saveLoading.value = true;
    storageCopyFormRef.value.validate((valid) => {
      if (valid) {
        copyStorageReq(formData).then((res) => {
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
    storageCopyFormRef,
    submitForm,
    saveLoading
  }
}
