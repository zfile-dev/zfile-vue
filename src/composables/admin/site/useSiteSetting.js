import {loadConfigReq, updateSiteSettingReq} from "~/api/admin-setting";
import { useRequest } from 'vue-request'

export default function useSiteSetting() {

    // 加载请求
    const { data, loading: dataLoading, reload } = useRequest(loadConfigReq, {
        formatResult: res => {
            return res.data;
        }
    });

    // 保存请求
    const { loading: saveLoading, run } = useRequest(updateSiteSettingReq, {
        manual: true,
        onSuccess() {
            ElMessage({
                message: '保存成功',
                type: 'success'
            });
        },
    })

    const saveData = () => {
        run(data.value);
    }

    return {
        data, dataLoading, reload,
        saveData, saveLoading
    }
}