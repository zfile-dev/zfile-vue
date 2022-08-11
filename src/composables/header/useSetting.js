const visible = ref(false);

import useCommon from "~/composables/useCommon";
const { isMobile } = useCommon();

// 获取默认值
import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();
let zfileConfig = globalConfigStore.zfileConfig;

let baseData = {
    view: {
        size: 2
    },
    gallery: {
        column: isMobile.value ? zfileConfig.gallery.mobileColumn : zfileConfig.gallery.column,
        columnSpacing: zfileConfig.gallery.columnSpacing,
        rowSpacing: zfileConfig.gallery.rowSpacing,
        showInfo: zfileConfig.gallery.showInfo,
        showInfoMode: zfileConfig.gallery.showInfoMode,
        roundedBorder: zfileConfig.gallery.roundedBorder,
        showBackTop: zfileConfig.gallery.showBackTop
    },
    imagePreview: {
        mode: zfileConfig.imagePreview.mode,
        gallery: zfileConfig.imagePreview.gallery
    }
};

const extend = (a, b) => {
    b = b || this;

    for(let key in a) {
        if (b[key] === undefined) {
            b[key] = a[key];
        } else if (a[key] instanceof Object && b[key] instanceof Object) {
            extend(a[key], b[key]);
        }
    }
}

const zfileSettingCache = useStorage('zfile-setting-cache', baseData);

export default function useSetting() {

    const openSettingVisible = () => {
        visible.value = true;
    }

    extend(baseData, zfileSettingCache.value)

    return {
        visible, zfileSettingCache, openSettingVisible
    }
}