import { removeDuplicateSlashes } from "fast-glob/out/managers/patterns";
import useHeaderStorageList from "./useHeaderStorageList";

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

// 面包屑数据
let breadcrumbData = ref([]);
let initialized = false;
export default function useBreadcrumb(router, route) {

    let rootShowStorage = storageConfigStore.config.rootShowStorage;

    // url 中的存储源 key
    let storageKey = computed(() => route.params.storageKey);

    // 构建面包屑
    let buildBreadcrumbData = () => {
        breadcrumbData.value = [];

        // 如果为包含根目录模式，则面包屑显示驱动器
        if (rootShowStorage) {
            let { findStorageByKey } = useHeaderStorageList(router, route);
            let storageByKey = findStorageByKey(storageKey.value);
            if (storageByKey) {
                breadcrumbData.value.push({
                    name: storageByKey.name,
                    fullPath: '/' + storageByKey.key
                })
            }
        }

        if (route.params.fullpath) {
            route.params.fullpath.forEach((item, index, arr) => {
                let breadcrumbItem = {
                    name: item,
                    fullPath: removeDuplicateSlashes('/' + storageKey.value + '/' + arr.slice(0, index + 1).join('/'))
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
        watch(() => route.params.fullpath, () => {
            buildBreadcrumbData();
        })

        // 当 URL 变化, 则自动重新 build 面包屑
        watch(() => route.params.storageKey, (val) => {
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