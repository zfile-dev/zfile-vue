import {
    deleteStorageReq,
    loadStorageListReq,
    storageSortReq,
    switchCacheAutoRefreshReq,
    switchCacheEnableReq,
    switchEnableReq
} from "~/api/admin/admin-storage";
import Sortable from "sortablejs";
import { isMobile } from "~/utils";

let cacheManageVisible = ref(false);
let currentCacheManageId = ref();

let loading = ref(false);
let storageList = ref([]);
let searchKey = ref('');

import useStorageCopy from '~/composables/admin/storage/storage-copy'
const { openDialog: openCopyStorageDialog } = useStorageCopy();

export default function useStorageList(router) {

    // 添加存储源
    const addStorage = () => {
        router.push('/admin/storage-edit');
    }

    // 编辑存储源
    const editStorage = (row) => {
        router.push('/admin/storage-edit/' + row.id);
    }

    // 删除存储源
    const deleteStorage = (row) => {
        ElMessageBox.confirm('是否确认删除？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            callback: action => {
                if (action === 'confirm') {
                    deleteStorageReq(row.id).then((response) => {
                        ElMessage.success('删除成功');
                        init();
                    });
                }
            }
        });
    }

    // 响应关闭操作提示.
    const handleClose = (done) => {
        ElMessageBox.confirm('是否确认关闭？关闭后填写的数据不会保留。', {
            type: 'warning',
        }).then(_ => {
            done();
        }).catch(_ => {
        });
    }

    // 跳转到文件夹过滤设置
    const showFilterPage = (row) => {
        router.push('/admin/storage-filter/' + row.id);
    }

    // 跳转到文件夹文档设置
    const showReadmePage = (row) => {
        router.push('/admin/storage-readme/' + row.id);
    }

    // 跳转到文件夹密码设置
    const showPasswordPage = (row) => {
        router.push('/admin/storage-password/' + row.id);
    }

    // 切换存储源启用/关闭状态
    const switchEnableStatus = (row) => {
        ElMessageBox.confirm(`是否确认${row.enable ? '停用' : '启用'}存储源。`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            callback: action => {
                if (action === 'confirm') {
                    let enableStatus = row.enable ? 'disable' : 'enable';
                    switchEnableReq(row.id, enableStatus).then(() => {
                        ElMessage.success((row.enable ? '停用' : '启用')  + '成功');
                        row.enable = !row.enable;
                    })
                }
            }
        });
    }

    // 切换缓存启用/关闭状态
    const switchCacheEnableStatus = (row) => {
        let action = row.enableCache ? 'enable' : 'disable';
        switchCacheEnableReq(row.id, action).then(() => {
            ElMessage.success('修改成功');
        })
    }

    // 切换缓存启用/关闭自动刷新状态
    const switchCacheAutoRefreshStatus = (row) => {
        let action = row.autoRefreshCache ? 'start' : 'stop';
        switchCacheAutoRefreshReq(row.id, action).then(() => {
            ElMessage.success('修改成功');
        })
    }

    // 权限管理
    const showPermissionPage = (row) => {
        router.push('/admin/storage-premission/' + row.id);
    }

    // 缓存管理
    const cacheManage = (row) => {
        currentCacheManageId.value = row.id;
        cacheManageVisible.value = true;
    }

    // 响应操作指令
    const handleOperator = (command) => {
        switch (command.operator) {
            case "edit": editStorage(command.storage); break;
            case "enable": switchEnableStatus(command.storage); break;
            case "readmeManager": showReadmePage(command.storage); break;
            case "cacheManager": cacheManage(command.storage); break;
            case "filterManager": showFilterPage(command.storage); break;
            case "pwdManager":  showPasswordPage(command.storage); break;
            case "delete": deleteStorage(command.storage); break;
            case "permissionManager": showPermissionPage(command.storage); break;
            case "copy": openCopyStorageDialog(command.storage); break;
        }
    }

    // 设置可拖动排序
    const setSort = () => {
        const el = document.querySelector('.storage-container')
        Sortable.create(el, {
            draggable: '.storage-item',
            filter: '.add-storage-btn',
            delay: isMobile.value ? 300 : 0,
            onEnd: e => {
                if (e.oldIndex === e.newIndex) {
                    return;
                }

                const currRow = storageList.value.splice(e.oldIndex, 1)[0];
                storageList.value.splice(e.newIndex, 0, currRow)

                storageSortReq(storageList.value).then(() => {
                    ElMessage.success('调整排序成功');
                });
            }
        })
    }

    // 初始化
    const init = () => {
        loading.value = true;
        loadStorageListReq().then((response) => {
            storageList.value = response.data;
            setSort();
            loading.value = false;
        });
    }

    // 存储源列表计算属性, 用于显示右上角搜索框对应的搜索结果.
    const storageListSearchResult = computed(() => {
        if (searchKey.value === '') {
            return storageList.value;
        }

        // 如果名字或备注或存储源类型包含输入关键字，则作为检索结果.
        return storageList.value.filter((item) => {
            if (item.name && item.name.toLowerCase().indexOf(searchKey.value.toLowerCase()) !== -1) {
                return true;
            }
            if (item.remark && item.remark.toLowerCase().indexOf(searchKey.value.toLowerCase()) !== -1) {
                return true;
            }
            if (item.type && item.type.description.toLowerCase().indexOf(searchKey.value.toLowerCase()) !== -1) {
                return true;
            }
            if (item.type && item.type.key.toLowerCase().indexOf(searchKey.value.toLowerCase()) !== -1) {
                return true;
            }
            return false;
        });
    })


    return {
        init, loading,
        searchKey, storageListSearchResult,
        handleOperator,
        addStorage, editStorage, deleteStorage, handleClose,
        showFilterPage, showReadmePage, showPasswordPage,
        switchEnableStatus,
        cacheManageVisible, currentCacheManageId, switchCacheEnableStatus, switchCacheAutoRefreshStatus, cacheManage,
    }
}
