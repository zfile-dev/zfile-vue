import {resetPasswordReq} from "~/api/header";

export default function useHeaderDebugMode() {
    // debug 模式重置管理员密码
    const resetAdminPwd = () => {
        ElMessageBox.confirm('是否确认重置后台管理员密码？重置后用户名/密码将强制修改为 admin 123456', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            callback: action => {
                if (action === 'confirm') {
                    resetPasswordReq().then((response) => {
                        if (response.code === 0) {
                            ElMessage.success("重置成功，请及时关闭 debug 功能，防止出现安全问题！");
                        }
                    });
                }
            }
        });
    }

    return {
        resetAdminPwd
    }

}