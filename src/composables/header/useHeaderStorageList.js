import { getSourceListReq } from "~/api/home/home";

import MessageBox from "~/components/messageBox/messageBox";

import useFileLoading from "~/composables/file/useFileLoading";
const { loading } = useFileLoading();

import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

import useRouterData from "~/composables/useRouterData";
let { routerRef, fullpath, storageKey } = useRouterData();

let storageList = ref([]);
let currentStorageKey = ref();

let initialized = false;

export default function useHeaderStorageList() {

    let rootShowStorage = storageConfigStore.globalConfig.rootShowStorage;


    // 加载存储源列表
    let loadStorageSourceList = () => {
        return new Promise((resolve) => {
            // 请求获取所有存储器列表
            getSourceListReq().then((response) => {
                storageList.value = response.data;

                // 如果没有存储源, 则直接提示是否添加
                if (storageList.value.length === 0) {
                    let isBasicUser = storageConfigStore.loginInfo.isLogin && !storageConfigStore.loginInfo.isAdmin;
                    let isAdmin = storageConfigStore.loginInfo.isLogin && storageConfigStore.loginInfo.isAdmin;
                    if (isBasicUser) {
						ElMessage.warning('您当前没有可用存储源，请联系管理员为当前用户添加存储源权限');
                    } else if (isAdmin) {
						MessageBox.confirm('当前无可用存储源，是否前往后台添加存储源？', '提示', {
							confirmButtonText: '确定',
							cancelButtonText: '取消',
							type: 'info'
						}).then(() => {
							routerRef.value.push('/login')
						});
                    }
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
                document.title = storageConfigStore.globalConfig.siteName + ' | 首页';
                loading.value = false;
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

            // 如果切换到了新存储源，且没有指定路径，则进行切换
            if ((newVal && !fullpath.value) || oldVal !== undefined) {
                storageConfigStore.folderConfig.readmeText = '';
                routerRef.value.push('/' + newVal);
                refreshCurrentStorageSource();
            }
        });

        watch(() => storageKey.value, (val) => {
            rootPathAction(true);
        })
        initialized = true;
    }

    // 跳转到第一个存储器
    const routerToFirstStorage = () => {
        // 否则读取存储源列表中的第一个, 并跳转到响应的 URL 中.
        if (storageList.value.length > 0) {
            let firstStorageKey = storageList.value[0].key;
            currentStorageKey.value = firstStorageKey;
            routerRef.value.push('/' + firstStorageKey);
        }
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

    return {
        loadStorageSourceList, storageList, findStorageByKey, currentStorageKey, storageListAsFileList
    }
}