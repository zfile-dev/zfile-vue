import {ElLoading} from "element-plus";
import { newFolderReq, uploadFileReq } from "~/api/home/file-operator";
import axios from "axios";
import selfAxios from "~/http/request"
import { concatPath, fileSizeFormat, removeDuplicateSeparator } from "~/utils";

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

import {hasDialog, hasSearchInputFocus, hasPasswordInputFocus} from "~/composables/file/useTableOperator";

// 拖拽上传状态, true 表示正有文件拖拽悬浮在上传框上
let dropState = ref(false);
import useRouterData from "~/composables/useRouterData";


// 是否已经初始化监听 watch, 防止重复引用该文件导致的重复 watch
let isInitWatch = false;

// 是否显示上传框.
const visible = ref(false);

// 当前上传模式, 'file' or 'folder'
const uploadMode = ref('');

// 正在上传或已完成文件列表
const uploadingFileList = reactive([
]);

// 等待上传文件列表
const waitingFileList = reactive([]);

// 取消上传文件的 cancelTokenSource 映射表
const cancelTokenSourceMap = new Map();

// 正在上传或已完成文件映射表 key: fileInfo.index value: fileInfo
const uploadingFileMap = new Map();

// 文件上传 index
let uploadIndex = 0;

// 文件上传状态顺序
const uploadFileTypeSortMap = {
    "error": 1,
    "uploading": 2,
    "waiting": 3,
    "finished": 4,
};

