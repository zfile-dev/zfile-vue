import { removeDuplicateSlashes } from "fast-glob/out/managers/patterns";
import useHeaderStorageList from "./useHeaderStorageList";

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

import useRouterData from "~/composables/useRouterData";
let { fullpath, storageKey } = useRouterData();

import useCommon from "~/composables/useCommon";
const { encodeAllIgnoreSlashes } = useCommon();

// 面包屑数据
let breadcrumbData = ref([]);
let initialized = false;
export default function useBreadcrumb() {

    let rootShowStorage = storageConfigStore.globalConfig.rootShowStorage;

    // 构建面包屑
    let buildBreadcrumbData = () => {
        breadcrumbData.value = [
            {
                name: storageConfigStore.globalConfig.siteHomeName || '首页',
                href: rootPath.value,
                disable: false
            }
        ];

        // 如果为包含根目录模式，则面包屑显示驱动器
        if (rootShowStorage) {
            let { findStorageByKey } = useHeaderStorageList();
            let storageByKey = findStorageByKey(storageKey.value);
            if (storageByKey) {
                breadcrumbData.value.push({
                    name: storageByKey.name,
                    href: encodeAllIgnoreSlashes('/' + storageByKey.key)
                })
            }
        }

        if (fullpath.value) {
            fullpath.value.forEach((item, index, arr) => {
                let breadcrumbItem = {
                    name: item,
                    href: encodeAllIgnoreSlashes(removeDuplicateSlashes('/' + storageKey.value + '/' + arr.slice(0, index + 1).join('/'))),
                    disable: index === arr.length - 1
                }
                breadcrumbData.value.push(breadcrumbItem);
            })
        }
    };

    /**
     * 根目录路径
     */
    let rootPath = computed(() => '/' + (rootShowStorage ? '' : storageKey.value));

    if (!initialized) {
        // 当 URL 变化, 则自动重新 build 面包屑
        watch(() => fullpath.value, () => {
            buildBreadcrumbData();
        })

        // 当 URL 变化, 则自动重新 build 面包屑
        watch(() => storageKey.value, () => {
            buildBreadcrumbData();
        })
    }
    initialized = true;

    return {
        rootPath,
        breadcrumbData,
        buildBreadcrumbData
    }

}