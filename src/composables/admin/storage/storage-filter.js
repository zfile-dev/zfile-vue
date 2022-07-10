import {loadStorageFilterReq, saveStorageFilterReq} from "~/api/admin-storage";
import util from "~/tool/common";

let filterList = ref([]);
let loading = ref(false);

export default function useStorageFilter(router, route) {
    let currentStorageId = route.params.storageId;

    const loadFilterData = () => {
        loadStorageFilterReq(currentStorageId).then((response) => {
            filterList.value = response.data;
            if (filterList.value.length === 0) {
                addFilterItem();
            }
        });
    }

    const saveFilterData = () => {

        let notFill = filterList.value.find((value) => {
            if (util.isEmpty(value.expression)) {
                ElMessage.warning('请检查数据填写是否完整');
                return true;
            }
        });

        if (!notFill) {
            loading.value = true;
            saveStorageFilterReq(currentStorageId, filterList.value).then(() => {
                ElMessageBox.confirm('保存成功, 是否返回存储源列表？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'success',
                    callback: action => {
                        if (action === 'confirm') {
                            router.push('/admin/storage-list');
                        }
                    }
                });
            }).finally(() => {
                loading.value = false;
            });
        }
    }

    const addFilterItem = () => {
        filterList.value.push({
            mode: 'hidden',
            expression: '',
            storageId: currentStorageId,
            description: '表达式 - ' + filterList.value.length
        });
    }

    const deleteFilterItem = (index) => {
        filterList.value.splice(index, 1);
    }

    return {
        loading, loadFilterData, filterList,
        addFilterItem, deleteFilterItem,
        saveFilterData
    }
}