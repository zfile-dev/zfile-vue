import {loadConfigReq, updateLinkSettingReq} from "~/api/admin-setting";
import { useRequest } from 'vue-request'

export default function useLinkSetting() {

    // 加载请求
    const { data, loading: dataLoading, reload } = useRequest(loadConfigReq, {
        formatResult: res => {
            return res.data;
        }
    });

    // 保存请求
    const { loading: saveLoading, run } = useRequest(updateLinkSettingReq, {
        manual: true,
        onSuccess() {
            ElMessage({
                message: '保存成功',
                type: 'success'
            });
        },
    })

    const saveData = () => {
        if (!data.value.directLinkPrefix) {
            ElMessage.warning('直链前缀不能为空');
        } else {
            run(data.value);
        }
    }

    return {
        data, dataLoading, reload,
        saveData, saveLoading
    }
}