import common from "~/common";
import {shortLinkReq} from "~/api/home";
import { encodeData, rendererRect, rendererRound, rendererDSJ, rendererLine, rendererFuncB } from 'beautify-qrcode';
import useCommon from "../useCommon";
const {encodeAllIgnoreSlashes} = useCommon();
import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

import { toClipboard } from '@soerenmartius/vue3-clipboard'


let data = computed(() => {
    return datas.value.length > 0 ? datas.value[0] : null;
});

const datas = ref([]);
let visible = ref(false);

export default function useFileLink(router, route) {

    const openLinkDialog = () => {
        visible.value = true;
    }

    const storageKey = computed(() => {
        return route.params.storageKey;
    });

    /**
     *  复制直链
     */
    let copyText = (text) => {
        toClipboard(text).then(() => {
            ElMessage.success('复制成功');
        });
    }

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

    const loadRowLinkData = (row) => {
        let pathDownloadLink = common.removeDuplicateSeparator("/" + row.path
            + "/" + row.name);
        shortLinkReq({storageKey: storageKey.value, path: pathDownloadLink}).then((response) => {
            let item = {
                row: null,
                currentImg: '',
                img: {
                    a1: '',
                    a2: '',
                    sp2: '',
                    b1: '',
                    c1: '',
                    sp3: '',
                    aa1: '',
                    aa2: '',
                    ab1: '',
                    ab2: ''
                },
                link: ''
            };
            item.row = JSON.parse(JSON.stringify(row));
            item.row.size = common.fileSizeFormat(row.size);
            item.link = response.data;
            let pathAndName = encodeAllIgnoreSlashes(row.path + "/" + row.name);
            pathDownloadLink = common.removeDuplicateSeparator(storageConfigStore.config.domain + "/" +
              storageConfigStore.config.directLinkPrefix + "/" +
              storageKey.value + "/" +
              pathAndName);
            item.directlink = pathDownloadLink;

            const qrcode = encodeData({
                text: response.data,
                correctLevel: 2,
                isSpace: false
            });

            item.img.a1 = svgToDataUri(rendererRect(qrcode));
            item.img.a2 = svgToDataUri(rendererRound(qrcode));
            item.img.sp1 = svgToDataUri(rendererDSJ(qrcode));
            item.img.aa1 = svgToDataUri(rendererLine(qrcode));
            item.img.ab2 = svgToDataUri(rendererFuncB(qrcode));
            item.currentImg = item.img.a1;
            datas.value.push(item);
        });
    }

    return {
        visible, openLinkDialog, copyText, data, datas, loadRowLinkData
    }

}