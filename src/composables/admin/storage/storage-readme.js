import { isEmpty } from "~/utils";
import {loadStorageReadmeReq, saveStorageReadmeReq} from "~/api/admin/admin-storage";

let list = ref([]);
let loading = ref(false);
import Sortable from "sortablejs";

export default function useStorageReadme(router, route) {
    let currentStorageId = route.params.storageId;

    const loadData = () => {
        loadStorageReadmeReq(currentStorageId).then((response) => {
            list.value = response.data;
            if (list.value.length === 0) {
                addItem();
            }
            setSort();
        });
    }

    const setSort = () => {
        const el = document.querySelectorAll('.el-table__body-wrapper table > tbody')[0]
        if (el) {
            Sortable.create(el, {
                filter: ".el-button",
                onEnd: e => {
                    if (e.oldIndex === e.newIndex) {
                        return;
                    }
                    const targetRow = list.value.splice(e.oldIndex, 1)[0];
                    list.value.splice(e.newIndex, 0, targetRow);
                }
            })
        }
    }

    const saveData = () => {
        let notFill = list.value.find((value) => {
            if (isEmpty(value.description) || isEmpty(value.expression) || isEmpty(value.readmeText)) {
                ElMessage.warning('请检查数据填写是否完整');
                return true;
            }
        });


        if (!notFill) {
            loading.value = true;
            for (let i = 0; i < list.value.length; i++) {
                let valueElement = list.value[i];
                valueElement.id = (i + 1);
            }
            saveStorageReadmeReq(currentStorageId, list.value).then(() => {
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
            description: '表达式 - ' + (list.value.length + 1),
            expression: '',
            readmeText: '',
            displayMode: 'top',
            storageId: currentStorageId
        });
    }

    const deleteItem = (index) => {
        list.value.splice(index, 1);
    }

    const moveUp = (index) => {
        if (index === 0) return;
        const item = list.value[index];
        list.value.splice(index, 1);
        list.value.splice(index - 1, 0, item);
    };

    const moveDown = (index) => {
        if (index === list.value.length - 1) return;
        const item = list.value[index];
        list.value.splice(index, 1);
        list.value.splice(index + 1, 0, item);
    };

    return {
        loading, loadData, list,
        addItem, deleteItem, moveUp, moveDown,
        saveData
    }
}
