import { v3ImgPreviewFn } from 'v3-img-preview-enhance'
import { buildKkFileViewUrl } from "~/utils/models/path";

// 基础依赖引入
import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();

// 基础依赖引入
import useStorageConfigStore from "~/stores/storage-config";
const storageConfigStore = useStorageConfigStore();

import useFileDataStore from "~/stores/file-data";
import useTextViewerDialog from "~/composables/file/useTextViewerDialog";
import usePdfViewerDialog from "~/composables/file/usePdfViewerDialog";
import useVideoPlayerDialog from "~/composables/file/useVideoPlayerDialog";
import useOfficeViewerDialog from "~/composables/file/useOfficeViewerDialog";
import useThree3dPreviewDialog from "~/composables/file/useThree3dPreviewDialog";
import useKkFileViewDialog from "~/composables/file/useKkFileViewDialog";

let fileDataStore = useFileDataStore();

const { openDialogWithData: openTextDialog } = useTextViewerDialog();
const { openDialogWithData: openPdfDialog } = usePdfViewerDialog();
const { openDialogWithData: openVideoDialog } = useVideoPlayerDialog();
const { openDialogWithData: openOfficeDialog } = useOfficeViewerDialog();
const { openDialogWithData: open3DDialog } = useThree3dPreviewDialog();
const { openDialogWithData: openKkFileViewDialog } = useKkFileViewDialog();

export default function useFilePreview() {

    const openVideo = () => {
        openVideoDialog(fileDataStore.currentClickRow.name);
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
        openTextDialog(fileDataStore.currentClickRow.name, fileDataStore.currentClickRow.url);
    }

    const openOffice = () => {
        openOfficeDialog(fileDataStore.currentClickRow.name);
    }

    const openPdf = () => {
        openPdfDialog(fileDataStore.currentClickRow.name, fileDataStore.currentClickRow.url);
    }

    const open3d = () => {
        open3DDialog(fileDataStore.currentClickRow.name, fileDataStore.currentClickRow.url);
    }

    const openKkFileView = (row) => {
        const kkFileViewUrl = storageConfigStore.globalConfig.kkFileViewUrl;
        const openMode = storageConfigStore.globalConfig.kkFileViewOpenMode;
        const finalUrl = buildKkFileViewUrl(row, kkFileViewUrl);
        if (openMode === 'newTab') {
            window.open(finalUrl, '_blank');
        } else {
            openKkFileViewDialog(row.name, row.url);
        }
    }

    return {
        openVideo,
        openText,
        openOffice,
        openImage,
        openAudio,
        openPdf,
        open3d,
        openKkFileView
    }

}
