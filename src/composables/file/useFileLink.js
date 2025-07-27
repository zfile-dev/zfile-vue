import { concatPath, fileSizeFormat, generateQRCode } from "~/utils";
import { batchGeneratePathLinkReq, batchGenerateShortLinkReq } from "~/api/home/home";

import { toClipboard } from '@soerenmartius/vue3-clipboard'
import { rendererRect, rendererRound,
    rendererDSJ, rendererLine, rendererFuncB } from 'beautify-qrcode';

const generateLinkLoading = ref(false);
const generateLinkDialogVisible = ref(false);
const generateLinkFormData = reactive({
    expireTime: null,
});
const currentLinkDialogType = ref(''); // 当前链接弹窗类型, 可以为 shortLink 或 pathLink

import useRouterData from "~/composables/useRouterData";
let { storageKey } = useRouterData()

const dataList = ref([]);
let data = computed(() => {
    return dataList.value.length > 0 ? dataList.value[0] : null;
});
let generateLinkResultDialogVisible = ref(false);
let generateLinkResultLoading = ref(false);

const linkDialogVisible = computed(() => {
    return generateLinkDialogVisible.value && generateLinkResultDialogVisible.value;
});

export default function useFileLink() {

    /*
     * 打开生成链接弹窗
     */
    const openGenerateLinkDialog = (type) => {
        currentLinkDialogType.value = type;
        if (type === 'pathLink') {
            openGenerateLinkResultDialog();
        } else {
            generateLinkDialogVisible.value = true;
        }
    };

    /**
     * 关闭生成链接弹窗
     */
    const closeGenerateLinkDialog = () => {
        generateLinkDialogVisible.value = false;
    };

    /**
     * 提交生成链接表单
     */
    const submitGenerateLinkForm = () => {
        closeGenerateLinkDialog();
        openGenerateLinkResultDialog();
    };



    /**
     * 打开直链生成结果弹窗
     */
    const openGenerateLinkResultDialog = () => {
        generateLinkResultDialogVisible.value = true;
    }

    /**
     *  复制直链
     */
    let copyText = (text) => {
        toClipboard(text).then(() => {
            ElMessage.success('复制成功');
        });
    }

    /**
     * 生成直链
     *
     * @param files          要生成的直链列表
     */
    const generateALlLink = async (files) => {
        generateLinkResultLoading.value = true;

        let pathLinkList = [], shortLinkList = [];
        if (currentLinkDialogType.value === 'pathLink' || currentLinkDialogType.value === 'all') {
            pathLinkList = await batchGetFilePathLink(files);
        }

        if (currentLinkDialogType.value === 'shortLink' || currentLinkDialogType.value === 'all') {
            shortLinkList = await batchGetShortLink(files)
        }

        files.forEach((file, index) => {
            let item = {
                name: file.name,
                size: fileSizeFormat(file.size),
                time: file.time,
                pathLink: pathLinkList[index],
                shortLink: shortLinkList[index]
            }

            if (files.length === 1) {
                // 生成二维码
                const qrcodeOptions = {
                    text: currentLinkDialogType.value === 'pathLink' ? pathLinkList[index] : shortLinkList[index],
                    correctLevel: 2,
                    isSpace: false
                }
                item.qrcode = {
                    a1: generateQRCode(qrcodeOptions, rendererRect),
                    a2: generateQRCode(qrcodeOptions, rendererRound),
                    sp1: generateQRCode(qrcodeOptions, rendererDSJ),
                    aa1: generateQRCode(qrcodeOptions, rendererLine),
                    ab2: generateQRCode(qrcodeOptions, rendererFuncB)
                }
                item.currentImg = item.qrcode.a1;
            }
            dataList.value.push(item);
        })
        generateLinkResultLoading.value = false;
    }

    const batchGetFilePathLink = async (files) => {
        let pathLinkList = [];
        let param = {
            storageKey: storageKey.value,
            paths: [],
            expireTime: 0
        }
        files.forEach((file) => {
            let pathAndName = concatPath(file.path, file.name);
            param.paths.push(pathAndName);
        })
        let res = await batchGeneratePathLinkReq(param);
        res.data.forEach((item) => {
            pathLinkList.push(item.address);
        })
        return pathLinkList;
    }

    const batchGetShortLink = async (files) => {
        let shortLinkList = [];
        let param = {
            storageKey: storageKey.value,
            paths: [],
            expireTime: generateLinkFormData.expireTime
        }
        files.forEach((file) => {
            let pathAndName = concatPath(file.path, file.name);
            param.paths.push(pathAndName);
        })
        let res = await batchGenerateShortLinkReq(param);
        res.data.forEach((item) => {
            shortLinkList.push(item.address);
        })
        return shortLinkList;
    }

    return {
        currentLinkDialogType,
        generateLinkDialogVisible,
        openGenerateLinkDialog,
        closeGenerateLinkDialog,
        generateLinkFormData,
        generateLinkLoading,
        submitGenerateLinkForm,

        linkDialogVisible,
        generateLinkResultDialogVisible, generateLinkResultLoading, openGenerateLinkResultDialog, copyText, data, dataList, generateALlLink,
        batchGetFilePathLink

    }

}