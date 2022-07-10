import {
    loadConfigReq,
    generator2FAInfoReq,
    verify2FAInfoReq,
    updateSecuritySettingReq
} from "~/api/admin-setting";

import {ElMessageBox} from "element-plus";
import {useRequest} from "vue-request";
import { toClipboard } from '@soerenmartius/vue3-clipboard'


const twoFAData = ref({});
export default function useSecuritySetting() {

    // 加载数据
    const { data, reload } = useRequest(loadConfigReq, {
        formatResult: res => {
            return res.data;
        }
    });

    // 保存数据
    const { loading: saveLoading, run } = useRequest(updateSecuritySettingReq, {
        manual: true,
        onSuccess() {
            ElMessage({
                message: '保存成功',
                type: 'success'
            });
        },
    })

    // 封装保存数据的方法, 默认传入数据
    const saveData = () => {
        run(data.value);
    }


    // 加载 2fa 认证信息
    const load2FAInfo = () => {
        generator2FAInfoReq().then((res) => {
            twoFAData.value = res.data;
        })
    }

    // 验证并绑定双因素认证
    const verifyCodeAndBind = () => {
        verify2FAInfoReq(twoFAData.value).then((res) => {
            ElMessage.success('绑定成功');
            reload();
        })
    }

    // 绑定成功后，手动验证双因素认证码.
    const validBind = () => {
        ElMessageBox.prompt('请输入双因素认证 APP 中的验证码', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValidator(val) {
                return !!val
            },
            inputErrorMessage: '验证码不能为空.'
        }).then(({value}) => {
            let validData = {
                secret: data.value.loginVerifySecret,
                code: value
            }
            verify2FAInfoReq(validData).then(() => {
                ElMessage.success('验证成功');
            })
        });
    }

    // 复制 2fa 密钥
    const copyTwoFASecret = () => {
        toClipboard(twoFAData.value.secret).then(() => {
            ElMessage.success('复制成功');
        })
    }

    // 重新绑定
    const rebind = () => {
        data.value.loginVerifySecret = '';
        load2FAInfo();
    }

    // 取消绑定
    const cancelBind = () => {
        ElMessageBox.confirm('是否确认取消绑定，确认后将自动恢复为图形验证码', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'success',
            callback: action => {
                if (action === 'confirm') {
                    data.value.loginVerifySecret = '';
                    data.value.loginVerifyMode = 'image';
                }
            }
        });
    }

    return {
        data, reload, saveData, saveLoading,
        load2FAInfo, twoFAData, copyTwoFASecret, verifyCodeAndBind,
        rebind, cancelBind, validBind
    }
}