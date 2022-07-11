import {
    deleteFileReq,
    deleteFolderReq,
    newFolderReq,
    renameFileReq,
    renameFolderReq,
} from "~/api/file-operator";


import useFileData from "~/composables/file/useFileData";

// 删除相关
const batchDeleteResult = ref([]);
const batchDeleteDialogShow = ref(false);

export default function useFileOperator(router, route) {

    const { currentPath, storageKey, loadFile, storageConfig,
            selectRows, selectRow, selectFolders, selectFiles } = useFileData(router, route);

    // 批量下载已选择的所有文件
    const batchDownloadFile = (row) => {
        if (!selectRows.value && selectRows.value.length === 0) {
            ElMessage.warning("请至少选择一个文件");
            return;
        }
        let confirmMsg;

        if (row.name) {
            confirmMsg = `是否确认下载文件 ${row.name}？`;
        } else if (selectRows.value.length === 1) {
            debugger;
            confirmMsg = `是否确认下载文件 ${selectRows.value[0].name}？`;
        } else if (selectRows.value.length > 1) {
            confirmMsg = `是否确认批量下载 ${selectRows.value.length} 个文件？`;
        }

        ElMessageBox.confirm(confirmMsg, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info',
            callback: action => {
                if (action === 'confirm') {
                    if (row.name) {
                        downloadFileFromUrl(row.url)
                    } else {
                        selectRows.value.forEach((item) => {
                            if (item.type === 'FILE') {
                                downloadFileFromUrl(item.url);
                            }
                        })
                    }
                }
            }
        });


    }

    // 根据 URL 下载
    const downloadFileFromUrl = (url) => {
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
    const newFolder = () => {
        ElMessageBox.prompt(`在 <b>${currentPath.value}</b> 下创建文件夹，请输入要创建的文件夹名称`, '提示', {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            draggable: true,
            inputValidator(val) {
                if (!val) {
                    return '文件夹名称不能为空';
                }

                if (val.includes("/")) {
                    return '文件夹名称不能包含 /';
                }
                return true;
            },
        }).then(({value}) => {
            let param = {
                storageKey: storageKey.value,
                path: currentPath.value,
                name: value
            }
            newFolderReq(param).then(() => {
                ElMessage.success('创建成功');
            }).finally(() => {
                loadFile();
            });
        });
    }

    // 重命名文件夹
    const rename = () => {
        let row = selectRow.value;
        if (row === null) {
            ElMessage.warning('请先选中一个文件或文件夹！');
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
                path: currentPath.value,
                name: row.name,
                newName: value,
            }

            let reqMethod;
            if (row.type === 'FILE') {
                reqMethod = renameFileReq;
            } else if (row.type === 'FOLDER') {
                reqMethod = renameFolderReq;
            }

            reqMethod(param).then(() => {
                ElMessage.success('重命名成功');
            }).finally(() => {
                loadFile();
            });

        });
    }

    // 移动至重命名
    const moveTo = () => {
        ElMessage.warning("暂未实现");
    }

    // 复制至
    const copyTo = () => {
        ElMessage.warning("暂未实现");
    }



    // 删除相关 start
    const batchDelete = () => {
        if (!storageConfig.value.enableFileOperator) {
            return;
        }

        if (selectRows.value.length === 0) {
            ElMessage.warning('请先至少选中一个文件或文件夹！');
            return;
        }

        let deleteConfirmMsg = '是否确认批量删除 ';

        if (selectFolders.value.length > 0) {
            deleteConfirmMsg += (' ' + selectFolders.value.length + ' 个文件夹(如文件夹非空，可能会删除失败)');
        }

        if (selectFolders.value.length > 0 && selectFiles.value.length > 0) {
            deleteConfirmMsg += '，';
        }

        if (selectFiles.value.length > 0) {
            deleteConfirmMsg += (selectFiles.value.length + ' 个文件');
        }

        deleteConfirmMsg += "?"

        batchDeleteResult.value = [];
        ElMessageBox.confirm(deleteConfirmMsg, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            draggable: true,
            callback: action => {
                if (action === 'confirm') {
                    if (selectRows.value.length > 1) {
                        batchDeleteDialogShow.value = true;
                        selectRows.value.forEach((item) => {
                            deleteFileOrFolder(item).then(() => {
                                batchDeleteResult.value.push({name: item.name, status: true})
                            }).catch(() => {
                                batchDeleteResult.value.push({name: item.name, status: false})
                            });
                        })
                    } else {
                        deleteFileOrFolder(selectRow.value).then((res) => {
                            ElMessage.success('删除成功');
                            loadFile();
                        });
                    }
                }
            }
        });

        const deleteFileOrFolder = (item) => {
            let param = {
                storageKey: storageKey.value,
                path: currentPath.value,
                name: item.name
            }

            if (item.type === 'FOLDER') {
                return deleteFolderReq(param)
            } else {
                return deleteFileReq(param)
            }
        }
    }
    const batchDeleteCloseAction = () => {
        batchDeleteResult.value = [];
        loadFile();
    };
    const batchDeletePercentage= computed(() => {
        return Math.floor(batchDeleteResult.value.length / selectRows.value.length * 100);
    })
    // 删除相关 end


    return {
        batchDownloadFile, rename, newFolder, moveTo, copyTo,
        batchDelete, batchDeleteResult, batchDeleteDialogShow, batchDeleteCloseAction, batchDeletePercentage
    }
}