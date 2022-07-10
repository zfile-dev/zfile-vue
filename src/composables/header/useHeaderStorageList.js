import {getSourceListReq} from "~/api/header";
import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

let storageList = ref([]);
let currentStorageKey = ref();

let initialized = false;

export default function useHeaderStorageList(router, route) {

    let rootShowStorage = storageConfigStore.config.rootShowStorage;

    // url 中的存储源 key
    const storageKey = computed(() => route.params.storageKey);

    // 加载存储源列表
    let loadStorageSourceList = () => {
        return new Promise((resolve) => {
            // 请求获取所有存储器列表
            getSourceListReq().then((response) => {
                storageList.value = response.data;

                // 如果没有存储源, 则直接提示是否添加
                if (storageList.value.length === 0) {
                    ElMessageBox.confirm('当前无可用存储源，是否跳转至管理员页面添加存储源？', '提示', {
                        confirmButtonText: '确定', cancelButtonText: '取消', type: 'info', callback: action => {
                            if (action === 'confirm') {
                                router.push('/login');
                            }
                        }
                    });
                    return;
                }

                rootPathAction(rootShowStorage);
                resolve(response);
            });
        })
    }

    // 如果路由处理根目录的操作.
    const rootPathAction = (rootShowStorage) => {
        // 如果当前 URL 参数中有存储源 ID, 则直接用当前的.
        if (storageKey.value) {
            // 判断 url 中的 storageKey 是否存在于 storageList 中. 如果不存在, 则跳转到首页
            let storageByKey = findStorageByKey(storageKey.value);

            if (storageByKey) {
                currentStorageKey.value = storageKey.value;
            } else {
                // 否则读取存储源列表中的第一个, 并跳转到响应的 URL 中.
                routerToFirstStorage();
            }

        } else {
            if (rootShowStorage) {
                fileDataStore.updateFileList(storageListAsFileList.value);
            } else {
                routerToFirstStorage();
            }
        }
        refreshCurrentStorageSource();
    }

    // 将存储源类别转换到文件列表
    const storageListAsFileList = computed(() => {
        let fileList = [];
        storageList.value.forEach((item) => {
            fileList.push({
                name: item.name, path: item.key, size: 0, time: '-', type: 'ROOT'
            })
        })
        return fileList;
    })

    // 更新当前存储策略到 pinia 中
    const refreshCurrentStorageSource = () => {
        storageList.value.some((item) => {
            if (item.key === currentStorageKey.value) {
                fileDataStore.updateCurrentStorageSource(item);
            }
        });
    }

    if (!initialized) {
        // 当存储策略变化时, 切换路由中的值
        watch(() => currentStorageKey.value, (newVal, oldVal) => {
            // 更新上一个存储源
            fileDataStore.updateOldStorageKey(oldVal);

            // 如果切换到了新存储源，且没有指定路径，则进行切换
            if ((newVal && !route.params.fullpath) || oldVal !== undefined) {
                router.push('/' + newVal);
                refreshCurrentStorageSource();
            }
        });

        watch(() => route.params.storageKey, (val) => {
            rootPathAction(true);
        })
    }

    // 跳转到第一个存储器
    const routerToFirstStorage = () => {
        // 否则读取存储源列表中的第一个, 并跳转到响应的 URL 中.
        let firstStorageKey = storageList.value[0].key;
        currentStorageKey.value = firstStorageKey;
        router.push('/' + firstStorageKey);
    }

    /**
     * 根据存储源 key 查找对象
     */
    const findStorageByKey = (key) => {
        return storageList.value.find(item => {
            if (item.key == key) {
                return item;
            }
        });
    }

    initialized = true;

    return {
        loadStorageSourceList, storageList, findStorageByKey, storageKey, currentStorageKey
    }
}