export default function useFileUpload() {

    let { storageKey, currentPath } = useRouterData();
    const maxFileUploads = storageConfigStore.globalConfig.maxFileUploads;

    // 监听文件拖拽上传事件
    const listenDropFile = (dropArea) => {
        // 拖拽进入, 显示提示.
        dropArea = document.querySelector('body');

        const dropOrPasteUpload = (e) => {
            let isPaste = e.clipboardData?.items?.length > 0;
            let isDrop = e.dataTransfer?.files?.length > 0;

            // 关闭提示
            removeDragClass();
            dropState.value = false;

            // 如果是 focus 在搜索框, 则且是粘贴上传，则不处理上传.
            if (hasSearchInputFocus() && isPaste) {
                return;
            }

            // 如果是拖拽上传，但已经打开了 dialog，则不处理上传.
            if (hasDialog() && isDrop) {
                return;
            }

            // 如果 focus 在密码输入框，则不处理上传.
            if (hasPasswordInputFocus()) {
                return;
            }

            // 如果粘贴的是纯文本，则不处理上传.
            if (isPaste && e.clipboardData?.types?.length === 1 && e.clipboardData?.types[0] === 'text/plain') {
                return;
            }

            if (!storageKey.value) {
                return;
            }

            // 如果不允许文件操作，直接返回.
            if (!storageConfigStore.permission.upload) {
                return;
            }

            //阻止事件冒泡
            e.stopPropagation();
            //阻止事件的默认行为
            e.preventDefault();

            // 打开全屏 loading
            const loadingInstance = ElLoading.service({
                text: '文件读取中...',
                background: 'rgba(0, 0, 0, .3)'
            })

            const items = e.clipboardData?.items || e.dataTransfer?.items;

            getFilesByDataTransferItemList(items).then(async (fileList) => {
                // 关闭 loading
                loadingInstance.close()

                // 如果用户没有新建文件夹权限, 则不允许上传文件夹
                if (!storageConfigStore.permission.newFolder) {
                    fileList = fileList.filter((item) => {
                        if (item.dropUploadPath) {
                            return removeDuplicateSeparator(item.dropUploadPath).split('/').length <= 2;
                        }
                        if (item.webkitRelativePath) {
                            return removeDuplicateSeparator(item.webkitRelativePath).split('/').length <= 2;
                        }
                        if (item.path) {
                            return removeDuplicateSeparator(item.path).split('/').length <= 2;
                        }
                        return false;
                    })
                }

                // 如果没有文件, 则直接返回
                if (fileList.length === 0) {
                    return;
                }

                // 上传文件过多时，提示.
                if (fileList.length > 100) {
                    const action = await ElMessageBox.confirm(`文件数量为 ${fileList.length} 个，是否确认上传？`, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'success'
                    });

                    if (action !== 'confirm') {
                        return;
                    }
                }

                // 先创建所有文件夹
                const createFoldersLoadingInstance = ElLoading.service({
                    text: '创建文件夹中...',
                    background: 'rgba(0, 0, 0, .3)'
                })

                // 获取上传中包含的空文件夹，存储到 createdFolderSet 中并从 fileList 中移除
                let createdFolderSet = new Set();
                fileList = fileList.filter((file) => {
                    // 如果包含 webkitRelativePath, 则表示是文件夹上传, 需要获取文件完整路径
                    if (file.webkitRelativePath || file.dropUploadPath) {
                        let pathStr = file.webkitRelativePath || file.dropUploadPath;

                        if (!pathStr.startsWith('/')) {
                            pathStr = '/' + pathStr;
                        }

                        pathStr = pathStr.substring(0, pathStr.lastIndexOf('/'));

                        let prePath = '';
                        for (let subPath of pathStr.split("/")) {
                            if (subPath) {
                                if (!prePath) {
                                    prePath = "/" + subPath;
                                } else {
                                    prePath = prePath + '/' + subPath;
                                }
                                createdFolderSet.add(prePath);
                            }
                        }
                    } else if (file.isEmptyDirectory) {
                        createdFolderSet.add(file.path);
                        return false;
                    }
                    return true;
                });

                console.log('[upload] 要提前创建的文件夹:', createdFolderSet);

                // 创建指定的文件夹列表方法
                async function handleCreateFolders(folderPathList) {
                    let uploadToPath = currentPath.value;
                    for (let path of folderPathList) {
                        let basePath = path.substring(0, path.lastIndexOf('/'));
                        let pathName = path.substring(path.lastIndexOf('/') + 1);
                        let param = {
                            storageKey: storageKey.value,
                            path: concatPath(uploadToPath, basePath),
                            name: pathName
                        }
                        console.log('[upload] 创建文件夹: path:', param.path, ', name:', param.name);
                        try {
                            await newFolderReq(param);
                            console.log('[upload] 创建文件夹成功:', path);
                        } catch {
                            console.log('[upload] 创建文件夹失败:', path);
                        }
                    }
                }

				if (storageConfigStore.folderConfig.metadata.needCreateFolderBeforeUpload === true) {
					await handleCreateFolders(createdFolderSet).finally(() => {
						createFoldersLoadingInstance.close();
					});
				} else {
					createFoldersLoadingInstance.close();
				}

                // 如果去除所有空文件夹下没有文件, 则直接返回
                if (fileList.length === 0) {
                    console.log('[upload] 去除所有空文件夹下没有文件, 则直接返回，无需上传文件');
                    return;
                }

                // 上传文件
                visible.value = true;
                fileList.forEach((item) => {
                    beforeUpload({
                        file: item
                    });
                })
            })
        }

        // 最后拖拽的目标元素
        let lastEnterTarget = null;
        // 拖拽进入时，记录当前拖拽的目标元素，并添加防止拖拽穿透的 class
        dropArea.addEventListener('dragenter', (event) => {
            if (!storageKey.value) {
                return;
            }

            if (visible.value) {
                return;
            }

            // 如果不允许文件操作，直接返回.
            if (!storageConfigStore.permission.upload) {
                return;
            }

            lastEnterTarget = event.target;
            addDragClass();
            event.stopPropagation();
            event.preventDefault();
            dropState.value = true;
        }, false);

        // 拖拽进入后, 移动位置时, 记录拖拽状态
        dropArea.addEventListener("dragover", function(event) {
            if (!storageKey.value) {
                return;
            }

            if (visible.value) {
                return;
            }

            // 如果不允许文件操作，直接返回.
            if (!storageConfigStore.permission.upload) {
                return;
            }

            event.stopPropagation();
            event.preventDefault();
            dropState.value = true;
        }, false);

        // 拖拽离开, 移除防拖拽穿透 class, 并关闭拖拽提示
        dropArea.addEventListener("dragleave", function(event) {
            if (!storageKey.value) {
                return;
            }

            if (visible.value) {
                return;
            }

            // 如果不允许文件操作，直接返回.
            if (!storageConfigStore.permission.upload) {
                return;
            }

            if(lastEnterTarget === event.target){
                removeDragClass();
                dropState.value = false;
            }

            event.stopPropagation();
            event.preventDefault();
        }, false);

        // 拖拽放下时, 移除防拖拽穿透 class, 并关闭拖拽提示, 开始上传
        dropArea.addEventListener('drop', dropOrPasteUpload, false);

        // ctrl + v 粘贴文件时, 开始上传
        dropArea.addEventListener('paste', dropOrPasteUpload, false);

        // 根据拖拽或粘贴事件的 DataTransferItemList 列表获取文件列表
        const getFilesByDataTransferItemList = async (dataTransferItemList) => {
            // 储存获取到的文件列表
            let fileList = [];
            let DirectoryEntryList = [];

            if (dataTransferItemList) {
                // 拖拽对象列表转换成数组
                let items = new Array(...dataTransferItemList);
                // 获得 DirectoryEntry 对象列表
                for (let index = 0; index < items.length; index++) {
                    let e = items[index];
                    let item = null;
                    // 兼容不同内核的浏览器
                    if (e.webkitGetAsEntry) {
                        item = e.webkitGetAsEntry();
                        if (!item) {
                            item = e.getAsFile();
                            if (item) {
                                fileList.push(item);
                                continue;
                            }
                        }
                    } else if (e.getAsEntry) {
                        item = e.getAsEntry();
                    } else {
                        ElMessage.warning("浏览器不支持拖拽上传");
                        return;
                    }
                    if (item) {
                        DirectoryEntryList.push(item);
                    }
                }
                if (DirectoryEntryList.length > 0) {
                    for (let index = 0; index < DirectoryEntryList.length; index++) {
                        let item = DirectoryEntryList[index];
                        if (item) {
                            //获取文件夹目录
                            let FileTree = await getFileTree(item);
                            // 拿到目录下的所有文件
                            if (Array.isArray(FileTree)) {
                                //展平文件夹
                                flattenArray(FileTree, fileList);
                            } else {
                                //方便后续处理，单文件时也包装成数组
                                fileList.push(FileTree);
                            }
                        }
                    }
                }
            }

            return fileList;
        }

        // 添加 class, 防止拖拽穿透到子元素上
        const addDragClass = () => {
            dropArea.classList.add('dragging-over');
        }

        // 拖拽完成, 移除 class
        const removeDragClass = () => {
            dropArea.classList.remove('dragging-over');
        }

        /**
         * 获取文件
         */
        function fileSync(item) {
            return new Promise((resolve, reject) => {
                item.file(res => {
                    resolve(res);
                });
            });
        }

        // 读取文件夹下的文件
        function readEntriesSync(dirReader) {
            return new Promise((rel, rej) => {
                dirReader.readEntries(res => {
                    rel(res);
                });
            });
        }

        /**
         * 展平数组
         * @param array 需要展平的数组
         * @param result 展平后的数组
         *
         */
        function flattenArray(array, result) {
            for (let i = 0; i < array.length; i++) {
                if (Array.isArray(array[i])) {
                    flattenArray(array[i], result);
                } else {
                    result.push(array[i]);
                }
            }
        }

        /**
         * 获取文件目录结构树
         *
         */
        async function getFileTree(item) {
            let path = item.fullPath || "";
            let dir = [];
            if (item.isFile) {
                let resFile = await fileSync(item);
                resFile.dropUploadPath = path;
                return resFile;
                // item 为文件夹时
            } else if (item.isDirectory) {
                let dirReader = item.createReader();
                let entries = await readEntriesSync(dirReader);
                // 如果目录为空，返回当前路径或目录信息
                if (entries.length === 0) {
                    return { path, isEmptyDirectory: true };
                }
                for (let i = 0; i < entries.length; i++) {
                    let proItem = await getFileTree(entries[i]);
                    dir.push(proItem);
                }
                return dir;
            }
        }
    }

    // 打开上传文件 dialog
    const openUploadDialog = () => {
        visible.value = true;
        uploadMode.value = 'file';
    }

    // 打开上传文件夹 dialog
    const openUploadFolderDialog = () => {
        visible.value = true;
        uploadMode.value = 'folder';
        nextTick(() => {
            document.getElementsByClassName('el-upload__input')[0].webkitdirectory = true;
        })
    }

    /**
     * 上传文件前的一些操作
     * @param param
     */
    const beforeUpload = (param) => {
        uploadFile(param.file, param.uploadBasePath);
    }

    // 文件上传操作.
    const uploadFile = async (file, uploadBasePath) => {
        const fileIndex = uploadIndex++;

        uploadBasePath = uploadBasePath || currentPath.value;

        let uploadToPath = uploadBasePath;

        // 如果包含 webkitRelativePath, 则表示是文件夹上传, 需要获取文件完整路径
        if (file.webkitRelativePath || file.dropUploadPath) {
            let pathStr = file.webkitRelativePath || file.dropUploadPath;
            if (!pathStr.startsWith('/')) {
                pathStr = '/' + pathStr;
            }
            let pathList = pathStr.split('/');
            pathList.forEach((item, index) => {
                let isFirstItem = 0 === index;
                let isLastItem = pathList.length - 1 === index;

                if (isFirstItem || isLastItem) {
                    return;
                }

                if (item) {
                    uploadToPath += ('/' + item);
                }
            })
        }

        let param = {
            storageKey: storageKey.value,
            path: removeDuplicateSeparator(uploadToPath),
            name: file.name,
            size: file.size
        }

        console.log('[upload] 当前上传信息:', param, ', 当前同时上传文件数:',uploadProgressInfoStatistics.value.totalUploading, '限制同时上传文件数:', maxFileUploads);
        if (uploadProgressInfoStatistics.value.totalUploading >= maxFileUploads) {
            console.log(`[upload] 上传文件数超出 ${maxFileUploads}, 等待上传`);
            waitingFileList.push({
                index: fileIndex,
                file: file,
                uploadBasePath: uploadBasePath,
            });
            return;
        }

        let uploadFileInfo = {
            name: file.name,
            size: file.size,
            speed: '-',
            progress: 0,
            loaded: 0,
            status: 'uploading',
            startTime: Date.now(),
            file: file,
            index: fileIndex
        }
        uploadingFileList.push(uploadFileInfo);
        cancelTokenSourceMap.set(fileIndex, axios.CancelToken.source());
        uploadingFileMap.set(fileIndex, uploadingFileList[uploadingFileList.length - 1]);

        uploadFileReq(param).then((res) => {
            // 监听取消上传事件
            const { on } = useEventBus(`cancel-upload-${fileIndex}`);
            on(() => {
                let cancelTokenSource = cancelTokenSourceMap.get(fileIndex);
                if (cancelTokenSource) {
                    cancelTokenSource.cancel();
                    // 从上传列表中移除当前要取消的文件
                    uploadingFileList.find((item, index) => {
                        let b = item.name === file.name;
                        if (b) {
                            uploadingFileList.splice(index, 1);
                        }
                        return b;
                    });
                }
            });

            if (storageConfigStore.folderConfig.metadata.uploadType === 'PROXY') {
                fileProxyUpload(file, res.data, fileIndex);
            } else if (storageConfigStore.folderConfig.metadata.uploadType === 'S3') {
                s3FileUpload(file, res.data, fileIndex);
            } else if (storageConfigStore.folderConfig.metadata.uploadType === 'MICROSOFT') {
                onedriveUpload(file, res.data, fileIndex);
            } else if (storageConfigStore.folderConfig.metadata.uploadType === 'UPYUN') {
                upyunFileUpload(file, res.data, fileIndex);
            }
        }).catch((err) => {
            baseOnUploadError(fileIndex, err)
        });
    }

    const silentUploadFile = (file) => {
        let uploadToPath = currentPath.value;
        let param = {
            storageKey: storageKey.value,
            path: removeDuplicateSeparator(uploadToPath),
            name: file.name,
            size: file.size
        }

        uploadFileReq(param).then((res) => {
            const fileIndex = uploadIndex++;

            const loadingInstance = ElLoading.service({
                text: '上传中...',
                background: 'rgba(0, 0, 0, .3)'
            })

            const onUploadFinish = () => {
                ElMessage.success('保存成功');
                loadingInstance.close();
            }
            const onUploadError = (err) => {
                ElMessage.error('保存失败: ' + parseErrMessage(err));
                loadingInstance.close();
            }
            if (storageConfigStore.folderConfig.metadata.uploadType === 'PROXY') {
                fileProxyUpload(file, res.data, fileIndex, true, onUploadFinish, onUploadError);
            } else if (storageConfigStore.folderConfig.metadata.uploadType === 'S3') {
                s3FileUpload(file, res.data, fileIndex, true, onUploadFinish, onUploadError);
            } else if (storageConfigStore.folderConfig.metadata.uploadType === 'MICROSOFT') {
                onedriveUpload(file, res.data, fileIndex, true, onUploadFinish, onUploadError);
            } else if (storageConfigStore.folderConfig.metadata.uploadType === 'UPYUN') {
                upyunFileUpload(file, res.data, fileIndex, true, onUploadFinish, onUploadError);
            }
        });
    }

    // 服务器代理上传
    const fileProxyUpload = (file, uploadUrl, fileIndex, silentMode=false, onSuccess, onError) => {
        let formData = new FormData();
        formData.append("file", file);
        selfAxios({
            method: "PUT",
            url: uploadUrl,
            data: formData,
            config: {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                cancelToken: cancelTokenSourceMap.get(fileIndex)?.token,
                onUploadProgress: silentMode ? null : (progressEvent) => {
                    baseOnUploadProgress(progressEvent, fileIndex, true);
                },
                containToken: true
            }
        }).then(() => {
            if (onSuccess) {
                onSuccess();
            } else {
                baseOnUploadFinish(fileIndex);
            }
        }).catch((err) => {
            if (onError) {
                onError(err);
            } else {
                baseOnUploadError(fileIndex, err);
            }
        });
    }

    // s3 通用上传
    const s3FileUpload = (file, uploadUrl, fileIndex, silentMode=false, onSuccess, onError) => {
        // 处理 uploadUrl 中的 Content-Type 参数，如果则获取赋值到一个变量，用于请求时设置，并从 url 中移除这个参数
        let contentType = '';
        if (uploadUrl.includes('Content-Type=')) {
            let url = new URL(uploadUrl);
            contentType = url.searchParams.get('Content-Type');
            url.searchParams.delete('Content-Type');
            uploadUrl = url.toString();
        }
        axios.put(uploadUrl, file, {
            withCredentials: false,
            headers: {
                'Content-Type': contentType
            },
            cancelToken: cancelTokenSourceMap.get(fileIndex)?.token,
            onUploadProgress: silentMode ? null : (progressEvent) => {
                baseOnUploadProgress(progressEvent, fileIndex);
            }
        }).then(() => {
            if (onSuccess) {
                onSuccess();
            } else {
                baseOnUploadFinish(fileIndex);
            }
        }).catch((err) => {
            if (onError) {
                onError(err);
            } else {
                baseOnUploadError(fileIndex, err);
            }
        });
    }

    // OneDrive SharePoint 上传
    const onedriveUpload = (file, uploadUrl, fileIndex, silentMode=false, onSuccess, onError) => {
        let index = 1;  // 当前块数
        let start = 0;  // 开始字节数
        let end = 0;    // 结束字节数
        let fileSize = file.size;           // 文件大小
        const MAX_FILE_SIZE = 104857599;    // 每块大小 100M

        if (fileSize === 0) {
            baseOnUploadError(fileIndex, '当前存储类型不支持上传空文件');
            return;
        }

        // 分块上传
        const uploadBlock = () => {
            // 计算每块的开始和结束位置
            if (start + MAX_FILE_SIZE >= fileSize) {
                end = fileSize;
            } else {
                end = start + MAX_FILE_SIZE;
            }

            if (index > 1) {
                cancelTokenSourceMap.set(fileIndex, axios.CancelToken.source());
            }

            // 截取文件每块上传
            let fileBlock = file.slice(start, end);
            axios.put(`${uploadUrl}`, fileBlock, {
                cancelToken: cancelTokenSourceMap.get(fileIndex)?.token,
                timeout: 10000000,
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Range': `bytes ${start}-${end - 1}/${file.size}`
                },
                type: 'sync',
                withCredentials: false,
                onUploadProgress: silentMode ? null : (progressEvent) => {
                    if (progressEvent.lengthComputable || progressEvent.loaded) {
                        let uploadFileInfo = uploadingFileMap.get(fileIndex);

                        const realLoaded = progressEvent.loaded + start;

                        uploadFileInfo.size = fileSize;
                        uploadFileInfo.loaded = realLoaded;
                        uploadFileInfo.progress = Math.round(realLoaded / fileSize * 100);
                        uploadFileInfo.speed = fileSizeFormat(Math.round(realLoaded / (Date.now() - uploadFileInfo.startTime) * 1000));
                    }
                }
            }).then((response) => {
                if (response.status === 202) {
                    start += MAX_FILE_SIZE;
                    index += 1;
                    uploadBlock();
                } else if (response.status === 201 || response.status === 200) {
                    if (onSuccess) {
                        onSuccess();
                    } else {
                        baseOnUploadFinish(fileIndex);
                    }
                }
            }).catch((e) => {
                if (onError) {
                    onError(e);
                } else {
                    baseOnUploadError(fileIndex, e);
                }
            });
        }

        uploadBlock();
    }

    // 又拍云上传
    const upyunFileUpload = (file, uploadUrl, fileIndex, silentMode=false, onSuccess, onError) => {
        let uploadInfo = JSON.parse(uploadUrl);
        let formData = new FormData();
        formData.append('name', file.name);
        formData.append("authorization", uploadInfo.signature);
        formData.append("policy", uploadInfo.policy);
        formData.append("file", file);

        axios.post(uploadInfo.url, formData, {
            withCredentials: false,
            cancelToken: cancelTokenSourceMap.get(fileIndex)?.token,
            onUploadProgress: silentMode ? null : (progressEvent) => {
                baseOnUploadProgress(progressEvent, fileIndex);
            }
        }).then(() => {
            if (onSuccess) {
                onSuccess();
            } else {
                baseOnUploadFinish(fileIndex);
            }
        }).catch((err) => {
            if (onError) {
                onError(err);
            } else {
                baseOnUploadError(fileIndex, err);
            }
        });
    }

    const parseErrMessage = (err) => {
        let errMsg = '';
        if (err?.response?.data) {
            if (err.response.data?.code && err.response.data?.msg) {
                errMsg = `上传失败 ${err.response.data.code}: ${err.response.data.msg}`;
            } else {
                errMsg = err.response.data;
            }
        } else if (err?.name === 'AxiosError') {
            errMsg = '上传失败: 网络错误或目标服务未允许跨域请求';
        } else {
            errMsg = err;
        }
        return errMsg;
    }

    // 通用上传结束设置.
    const baseOnUploadError = (fileIndex, err) => {
        let uploadFileInfo = uploadingFileMap.get(fileIndex);
        uploadFileInfo.status = 'error';
        uploadFileInfo.endTime = Date.now();
        uploadFileInfo.msg = parseErrMessage(err);
    }

    // 通用上传结束设置.
    const baseOnUploadFinish = (fileIndex) => {
        let uploadFileInfo = uploadingFileMap.get(fileIndex);
        uploadFileInfo.progress = 100;
        uploadFileInfo.status = 'finished';
        uploadFileInfo.endTime = Date.now();
        uploadFileInfo.msg = '上传成功';
    }

    // 通用上传进度条处理
    const baseOnUploadProgress = (progressEvent, fileIndex, isProxyUpload) => {
        let uploadFileInfo = uploadingFileMap.get(fileIndex);
        uploadFileInfo.size = progressEvent.total;
        uploadFileInfo.loaded = progressEvent.loaded;
        uploadFileInfo.progress = Math.round(progressEvent.loaded / progressEvent.total * 100);
        uploadFileInfo.speed = fileSizeFormat(Math.round(progressEvent.loaded / (Date.now() - uploadFileInfo.startTime) * 1000));

        console.log('[upload] uploadFileInfo', uploadFileInfo, isProxyUpload);
        if (isProxyUpload && uploadFileInfo.progress === 100) {
            uploadFileInfo.msg = '上传完成, 服务器中转中...';
        }
    }

    // 取消上传请求
    const cancelUpload = (item) => {
        ElMessageBox.confirm(`是否确定取消文件 <span class="text-blue-400">${item.name}</span> 上传？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '返回',
            type: 'warning',
            dangerouslyUseHTMLString: true,
            callback: action => {
                if (action === 'confirm') {
                    useEventBus(`cancel-upload-${item.index}`).emit();
                }
            }
        });
    }

    // 上传文件信息
    const uploadProgressInfoStatistics = computed(() => {
        let totalSize = uploadingFileList.length;
        let totalUploading = 0;
        let totalFinish = 0;
        uploadingFileList.forEach((item) => {
            if (item.status === 'uploading') {
                totalUploading++;
            } else if (item.status === 'finished') {
                totalFinish++;
            }
        })

        let totalUploadingAndWaiting = totalUploading + waitingFileList.length;


        return {
            totalSize,
            totalUploading,
            totalFinish,
            totalUploadingAndWaiting
        };
    })

    // 上传文件排序结果
    const uploadProgressInfoSorted = computed(() => {
        let result = [];
        result.push(...uploadingFileList);
        waitingFileList.forEach((item) => {
            result.push({
                name: item.file.name,
                size: item.file.size,
                status: 'waiting',
                msg: '排队中...',
                index: item.index
            })
        })

        result.sort((a, b) => {
            let aStatus = a.status;
            let bStatus = b.status;
            if (aStatus !== bStatus) {
                return uploadFileTypeSortMap[aStatus] - uploadFileTypeSortMap[bStatus];
            }

            if (a.startTime !== b.startTime) {
                return a.startTime - b.startTime;
            }

            // 如果状态一样，则按照开始时间排序
            return a.endTime - b.endTime;
        });
        console.log('[upload] uploadProgressInfoSorted', result);
        // return mockUploadData;
        return result;
    })

    if (!isInitWatch) {
        watch(() => uploadProgressInfoStatistics.value.totalUploading, (newValue) => {
            if (newValue < maxFileUploads) {
                console.log('[upload] 检测到上传中的文件个数小于最大上传限制.');
                if (waitingFileList.length === 0) {
                    console.log('[upload] 等待上传的文件数为 0, 无需继续上传.');
                } else {
                    let spliceList = waitingFileList.splice(0, 1);
                    let fileItem = spliceList[0];
                    beforeUpload({
                        file: fileItem.file,
                        uploadBasePath: fileItem.uploadBasePath
                    });
                    console.log('[upload] 开始从等待队列中获取上传文件: ', fileItem.file.name);
                }
            }
        });
        isInitWatch = true;
    }

    const removeUploadFileByIndex = (fileIndex) => {
        if (fileIndex === null || fileIndex === undefined) {
            return;
        }

        let removeIndex = uploadingFileList.findIndex((item, index) => {
            if (item.index === fileIndex) {
                uploadingFileList.splice(index, 1);
                return true;
            }
        })

        if (removeIndex === -1) {
            removeIndex = waitingFileList.findIndex((item, index) => {
                if (item.index === fileIndex) {
                    waitingFileList.splice(index, 1);
                    return true;
                }
            })
        }

        if (removeIndex !== -1) {
            uploadingFileMap.delete(fileIndex)
            cancelTokenSourceMap.delete(fileIndex);
        }
    }

    const clearALlFinishedUploadFile = () => {
        let deleteCount = 0;
        for (let i = uploadingFileList.length - 1; i >= 0; i--) {
            let item = uploadingFileList[i];
            if (item.status === 'finished') {
                deleteCount++;
                uploadingFileList.splice(i, 1);
                uploadingFileMap.delete(item.index)
                cancelTokenSourceMap.delete(item.index);
            }
        }
        return deleteCount;
    }

    const retryUpload = (item) => {
        console.log('[upload] 重新上传文件', item);
        removeUploadFileByIndex(item.index);
        uploadFile(item.file);
    }

    return {
        visible, uploadMode, openUploadDialog, openUploadFolderDialog, cancelUpload, dropState, listenDropFile,
        beforeUpload, uploadFile, uploadProgressInfoSorted, uploadProgressInfoStatistics,
        clearALlFinishedUploadFile, removeUploadFileByIndex, retryUpload, silentUploadFile
    }
}