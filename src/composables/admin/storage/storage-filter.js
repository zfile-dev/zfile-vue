import { isEmpty } from "~/utils";
import {loadStorageFilterReq, saveStorageFilterReq} from "~/api/admin/admin-storage";

let list = ref([]);
let loading = ref(false);

export default function useStorageFilter(router, route) {
    let currentStorageId = route.params.storageId;

    const loadData = () => {
        loadStorageFilterReq(currentStorageId).then((response) => {
            list.value = response.data;
            if (list.value.length === 0) {
                addItem();
            }
        });
    }

    const saveData = () => {
        let notFill = list.value.find((value) => {
            if (isEmpty(value.expression)) {
                ElMessage.warning('请检查数据填写是否完整');
                return true;
            }
        });

        if (!notFill) {
            loading.value = true;
            saveStorageFilterReq(currentStorageId, list.value).then(() => {
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

    const addItem = () => {
        list.value.push({
            mode: 'hidden',
            expression: '',
            storageId: currentStorageId,
            description: '表达式 - ' + list.value.length
        });
    }

    const deleteItem = (index) => {
        list.value.splice(index, 1);
    }

    return {
        loading, loadData, list,
        addItem, deleteItem,
        saveData
    }
}