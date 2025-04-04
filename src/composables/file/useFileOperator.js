import {
    batchDeleteReq,
    newFolderReq,
    renameFileReq, renameFolderReq,
    moveFolderReq, moveFileReq,
    copyFileReq, copyFolderReq
} from "~/api/home/file-operator";

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

import useFileData from "~/composables/file/useFileData";
import useRouterData from "~/composables/useRouterData";
let { storageKey, currentPath } = useRouterData();

import useFileSelect from "~/composables/file/useFileSelect";
let { selectRows, selectRow, selectFolders, selectFiles } = useFileSelect();

import useFilePwd from "~/composables/file/useFilePwd";
let { getPathPwd } = useFilePwd();

import useBatchOperatorResult from "~/composables/file/useBatchOperatorResult";
let { open:openBatchOperatorResultDialog } = useBatchOperatorResult();

import { ElLoading } from "element-plus";

import selectFolder from "~/components/file/selectFolder";


export default function useFileOperator() {

    const { loadFile } = useFileData();

    /**
     * 批量下载已选择的所有文件
     * @param {Object} row 已选择的文件
     */
    const batchDownloadFile = (row) => {
        if (storageConfigStore.folderConfig.permission.download === false) {
            return;
        }
        if (!selectRows.value && selectRows.value.length === 0) {
            ElMessage.warning("请至少选择一个文件");
            return;
        }

        let confirmMsg;

        if (row?.name) {
            confirmMsg = `是否确认下载文件 <span class="text-blue-500">${row.name}</span> ？`;
        } else if (selectRows.value.length === 1) {
            confirmMsg = `是否确认下载文件 <span class="text-blue-500">${selectRows.value[0].name}</span> ？`;
            row = selectRows.value[0];
        }

        ElMessageBox.confirm(confirmMsg, '提示', {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info',
            callback: (val) => {
                let action = '';
                if (val instanceof Object) {
                    action = val.action;
                } else if (typeof val === 'string') {
                    action = val;
                }

                if (action === 'confirm') {
                    // 单个文件下载, 直接下载
                    if (row?.name) {
                        console.log('进行指定文件下载, 文件:', row);
                        downloadFileUseWindowOpenMode(row.url)
                    }
                }
            }
        })
    }

    /**
     * 使用 windows.open 模式下载文件
     *
     * @param url   下载文件 url
     */
    const downloadFileUseWindowOpenMode = (url) => {
        window.open(url);
    }

    /**
     * 使用 iframe 模式下载文件
     *
     * @param url   下载文件 url
     */
    const downloadFileUseIframeMode = (url) => {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";  // 防止影响页面
        iframe.style.height = 0;  // 防止影响页面
        iframe.src = url;
        document.body.appendChild(iframe);
        setTimeout(()=>{
            iframe.remove();
        }, 5 * 60 * 1000);
    }

    // 新建文件夹
    const newFolder = (basePath) => new Promise((resolve, reject) => {
        if (basePath === null || typeof basePath !== 'string') {
            basePath = currentPath.value;
        }
        ElMessageBox.prompt(`在 <b>${basePath}</b> 下创建文件夹，请输入要创建的文件夹名称`, '提示', {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            draggable: true,
            inputValidator(val) {
                if (!val) {
                    return '文件夹名称不能为空';
                }

                if (val.includes("/")) {
                    return '文件夹名称不能包含 / (不支持多级创建)';
                }
                return true;
            },
        }).then(({ value }) => {
            let param = {
                storageKey: storageKey.value,
                path: basePath,
                name: value
            }
            newFolderReq(param).then(() => {
                ElMessage.success('创建成功');
                resolve();
            }).catch(() => {
                reject();
            }).finally(() => {
                loadFile();
            });
        }).catch(() => {
            reject();
        });
    });

    // 重命名文件夹
    const rename = () => {
        let row = selectRow.value;
        if (row === null) {
            ElMessage.warning('请先选中一个文件或文件夹！');
            return;
        }
        if (row.type === 'FOLDER' && !storageConfigStore.folderConfig.metadata.supportRenameFolder) {
            ElMessage.warning('当前存储源不支持重命名文件夹！');
            return;
        }

        ElMessageBox.prompt(`将 <b>${row.name}</b> 修改为：`, '提示', {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: row.name,
            inputValidator(val) {
                return !!val
            },
            inputErrorMessage: '模板名称不能为空.'
        }).then(({value}) => {
            let param = {
                storageKey: storageKey.value,
                path: row.path,
                name: row.name,
                newName: value,
            }

            let reqMethod;
            if (row.type === 'FILE') {
                reqMethod = renameFileReq;
            } else if (row.type === 'FOLDER') {
                reqMethod = renameFolderReq;
            }

            const renameLoadingInstance = ElLoading.service({
                fullscreen: true,
                text: '重命名中...',
                background: 'rgba(255, 255, 255, 0.6)'
            })

            reqMethod(param).then(() => {
                ElMessage.success('重命名成功');
            }).finally(() => {
                renameLoadingInstance.close();
                loadFile();
            });

        });
    }

    // 复制至
    const copyTo = () => {
        if (selectFolders.value.length > 0 && !storageConfigStore.folderConfig.metadata.supportCopyFolder) {
            ElMessage.warning('当前存储源不支持复制文件夹！');
            return;
        }
        moveOrCopy('复制', selectRow.value?.type === 'FILE' ? copyFileReq : copyFolderReq);
    }

    // 移动至重命名
    const moveTo = () => {
        if (selectFolders.value.length > 0 && !storageConfigStore.folderConfig.metadata.supportMoveFolder) {
            ElMessage.warning('当前存储源不支持移动文件夹！');
            return;
        }
        moveOrCopy('移动', selectRow.value?.type === 'FILE' ? moveFileReq : moveFolderReq);
    }

    const moveOrCopy = (title, reqFun) => {
        const nameList = selectRows.value.map(item => item.name);
        selectFolder(title, storageKey.value, currentPath.value, ({ value:path, callback }) => {
            if (path === currentPath.value) {
                ElMessage.warning('你选择的目标文件夹与源文件夹相同！');
                callback.stopLoading();
                return;
            }

            let param = {
                storageKey: storageKey.value,
                path: currentPath.value,
                nameList: nameList,
                targetPath: path,
                targetNameList: nameList,
                srcPathPassword: getPathPwd(currentPath.value),
                targetPathPassword: getPathPwd(path)
            }

            reqFun(param).then((res) => {
                let data = res.data;
                let hasFail = false;
                for (let item of data) {
                    if (item.success === false) {
                        hasFail = true;
                    }
                }
                if (hasFail) {
                    ElMessageBox.confirm(`部分文件${title}失败，是否查看详情？`, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        closeOnClickModal: false,
                        closeOnPressEscape: false,
                        type: 'warning'
                    }).then(() => {
                        openBatchOperatorResultDialog(data);
                    });
                } else {
                    ElMessage.success(`${title}成功`);
                }
            }).finally(() => {
                callback.stopLoading();
                callback.closeDialog();
                loadFile();
            });
        });
    }

    // 删除相关 start
    const batchDelete = () => {
        if (!storageConfigStore.permission.delete) {
            return;
        }

        if (selectRows.value.length === 0) {
            ElMessage.warning('请先至少选中一个文件或文件夹！');
            return;
        }

        let deleteConfirmMsg = selectRows.value.length === 1 ? '是否确认删除 ' : '是否确认批量删除 ';

        if (selectFolders.value.length > 0) {
            deleteConfirmMsg += (' ' + selectFolders.value.length + ' 个文件夹');
        }

        if (selectFolders.value.length > 0 && selectFiles.value.length > 0) {
            deleteConfirmMsg += '，';
        }

        if (selectFiles.value.length > 0) {
            deleteConfirmMsg += (selectFiles.value.length + ' 个文件');
        }

        if (selectFolders.value.length > 0 && !storageConfigStore.folderConfig.metadata.supportDeleteNotEmptyFolder) {
            deleteConfirmMsg += ('<span class="font-bold text-red-400">(不支持删除非空文件夹)</span>');
        }

        deleteConfirmMsg += "?"

        ElMessageBox.confirm(deleteConfirmMsg, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            draggable: true,
            dangerouslyUseHTMLString: true,
            callback: action => {
                if (action === 'confirm') {
                    let param = {
                        storageKey: storageKey.value,
                        deleteItems: []
                    };

                    selectRows.value.forEach((item) => {
                        param.deleteItems.push({
                            path: item.path,
                            name: item.name,
                            type: item.type,
                            password: getPathPwd(item.path)
                        });
                    })

                    // 打开全屏 loading
                    const loadingInstance = ElLoading.service({
                        text: '删除中...',
                        background: 'rgba(0, 0, 0, .3)'
                    })

                    batchDeleteReq(param).then((res) => {
                        let data = res.data;
                        let hasFail = false;
                        for (let item of data) {
                            if (item.success === false) {
                                hasFail = true;
                            }
                        }
                        if (hasFail) {
                            ElMessageBox.confirm('部分文件删除失败，是否查看详情？', '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                closeOnClickModal: false,
                                closeOnPressEscape: false,
                                type: 'warning'
                            }).then(() => {
                                openBatchOperatorResultDialog(data);
                            });
                        } else {
                            ElMessage.success("删除成功");
                        }
                    }).finally(() => {
                        loadingInstance.close();
                        loadFile();
                    });
                }
            }
        });
    }
    // 删除相关 end

    return {
        batchDownloadFile, rename, newFolder, moveTo, copyTo,
        batchDelete
    }
}