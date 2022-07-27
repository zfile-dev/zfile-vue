import {ElLoading} from "element-plus";
import {uploadFileReq} from "~/api/file-operator";
import axios from "axios";
import common from "~/common";
import {removeDuplicateSlashes} from "fast-glob/out/managers/patterns";

const visible = ref(false);
const uploadMode = ref('');
const uploadProgressInfo = reactive([]);
const cancelTokenSourceMap = new Map();
const uploadProgressInfoMap = new Map();
let uploadIndex = 0;

import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

import useFileData from "~/composables/file/useFileData";

import {hasDialog} from "~/composables/file/useTableOperator";

// 拖拽上传状态, true 表示正有文件拖拽悬浮在上传框上
let dropState = ref(false);


export default function useFileUpload(router, route) {

    const { currentPath, storageKey, storageConfig } = useFileData(router, route);

    // 监听文件拖拽上传事件
    const listenDropFile = (dropArea) => {
        // 拖拽进入, 显示提示.
        dropArea = document.querySelector('body');

        const dropOrPasteUpload = (e) => {
            // 关闭提示
            removeDragClass();
            dropState.value = false;

            if (hasDialog()) {
                return;
            }


            if (!storageKey.value) {
                return;
            }

            if (visible.value) {
                return;
            }

            // 如果不允许文件操作，直接返回.
            if (storageConfig.value.enableFileOperator === false) {
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

            getFilesByDataTransferItemList(items).then((fileList) => {
                // 关闭 loading
                nextTick(() => {
                    // Loading should be closed asynchronously
                    loadingInstance.close()
                })

                if (fileList.length === 0) {
                    return;
                }

                // 检测出上传文件中包含隐藏文件的索引
                let hiddenFileIndexArray = [];

                fileList.forEach((item, index) => {
                    if (item.name === '.DS_Store') {
                        hiddenFileIndexArray.push(index);
                    }
                })

                const uploadFile = () => {
                    visible.value = true;
                    fileList.forEach((item) => {
                        beforeUpload({
                            file: item
                        });
                    })
                }

                if (hiddenFileIndexArray.length > 0) {
                    ElMessageBox.confirm(`检测到有 ${hiddenFileIndexArray.length} 个 .DS_Store 文件，是否上传时跳过这些文件`, '提示', {
                        confirmButtonText: '跳过这些文件',
                        cancelButtonText: '依旧上传',
                        type: 'success',
                        callback: (action) => {
                            if (action === 'confirm') {
                                for (let i = hiddenFileIndexArray.length - 1; i >= 0; i--) {
                                    let index = hiddenFileIndexArray[i];
                                    fileList.splice(index, 1);
                                }
                            }
                            uploadFile();
                        }
                    });
                } else {
                    // 上传文件过多时，提示.
                    if (fileList.length > 100) {
                        ElMessageBox.confirm(`文件数量为 ${fileList.length} 个，是否确认上传？`, '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'success',
                            callback: (action) => {
                                if (action === 'confirm') {
                                    uploadFile();
                                }
                            }
                        });
                    } else {
                        uploadFile();
                    }
                }

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
            if (storageConfig.value.enableFileOperator === false) {
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
            if (storageConfig.value.enableFileOperator === false) {
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
            if (storageConfig.value.enableFileOperator === false) {
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
                    } else if (e.getAsEntry) {
                        item = e.getAsEntry();
                    } else {
                        ElMessage.warning("浏览器不支持拖拽上传");
                        return;
                    }
                    DirectoryEntryList.push(item);
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

    const uploadFile = (file) => {
        let uploadToPath = currentPath.value;

        // 如果包含 webkitRelativePath, 则表示是文件夹上传, 需要获取文件完整路径
        if (file.webkitRelativePath || file.dropUploadPath) {
            let pathList = (file.webkitRelativePath || file.dropUploadPath).split('/');
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
            path: removeDuplicateSlashes(uploadToPath),
            name: file.name,
            size: file.size
        }

        uploadFileReq(param).then((res) => {
            const fileIndex = uploadIndex++;
            let uploadFileInfo = {
                name: file.name,
                size: file.size,
                speed: '-',
                progress: 0,
                loaded: 0,
                status: 'uploading',
                startTime: Date.now(),
                index: fileIndex
            }
            uploadProgressInfo.push(uploadFileInfo);
            cancelTokenSourceMap.set(fileIndex, axios.CancelToken.source());
            uploadProgressInfoMap.set(fileIndex, uploadProgressInfo[uploadProgressInfo.length - 1]);

            const { on } = useEventBus(`cancel-upload-${fileIndex}`);
            on(() => {
                let cancelTokenSource = cancelTokenSourceMap.get(fileIndex);
                if (cancelTokenSource) {
                    cancelTokenSource.cancel();
                    uploadProgressInfo.find((item, index) => {
                        let b = item.name === file.name;
                        if (b) {
                            uploadProgressInfo.splice(index, 1);
                        }
                        return b;
                    });
                }
            });


            let proxyUploadType = ['local', 'webdav', 'ftp', 'sftp'];
            let s3UploadType = ['s3', 'tencent', 'aliyun', 'qiniu', 'minio', 'huawei'];
            let onedriveUploadType = ['sharepoint', 'sharepoint-china', 'onedrive', 'onedrive-china'];

            if (proxyUploadType.includes(fileDataStore.currentStorageSource.type.key)) {
                fileProxyUpload(file, res.data, fileIndex);
            } else if (s3UploadType.includes(fileDataStore.currentStorageSource.type.key)) {
                s3FileUpload(file, res.data, fileIndex);
            } else if (onedriveUploadType.includes(fileDataStore.currentStorageSource.type.key)) {
                onedriveUpload(file, res.data, fileIndex);
            } else if (fileDataStore.currentStorageSource.type.key === 'upyun') {
                upyunFileUpload(file, res.data, fileIndex);
            }
        })
    }

    const fileProxyUpload = (file, uploadUrl, fileIndex) => {
        let formData = new FormData();
        formData.append("file", file);
        axios.post(uploadUrl, formData, {
            cancelToken: cancelTokenSourceMap.get(fileIndex).token,
            onUploadProgress: (progressEvent) => {
                baseOnUploadProgress(progressEvent, fileIndex);
            }
        });
    }

    const s3FileUpload = (file, uploadUrl, fileIndex) => {
        axios.put(uploadUrl, file, {
            withCredentials: false,
            cancelToken: cancelTokenSourceMap.get(fileIndex).token,
            onUploadProgress: (progressEvent) => {
                baseOnUploadProgress(progressEvent, fileIndex);
            }
        });
    }

    const baseOnUploadProgress = (progressEvent, fileIndex) => {
        let uploadFileInfo = uploadProgressInfoMap.get(fileIndex);
        uploadFileInfo.size = progressEvent.total;
        uploadFileInfo.loaded = progressEvent.loaded;
        uploadFileInfo.progress = Math.round(progressEvent.loaded / progressEvent.total * 100);
        uploadFileInfo.speed = common.fileSizeFormat(Math.round(progressEvent.loaded / (Date.now() - uploadFileInfo.startTime) * 1000));
        if (uploadFileInfo.progress === 100) {
            uploadFileInfo.status = 'finished';
            uploadFileInfo.endTime = Date.now();
        }
    }

    const onedriveUpload = (file, uploadUrl, fileIndex) => {
        let index = 1;  // 当前块数
        let start = 0;  // 开始字节数
        let end = 0;    // 结束字节数
        let fileSize = file.size;           // 文件大小
        const MAX_FILE_SIZE = 104857599;    // 每块大小 100M
        let chunks = Math.ceil(fileSize / MAX_FILE_SIZE);  // 块的个数

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
                cancelToken: cancelTokenSourceMap.get(fileIndex).token,
                timeout: 10000000,
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Range': `bytes ${start}-${end - 1}/${file.size}`
                },
                type: 'sync',
                withCredentials: false,
                onUploadProgress: progressEvent => {
                    if (progressEvent.lengthComputable) {
                        let uploadFileInfo = uploadProgressInfoMap.get(fileIndex);

                        const realLoaded = progressEvent.loaded + start;

                        uploadFileInfo.size = fileSize;
                        uploadFileInfo.loaded = realLoaded;
                        uploadFileInfo.progress = Math.round(realLoaded / fileSize * 100);
                        uploadFileInfo.speed = common.fileSizeFormat(Math.round(realLoaded / (Date.now() - uploadFileInfo.startTime) * 1000));
                        if (uploadFileInfo.progress === 100) {
                            uploadFileInfo.status = 'finished';
                            uploadFileInfo.endTime = Date.now();
                        }
                    }
                }
            }).then((response) => {
                if (response.status === 202) {
                    start += MAX_FILE_SIZE;
                    index += 1;
                    uploadBlock();
                } else if (response.status === 201) {
                    // console.log('file upload full success.', start, end);
                }
            }).catch((e) => {
            });
        }

        uploadBlock();
    }

    const upyunFileUpload = (file, uploadUrl, fileIndex) => {
        let uploadInfo = JSON.parse(uploadUrl);
        let formData = new FormData();
        formData.append('name', file.name);
        formData.append("authorization", uploadInfo.signature);
        formData.append("policy", uploadInfo.policy);
        formData.append("file", file);

        axios.post(uploadInfo.url, formData, {
            withCredentials: false,
            cancelToken: cancelTokenSourceMap.get(fileIndex).token,
            onUploadProgress: (progressEvent) => {
                baseOnUploadProgress(progressEvent, fileIndex);
            }
        });
    }

    const uploadProgressInfoStatistics = computed(() => {
        let totalSize = uploadProgressInfo.length;
        let totalUploading = 0;
        let totalFinish = 0;
        uploadProgressInfo.forEach((item) => {
            if (item.status === 'uploading') {
                totalUploading++;
            } else if (item.status === 'finished') {
                totalFinish++;
            }
        })

        return {
            totalSize,
            totalUploading,
            totalFinish
        };
    })

    const uploadProgressInfoSorted = computed(() => {
        return uploadProgressInfo.sort((a, b) => {
            let aIsUploading = a.status === 'uploading';
            let bIsUploading = b.status === 'uploading';

            // 如果未上传完成, 则按照上传时间排序.
            if (!aIsUploading && !bIsUploading) {
                return a.startTime - b.startTime;
            }

            if (aIsUploading && !bIsUploading) {
                return -1;
            }

            if (!aIsUploading && bIsUploading) {
                return 1;
            }

            // 如果都上传完成，则先结束的在上面
            if (aIsUploading && bIsUploading) {
                return a.endTime - b.endTime;
            }
        })
    })

    const beforeUpload = (param) => {
        let findResult = fileDataStore.fileList.find((value) => {
            if (value.name === param.file.name) {
                return value;
            }
        })

        if (findResult) {
            ElNotification({
                zIndex: 9999,
                title: '提示',
                message: `当前目录已存在文件 ${findResult.name}, 跳过上传.`,
                type: 'warning',
            })
            return;
        }

        uploadFile(param.file);
    }

    const cancelUpload = (item) => {
        ElMessageBox.confirm(`是否确定取消文件 ${item.name} 上传？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '返回',
            type: 'warning',
            callback: action => {
                if (action === 'confirm') {
                    useEventBus(`cancel-upload-${item.index}`).emit();
                }
            }
        });
    }

    return {
        visible, uploadMode, openUploadDialog, openUploadFolderDialog, cancelUpload, dropState, listenDropFile,
        beforeUpload, uploadFile, uploadProgressInfoSorted, uploadProgressInfoStatistics
    }
}