import {loadConfigReq, updateViewSettingReq} from "~/api/admin-setting";
import { useRequest } from 'vue-request'
import common from "~/common";

export default function useViewSetting() {

    // 加载请求
    const { data, loading: dataLoading, reload } = useRequest(loadConfigReq, {
        formatResult: res => {
            let resData = res.data;
            if (!resData.customVideoSuffix) {
                resData.customVideoSuffix = common.constant.fileTypeMap.video.join(',');
            }
            if (!resData.customImageSuffix) {
                resData.customImageSuffix = common.constant.fileTypeMap.image.join(',');
            }
            if (!resData.customAudioSuffix) {
                resData.customAudioSuffix = common.constant.fileTypeMap.audio.join(',');
            }
            if (!resData.customTextSuffix) {
                resData.customTextSuffix = common.constant.fileTypeMap.text.join(',');
            }
            if (!resData.announcement) {
                resData.announcement = '';
            }
            return resData;
        }
    });

    // 保存请求
    const { loading: saveLoading, run } = useRequest(updateViewSettingReq, {
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