import {loadConfigReq, updatePwdReq} from "~/api/admin-setting";

const passwordData = ref({
    username: '',
    password: '',
    repassword: ''
});

const passwordDataRules = ref({
    username: [
        {required: true, message: '请输入管理员账号'},
    ],
    password: [
        {required: true, message: '请输入密码'},
    ],
    repassword: [
        {
            required: true,
            validator: (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请再次输入密码'))
                } else if (value !== passwordData.value.password) {
                    callback(new Error('两次输入密码不一致!'))
                } else {
                    callback()
                }
            }
        }
    ]
});

const updateLoading = ref();

export default function usePassword() {

    const updatePassword = (updatePasswordFormRef) => {
        updatePasswordFormRef.value.validate(checked => {
            if (checked) {
                updateLoading.value = true;
                updatePwdReq(passwordData.value).then(() => {
                    ElMessage({
                        message: '保存成功',
                        type: 'success'
                    });
                    updateLoading.value = true;
                })
            }
        })
    }

    onMounted(() => {
        loadConfigReq().then((response) => {
            passwordData.value.username = response.data.username;
        });
    })

    return {
        passwordData, updateLoading, updatePassword, passwordDataRules
    }
}