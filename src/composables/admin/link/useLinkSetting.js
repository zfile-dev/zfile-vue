import {loadConfigReq, updateLinkSettingReq} from "~/api/admin-setting";
import { useRequest } from 'vue-request'

import { generateSeconds } from "~/tool/unit";

export default function useLinkSetting() {

    // 加载请求
    const { data, loading: dataLoading, reload } = useRequest(loadConfigReq, {
        formatResult: res => {
            let d = res.data;
            // 转为 json 数组
            d.linkExpireTimes = JSON.parse(d.linkExpireTimes);
            return d;
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
        // 过滤 data.value.linkExpireTimes 数组中所有 value 为空的，并计算 seconds 字段
        data.value.linkExpireTimes = data.value.linkExpireTimes.filter(item => {
            if (item.value && item.unit) {
                item.seconds = generateSeconds(item);
                return true;
            }
        });
        // 转为 json 字符串
        data.value.linkExpireTimes = JSON.stringify(data.value.linkExpireTimes);
        if (!data.value.directLinkPrefix) {
            ElMessage.warning('直链前缀不能为空');
        } else {
            run(data.value).then(() => {
							reload();
						});
        }
    }

    return {
        data, dataLoading, reload,
        saveData, saveLoading
    }
}
