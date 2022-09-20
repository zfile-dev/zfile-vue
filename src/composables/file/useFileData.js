import {ElMessage, ElMessageBox} from "element-plus";

import path from "path-browserify";
import {removeDuplicateSlashes} from "fast-glob/out/managers/patterns";

import {loadFileListReq, loadStorageConfigReq} from "~/api/home";

import common from "~/common";
import useCommon from "../useCommon";
const { encodeAllIgnoreSlashes } = useCommon();

import useRouterData from "~/composables/useRouterData";
let { routerRef, fullpath, storageKey, currentPath } = useRouterData()

import useFilePwd from "~/composables/file/useFilePwd";
let { getPathPwd, putPathPwd } = useFilePwd();

import useHeaderStorageList from "~/composables/header/useHeaderStorageList";
const { storageListAsFileList } = useHeaderStorageList();

import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

const title = useTitle(storageConfigStore.globalConfig.siteName);

import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();

// 引入文件预览组件
import useFilePreview from '~/composables/file/useFilePreview';
const { openAudio, openImage, openOffice, openPdf, openText, openVideo } = useFilePreview();

// 文件操作相关
import useFileOperator from '~/composables/file/useFileOperator';

// ------------- loading start ------------

const loading = ref(false);
// 是否是已经调用了首次 loading
const firstLoading = ref(false);
let skeletonData = reactive([]);
if (skeletonData.length === 0) {
    // 动态配置骨架屏行数
    for (let i = 0; i < globalConfigStore.zfileConfig.skeleton.size; i++) {
        skeletonData.push({})
    }
}
// ------------- loading end   ------------


// 文件列表查询条件
let searchParam = reactive({
    path: '',
    password: '',
    orderBy: '',
    orderDirection: ''
});

const initStorageConfig = ref(false);

import useFileSelect from "~/composables/file/useFileSelect";
let { selectRows, clearSelection } = useFileSelect();

export default function useFileData() {

    // 排序并重新加载数据
    const sortChangeMethod = ({prop, order}) => {
        searchParam.orderBy = prop;
        searchParam.orderDirection = order === "descending" ? "desc" : "asc";
        loadFile();
    };

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
            if (fullpath.value) {
                title.value = storageConfigStore.globalConfig.siteName + ' | ' + fullpath.value[fullpath.value.length - 1];
            } else {
                title.value = storageConfigStore.globalConfig.siteName + ' | 首页';
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
            storageKey: storageKey.value,
            path: currentPath.value
        }
        loadStorageConfigReq(param).then((res) => {
            storageConfigStore.updateFolderConfig(res.data);

            // 如果切换了存储器 ID, 则
            if (storageKey.value !== fileDataStore.oldStorageKey) {
                fileDataStore.updateOldStorageKey(storageKey.value);
            }

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
            const { batchDownloadFile } = useFileOperator();

            // 获取文件类型
            let fileType = row.fileType;


            switch (fileType) {
                case 'video': openVideo(); break;
                case 'image': openImage(row); break;
                case 'text': openText(); break;
                case 'audio': openAudio(row); break;
                case 'office': openOffice(row); break;
                case 'pdf': openPdf(row); break;
                default: batchDownloadFile(row);
            }

            clearSelection();
        } else {
            if (row.type === 'ROOT') {
                routerRef.value.push(row.path);
            } else if (row.type === 'BACK') {
                let fullPath = removeDuplicateSlashes('/' + storageKey.value + '/' + row.path);
                fullPath = encodeAllIgnoreSlashes(fullPath);
                routerRef.value.push(fullPath);
            } else {
                let fullPath = removeDuplicateSlashes('/' + storageKey.value + '/' + row.path + '/' + row.name);
                fullPath = encodeAllIgnoreSlashes(fullPath);
                routerRef.value.push(fullPath);
            }
        }
    }

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
    // 是否显示普通 loading
    let basicLoading = computed(() => {
        return skeletonLoading.value ? false : loading.value;
    });

    // ------------- loading end   ------------




    // ------------- folder password start ------------


    // 显示密码输入框
    let popPassword = () => {
        // 如果输入了密码, 则写入到 sessionStorage 缓存中, 并重新调用加载文件.
        ElMessageBox.prompt('此文件夹已加密，请输入密码', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputType: 'password',
            inputValidator(val) {
                return !!val
            },
            inputErrorMessage: '密码不能为空.'
        }).then(({value}) => {
            loadFile({password: value});
        }).catch(() => {
                    if ((searchParam.path === '/' || searchParam.path === '') && storageConfigStore.globalConfig.rootShowStorage === true) {
                        fileDataStore.updateFileList(storageListAsFileList.value);
                        routerRef.value.push("/");
                        title.value = storageConfigStore.globalConfig.siteName + ' | 首页';
                        loading.value = false;
                    } else {
                        let parentPath = path.resolve(searchParam.path, '../');
                        routerRef.value.push("/" + storageKey.value + parentPath);
            }
        });
    }

    // ------------- folder password end   ------------

    return {
        loadFile, openRow, searchParam, sortChangeMethod,
        skeletonLoading, skeletonData, basicLoading,
        initStorageConfig, loadFileConfig
    }

}