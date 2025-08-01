import {ElMessage} from "element-plus";
import MessageBox from "~/components/messageBox/messageBox";
import { concatPathAndEncodeAll } from "~/utils";

import useFileContextMenu from "~/composables/file/useFileContextMenu";
const { contextMenuTargetFile, contextMenuTargetBlank } = useFileContextMenu();

import path from "path-browserify";

import {loadFileListReq, loadStorageConfigReq} from "~/api/home/home";

import useRouterData from "~/composables/useRouterData";
let { routerRef, fullpath, storageKey, currentPath } = useRouterData()

import useFilePwd from "~/composables/file/useFilePwd";
let { getPathPwd, putPathPwd } = useFilePwd();

import useHeaderStorageList from "~/composables/header/useHeaderStorageList";
const { storageListAsFileList } = useHeaderStorageList();

import useFileLoading from "~/composables/file/useFileLoading";
const { loading, firstLoading, basicLoading, skeletonLoading } = useFileLoading();

import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

const title = useTitle(storageConfigStore.globalConfig.siteName);

import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();

// 引入文件预览组件
import useFilePreview from '~/composables/file/useFilePreview';
const { openAudio, openImage, openOffice, openPdf, openText, openVideo, open3d, openKkFileView } = useFilePreview();

// 文件操作相关
import useFileOperator from '~/composables/file/useFileOperator';

// ------------- loading start ------------

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
    orderBy: '',
    orderDirection: ''
});

import useFileSelect from "~/composables/file/useFileSelect";
let { selectRows, clearSelection } = useFileSelect();

