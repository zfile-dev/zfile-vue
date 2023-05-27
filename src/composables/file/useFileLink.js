import common from "~/common";
import { batchGenerateShortLinkReq } from "~/api/home";

import { toClipboard } from '@soerenmartius/vue3-clipboard'
import { encodeData, rendererRect, rendererRound,
    rendererDSJ, rendererLine, rendererFuncB } from 'beautify-qrcode';

const generateLinkLoading = ref(false);
const generateLinkDialogVisible = ref(false);
const generateLinkFormData = reactive({
    expireTime: null,
});

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

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
    const openGenerateLinkDialog = () => {
        generateLinkDialogVisible.value = true;
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
     * svg 转为 src data uri
     * @param   svgText     svg 文本
     * @returns {string}    src data uri
     */
    const svgToDataUri = (svgText) => {
        let xmlElement = document.createElement("xml")
        xmlElement.innerHTML = svgText;

        // 增加 svg 底色, 防止复制后是透明.
        let rectElement = document.createElement("rect")
        rectElement.setAttribute('width', '100%');
        rectElement.setAttribute('height', '100%');
        rectElement.style.fill = '#ffffff';

        xmlElement.children[0].prepend(rectElement);

        return 'data:image/svg+xml;utf8,' + encodeURIComponent(xmlElement.innerHTML);
    }

    /**
     * 生成直链
     *
     * @param files          要生成的直链列表
     */
    const generateALlLink = (files) => {
        generateLinkResultLoading.value = true;

        let param = {
            storageKey: storageKey.value,
            paths: [],
            expireTime: generateLinkFormData.expireTime
        }

        files.forEach((row) => {
            let pathAndName = common.removeDuplicateSeparator("/" + row.path + "/" + row.name);
            param.paths.push(pathAndName);
        })

        batchGenerateShortLinkReq(param).then((res) => {
            let size = res.data.length;
            res.data.forEach((item, index) => {
                // 生成二维码
                const qrcode = encodeData({
                    text: storageConfigStore.permission.shortLink ? item.shortLink : item.pathLink,
                    correctLevel: 2,
                    isSpace: false
                });
                if (size === 1) {
                    item.row = {
                        name: files[index].name,
                        size: common.fileSizeFormat(files[index].size),
                        time: files[index].time
                    };
                    item.qrcode = {
                        a1: svgToDataUri(rendererRect(qrcode)),
                        a2: svgToDataUri(rendererRound(qrcode)),
                        sp1: svgToDataUri(rendererDSJ(qrcode)),
                        aa1: svgToDataUri(rendererLine(qrcode)),
                        ab2: svgToDataUri(rendererFuncB(qrcode)),
                    }
                    item.currentImg = item.qrcode.a1;
                } else {
                    item.name = files[index].name
                }
                dataList.value.push(item);
            })
        }).finally(() => {
            generateLinkResultLoading.value = false;
        })
    }

    return {
        generateLinkDialogVisible,
        openGenerateLinkDialog,
        closeGenerateLinkDialog,
        generateLinkFormData,
        generateLinkLoading,
        submitGenerateLinkForm,

        linkDialogVisible,
        generateLinkResultDialogVisible, generateLinkResultLoading, openGenerateLinkResultDialog, copyText, data, dataList, generateALlLink
    }

}
