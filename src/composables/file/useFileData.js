import minimatch from 'minimatch';
const zfilePasswordCache = useStorage('zfile-pwd-cache', {});

import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

const title = useTitle(storageConfigStore.config.siteName);

import useGlobalConfigStore from "~/stores/global-config";
import {loadFileListReq, loadStorageConfigReq} from "~/api/home";
import path from "path-browserify";
import common from "~/common";
import {ElMessage, ElMessageBox} from "element-plus";
import {removeDuplicateSlashes} from "fast-glob/out/managers/patterns";
let globalConfigStore = useGlobalConfigStore();

// table ref 相关操作
import useFileRef from "~/composables/file/useFileRef";
const { clearSelection } = useFileRef();

// 引入文件预览组件
import useFilePreview from '~/composables/file/useFilePreview';
const { openAudio, openImage, openOffice, openText, openVideo } = useFilePreview();

// 文件操作相关
import useFileOperator from '~/composables/file/useFileOperator';
// ------------- select start ------------

// 所有选中的文件行列表
const selectRows = ref([]);

// ------------- select end   ------------




// ------------- loading start ------------

const loading = ref(false);
// 是否是已经调用了首次 loading
const firstLoading = ref(false);
let skeletonData = reactive([]);

// ------------- loading end   ------------


// 文件列表查询条件
let searchParam = reactive({
    path: '',
    password: '',
    orderBy: '',
    orderDirection: ''
});


const storageConfig = ref({});

const initStorageConfig = ref(false);

