import common from "~/common";
import { v3ImgPreviewFn } from 'v3-img-preview'

// 基础依赖引入
import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();

import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

// 视频预览, 打开 dialog.
export let dialogVideoVisible = ref(false);
// 文本预览
export let dialogTextVisible = ref(false);
// office 预览
export let dialogOfficeVisible = ref(false);
// pdf 预览
export let dialogPdfVisible = ref(false);

export default function useFilePreview() {

    const openVideo = () => {
        dialogVideoVisible.value = true;
    }

    const openAudio = () => {
        fileDataStore.updateAudioList(fileDataStore.filterFileByType('audio'));
    }

    const openImage = (row) => {
        // 过滤当前页面中所有图片，并记录当前打开的文件的索引位置
        let images = [];
        let currIndex = 0;
        let imagePreviewMode = globalConfigStore.zfileConfig.imagePreview.mode;
        if (imagePreviewMode === 'only') {
            images.push(row.url);
        } else {
            fileDataStore.filterFileByType('image').forEach((image, index) => {
                if (row.name === image.name) {
                    currIndex = index;
                }
                images.push(image.url);
            })
        }

        v3ImgPreviewFn({
            images: images,
            index: currIndex
        })
    }

    const openText = () => {
        dialogTextVisible.value = true;
    }

    const openOffice = (row) => {
        let previewUrl = globalConfigStore.zfileConfig.officePreview.previewUrl(row.url);
        window.open(previewUrl);
    }

    const openPdf = () => {
        dialogPdfVisible.value = true;
    }

    return {
        openVideo, dialogVideoVisible,
        openText, dialogTextVisible,
        openOffice, dialogOfficeVisible,
        openImage,
        openAudio,
        openPdf, dialogPdfVisible
    }

}