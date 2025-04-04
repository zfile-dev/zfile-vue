import { getLinkLimitInfoReq } from "~/api/admin/admin-setting";

const linkLimitInfoList = ref([]);

export default function useLinkSetting() {

    const loadLinkLimitInfo = () => {
        getLinkLimitInfoReq().then(res => {
            linkLimitInfoList.value = res.data;
        });
    }

    return {
        linkLimitInfoList, loadLinkLimitInfo
    }
}