export default function useFileData(router, route) {

    const checkSelectable = (row) => {
        return row.type === 'FILE' || row.type === 'FOLDER';
    }

    // 排序并重新加载数据
    const sortChangeMethod = ({prop, order}) => {
        searchParam.orderBy = prop;
        searchParam.orderDirection = order === "descending" ? "desc" : "asc";
        loadFile();
    };

    // 当前目录
    const currentPath = computed(() => {
        if (route.params.fullpath) {
            return '/' + route.params.fullpath.join('/');
        } else {
            return '/';
        }
    });

    // 当前驱动器 key
    const storageKey = computed(() => {
        return route.params.storageKey;
    });

    // 加载数据
    const loadFile = (initParam) => {
        // 未指定 storageKey 时, 不执行任何操作.
        if (!storageKey.value) {
            return;
        }
        loading.value = true;

        searchParam.path = currentPath.value;

        let param = initParam || {};
        param.storageKey = storageKey.value;
        param.path = currentPath.value;
        param.password = param.password || getPathPwd();
        param.orderBy = searchParam.orderBy;
        param.orderDirection = searchParam.orderDirection;

        let requestStorageId = storageKey.value;
        loadFileListReq(param).then((response) => {

            let passwordPattern = response.data.passwordPattern;

            putPathPwd(passwordPattern, param.password);

            // 如果请求的 storageKey 和当前的 storageKey 不一致
            // 则表示再加载数据期间，修改了 storageKey, 为了防止数据错乱, 取消本次渲染.
            if (requestStorageId !== storageKey.value) {
                return;
            }

            // 如果切换了存储器 ID, 则
            if (storageKey.value !== fileDataStore.oldStorageKey) {
                fileDataStore.updateOldStorageKey(storageKey.value);
            }

            let fileList = response.data.files;

            // 如果不是根路径, 则构建 back 上级路径的数据.
            let searchPath = searchParam.path;
            if (searchPath !== '' && searchPath !== '/') {
                let parentPathName = path.basename(path.resolve(currentPath.value, "../"));
                fileList.unshift({
                    name: parentPathName ? parentPathName : '/',
                    path: path.resolve(searchPath, '../'),
                    type: 'BACK'
                });
            }

            fileDataStore.updateFileList(fileList);
            loading.value = false;
            firstLoading.value = true;
            selectRows.value = [];

            // 修改标题
            if (route.params.fullpath) {
                title.value = storageConfigStore.config.siteName + ' | ' + route.params.fullpath[route.params.fullpath.length - 1];
            } else {
                title.value = storageConfigStore.config.siteName + ' | 首页';
            }
        }).catch((error) => {
            let data = error.response.data;
            // 如果需要密码或密码错误进行提示, 并弹出输入密码的框.
            if (data.code === common.responseCode.INVALID_PASSWORD) {
                ElMessage.warning('密码错误，请重新输入！');
                popPassword();
            } else if (data.code === common.responseCode.REQUIRED_PASSWORD) {
                ElMessage.warning('此文件夹需要密码，请输入密码！');
                popPassword();
            } else {
                ElMessage.error(data.msg);
            }
        });
    }

    // 加载存储器设置
    const loadFileConfig = () => {
        let param = {
            storageKey: route.params.storageKey,
            path: currentPath.value
        }
        loadStorageConfigReq(param).then((res) => {
            storageConfig.value = res.data;
        }).finally(() => {
            initStorageConfig.value = true;
        });
    }


    // 点击文件时，判断是文件夹则进入文件夹，是文件则进行预览
    const openRow = (row) => {
        if (!row.name) {
            return;
        }
        fileDataStore.updateCurrentClickRow(row);
        // 如果是文件且格式支持预览, 则进行预览, 格式不支持预览, 则直接进行下载 (ftp 模式不支持预览, 全部是下载)
        if (row.type === 'FILE') {
            const { batchDownloadFile } = useFileOperator(router, route);

            // 获取文件类型
            let fileType = row.fileType;

            switch (fileType) {
                case 'video': openVideo(); break;
                case 'image': openImage(row); break;
                case 'text': openText(); break;
                case 'audio': openAudio(row); break;
                // case 'office': openOffice(row); break;
                default: batchDownloadFile(row);
            }

            clearSelection();
        } else {
            if (row.type === 'ROOT') {
                router.push(row.path);
            } else if (row.type === 'BACK') {
                if (globalConfigStore.zfileConfig.fileList.backHandler === 'dbclick') {
                    let fullPath = removeDuplicateSlashes('/' + storageKey.value + '/' + row.path);
                    router.push(fullPath);
                }
            } else {
                let fullPath = removeDuplicateSlashes('/' + storageKey.value + '/' + row.path + '/' + row.name);
                router.push(fullPath);
            }
        }
    }

    // ------------- select start ------------

    // 行选中 class
    const tableRowClassName = ({row, rowIndex}) => {
        row.index = rowIndex;
        return selectRows.value.indexOf(row) !== -1 ? 'select-row' : '';
    }

    // 当前最后选中的文件行
    const selectRow = computed(() => {
        if (selectRows.value.length > 0) {
            return selectRows.value[selectRows.value.length - 1];
        } else {
            return null;
        }
    });

    // 当前选中的文件
    const selectFiles = computed(() => {
        return selectRows.value.filter((row) => {
            return row.type === 'FILE'
        })
    })

    // 当前选中的文件夹
    const selectFolders = computed(() => {
        return selectRows.value.filter((row) => {
            return row.type === 'FOLDER'
        })
    })

    // 更新选中的文件列表
    const selectRowsChange = (selection) => {
        selectRows.value = selection;
    };

    // ------------- select end ------------


    // ------------- loading start ------------

    // 是否启用骨架屏 loading
    let skeletonLoading = computed(() => {
        let skeletonEnable = globalConfigStore.zfileConfig.skeleton.enable;
        let skeletonShow = globalConfigStore.zfileConfig.skeleton.show;

        // 如果启用了骨架屏
        if (skeletonEnable) {
            // 如果骨架屏模式为是 '始终加载'
            if (skeletonShow === 'always') {
                return loading.value;
            } else {  // 如果骨架屏模式为是仅 '首次加载'
                // 已经首次加载后, 则不使用骨架屏
                return firstLoading.value ? false : loading.value;
            }
        } else {    // 如果未启用骨架屏, 则直接返回 false
            return false;
        }
    });
    // 动态配置骨架屏行数
    for (let i = 0; i < globalConfigStore.zfileConfig.skeleton.size; i++) {
        skeletonData.push({})
    }
    // 是否显示普通 loading
    let basicLoading = computed(() => {
        return skeletonLoading.value ? false : loading.value;
    });

    // ------------- loading end   ------------




    // ------------- folder password start ------------


    // 显示密码输入框
    let popPassword = () => {
        // 如果输入了密码, 则写入到 sessionStorage 缓存中, 并重新调用加载文件.
        ElMessageBox.prompt('请输入密码', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValidator(val) {
                return !!val
            },
            inputErrorMessage: '密码不能为空.'
        }).then(({value}) => {
            loadFile({password: value});
        }).catch(() => {
            router.push("/" + storageKey.value + path.resolve(searchParam.path, '../'));
        });
    }
    // 获取当前路径缓存中的密码
    let getPathPwd = () => {
        for (let storageTag of Object.keys(zfilePasswordCache.value)) {
            if (storageTag === storageKey.value) {
                for (let key of Object.keys(zfilePasswordCache.value[storageTag])) {
                    if (minimatch(currentPath.value, key)) {
                        return zfilePasswordCache.value[storageTag][key];
                    }
                }
            }
        }
        return '';
    };
    // 向缓存中写入当前路径密码
    let putPathPwd = (pattern, password) => {
        if (pattern) {
            if (!zfilePasswordCache.value[storageKey.value]) {
                zfilePasswordCache.value[storageKey.value]= {};
            }
            zfilePasswordCache.value[storageKey.value][pattern] = password;
        }
    };

    // ------------- folder password end   ------------

    // 统计信息
    const statistics = computed(() => {
        let total = 0;
        let size = 0;
        let fileCount = 0;
        let dirCount = 0;
        let fileList = fileDataStore.fileList;
        for (let i = 0; i < fileList.length; i++) {
            let item = fileList[i];
            if (item.type === 'FOLDER') {
                dirCount++;
            } else if (item.type === 'FILE') {
                fileCount++;
                size += item.size;
            }
        }
        total = dirCount + fileCount;
        return {
            total,
            size,
            fileCount,
            dirCount
        };
    });

    const selectStatistics = computed(() => {
        let selectRowsLength = selectRows.value.length;
        let selectFilesLength = selectFiles.value.length;
        let selectFoldersLength = selectFolders.value.length;

        let isSingleSelect = selectRowsLength === 1;
        let isMultiSelect = selectRowsLength > 1;
        let isAllFile = selectFilesLength === selectRowsLength;
        let isAllFolder = selectFoldersLength === selectRowsLength;

        return {
            isSingleSelect,
            isMultiSelect,
            isAllFile,
            isAllFolder
        };
    })

    return {
        currentPath, storageKey, loadFile, openRow, searchParam, sortChangeMethod, checkSelectable,
        selectRow, selectRows, selectFiles, selectFolders, selectRowsChange, tableRowClassName,
        skeletonLoading, skeletonData, basicLoading,
        statistics, selectStatistics,
        storageConfig, initStorageConfig, loadFileConfig
    }

}