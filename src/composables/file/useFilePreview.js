import common from "~/common";
import {api as viewerApi} from "v-viewer" // 图片预览组件

// 基础依赖引入
import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();

import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

// 视频预览, 打开 dialog.
export let dialogVideoVisible = ref(false);
// 文本预览
export let dialogTextVisible = ref(false);
// office 或 pdf 预览
export let dialogOfficeVisible = ref(false);

export default function useFilePreview() {

    const openVideo = () => {
        dialogVideoVisible.value = true;
    }

    const openAudio = () => {
        fileDataStore.updateAudioList(fileDataStore.filterFileByType('audio'));
    }

    const openImage = (row) => {
        // 过滤当前页面中所有图片，并记录当前打开的文件的索引未知
        let imageDate = [];
        let currIndex = 0;

        let imagePreviewMode = globalConfigStore.zfileConfig.imagePreview.mode;
        if (imagePreviewMode === 'only') {
            imageDate.push({
                alt: row.name,
                src: row.url
            });
        } else {
            fileDataStore.filterFileByType('image').forEach((image, index) => {
                if (row.name === image.name) {
                    currIndex = index;
                }
                imageDate.push({
                    alt: image.name,
                    src: image.url
                });
            })
        }

        viewerApi({
            options: {
                initialViewIndex: currIndex
            },
            images: imageDate
        })
    }

    const openText = () => {
        dialogTextVisible.value = true;
    }

    const openOffice = (row) => {
        if (common.getFileSuffix(row.name) === 'pdf') {
            dialogOfficeVisible.value = true;
        } else {
            let previewUrl = globalConfigStore.zfileConfig.officePreview.previewUrl(row.url);
            window.open(previewUrl);
        }
    }

    return {
        openVideo, dialogVideoVisible,
        openText, dialogTextVisible,
        openOffice, dialogOfficeVisible,
        openImage,
        openAudio
    }

}