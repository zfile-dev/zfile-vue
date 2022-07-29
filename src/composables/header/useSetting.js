const visible = ref(false);

import useCommon from "~/composables/useCommon";
const { isMobile } = useCommon();

let baseData = {
    view: {
        size: 2
    },
    gallery: {
        column: isMobile.value ? 1 : 3,
        mobileColumn: 1,
        columnSpacing: 50,
        rowSpacing: 10,
        showInfo: true,
        showInfoMode: 'hover',
        roundedBorder: true,
        showBackTop: true
    },
    imagePreview: {
        mode: "full",
        gallery: true
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