export default function useFileData() {

    // 排序并重新加载数据
    const sortChangeMethod = ({prop, order}) => {
        searchParam.orderBy = prop;
        searchParam.orderDirection = order === "descending" ? "desc" : "asc";
        loadFile();
    };

    /**
     * 加载数据
     * @param   initParam
     *              path: 指定加载的路径, 如果不指定则使用路由路径
     *              password: 指定加载的密码, 如果不指定则获取 path 对应的密码，如果 path 为空，则获取当前路由路径
     *              rememberPassword: 是否记住密码, 如果不指定则不记住密码
     */
    const loadFile = (initParam) => {
        // 未指定 storageKey 时, 不执行任何操作.
        if (!storageKey.value) {
            return;
        }
        loading.value = true;

        let loadPath = initParam?.path || currentPath.value;

        let param = initParam || {};
        param.storageKey = storageKey.value;
        param.path = loadPath;
        param.password = param.password || getPathPwd(loadPath, param.init);
        param.orderBy = searchParam.orderBy || storageConfigStore.globalConfig.defaultSortField;
        param.orderDirection = searchParam.orderDirection || storageConfigStore.globalConfig.defaultSortOrder;

        let requestStorageId = storageKey.value;
        loadFileListReq(param).then((response) => {
            // 将加载成功的密码存储起来.
            let passwordPattern = response.data.passwordPattern;
            putPathPwd(passwordPattern, param.password, initParam?.rememberPassword);

            // 如果请求的 storageKey 和当前的 storageKey 不一致
            // 则表示再加载数据期间，修改了 storageKey, 为了防止数据错乱, 取消本次渲染.
            if (requestStorageId !== storageKey.value) {
                return;
            }

            let fileList = response.data.files;

            // 如果不是根路径, 则构建 back 上级路径的数据.
            if (loadPath !== '' && loadPath !== '/') {
                let parentPathName = path.basename(path.resolve(currentPath.value, "../"));
                fileList.unshift({
                    name: parentPathName ? parentPathName : '/',
                    path: path.resolve(loadPath, '../'),
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

            loadFileConfig(param);
        }).catch((error) => {
            const onConfirm = (password, rememberPassword) => {
                loadFile({password, rememberPassword});
            };
            const onCancel = () => {
                if ((loadPath === '/' || loadPath === '') && storageConfigStore.globalConfig.rootShowStorage === true) {
                    fileDataStore.updateFileList(storageListAsFileList.value);
                    routerRef.value.push("/");
                    title.value = storageConfigStore.globalConfig.siteName + ' | 首页';
                    loading.value = false;
                } else {
                    let parentPath = path.resolve(loadPath, '../');
                    routerRef.value.push("/" + storageKey.value + parentPath);
                }
            };
            let data = error.response.data;
            // 如果需要密码或密码错误进行提示, 并弹出输入密码的框.
            if (data.code === constant.responseCode.INVALID_PASSWORD) {
                ElMessage.warning('密码错误，请重新输入！');
                popPassword(onConfirm, onCancel);
            } else if (data.code === constant.responseCode.REQUIRED_PASSWORD) {
                popPassword(onConfirm, onCancel);
            } else {
                ElMessage.error(data.msg);
            }
        });
    }

    // 加载存储器设置
    const loadFileConfig = (loadFileParam) => {

        let param = {
            storageKey: storageKey.value,
            path: currentPath.value,
            password: loadFileParam.password
        }
        loadStorageConfigReq(param).then((res) => {
            storageConfigStore.updateFolderConfig(res.data);

            // 如果切换了存储器 ID, 则
            if (storageKey.value !== fileDataStore.oldStorageKey) {
                fileDataStore.updateOldStorageKey(storageKey.value);
            }

        });
    }


    // 点击文件时，判断是文件夹则进入文件夹，是文件则进行预览
    const openRow = (row, fromContextmenu) => {
        if (!row.name) {
            return;
        }

        // 当右键菜单打开时, 点击文件时, 不进行任何操作. 应该关闭右键菜单.
        if (!fromContextmenu && (contextMenuTargetFile.value === true || contextMenuTargetBlank.value === true)) {
            return;
        }

        fileDataStore.updateCurrentClickRow(row);
        // 如果是文件且格式支持预览, 则进行预览, 格式不支持预览, 则直接进行下载 (ftp 模式不支持预览, 全部是下载)
        if (row.type === 'FILE') {
            const { batchDownloadFile } = useFileOperator();

            // 获取文件类型
            let fileType = row.fileType;

            if (storageConfigStore.folderConfig.permission.preview) {
                switch (fileType) {
                    case 'video': openVideo(); break;
                    case 'image': openImage(row); break;
                    case 'text': openText(); break;
                    case 'audio': openAudio(row); break;
                    case 'office': openOffice(row); break;
                    case 'pdf': openPdf(row); break;
                    case 'three3d': open3d(row); break;
                    case 'kkfileview': openKkFileView(row); break;
                    default: batchDownloadFile(row);
                }
            } else {
                batchDownloadFile(row);
            }

            clearSelection();
        } else {
            if (row.type === 'ROOT') {
                routerRef.value.push(row.path);
                storageConfigStore.folderConfig.readmeText = '';
            } else if (row.type === 'BACK') {
                let fullPath = concatPathAndEncodeAll("/", storageKey.value, row.path);
                routerRef.value.push(fullPath);
                storageConfigStore.folderConfig.readmeText = '';
            } else {
                let fullPath = concatPathAndEncodeAll("/", storageKey.value, row.path, row.name);
                routerRef.value.push(fullPath);
                storageConfigStore.folderConfig.readmeText = '';
            }
        }
    }


    // ------------- folder password start ------------


    // 显示密码输入框
    let popPassword = (onConfirm, onCancel) => {
        // 如果输入了密码, 则写入到 sessionStorage 缓存中, 并重新调用加载文件.
        MessageBox.prompt('此文件夹已加密，请输入密码：', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputType: 'password',
            checkbox: true,
            defaultChecked: storageConfigStore.globalConfig.defaultSavePwd,
            inputDefault: getPathPwd(null, true),
            checkboxLabel: '记住密码',
            inputValidator(val) {
                return !!val
            },
            inputErrorMessage: '密码不能为空.'
        }).then(({value, checkbox}) => {
            onConfirm && onConfirm(value, checkbox);
        }).catch(() => {
            onCancel && onCancel();
        });
    }

    // ------------- folder password end   ------------

    return {
        loadFile, openRow, searchParam, sortChangeMethod,
        skeletonLoading, skeletonData, basicLoading, loading,
        loadFileConfig, popPassword
    }

}