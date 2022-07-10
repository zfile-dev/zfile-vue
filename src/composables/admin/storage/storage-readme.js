import {loadStorageReadmeReq, saveStorageReadmeReq} from "~/api/admin-storage";
import util from "~/tool/common";

let readmeList = ref([]);
let loading = ref(false);
import Sortable from "sortablejs";

export default function useStorageReadme(router, route) {
    let currentStorageId = route.params.storageId;

    const loadReadmeData = () => {
        loadStorageReadmeReq(currentStorageId).then((response) => {
            readmeList.value = response.data;
            if (readmeList.value.length === 0) {
                addReadmeItem();
            }
            setSort();
        });
    }

    const setSort = () => {
        const el = document.querySelector('.z-form-body')
        Sortable.create(el, {
            draggable: '.expression-item',
            filter: ".el-button, .editor-input",
            onEnd: e => {
                if (e.oldIndex === e.newIndex) {
                    return;
                }

                const currRow = readmeList.value.splice(e.oldIndex - 1, 1)[0];
                readmeList.value.splice(e.newIndex - 1, 0, currRow)
            }
        })
    }

    const saveReadmeData = () => {
        let notFill = readmeList.value.find((value) => {
            if (util.isEmpty(value.description) || util.isEmpty(value.expression) || util.isEmpty(value.readmeText)) {
                ElMessage.warning('请检查数据填写是否完整');
                return true;
            }
        });


        if (!notFill) {
            loading.value = true;
            for (let i = 0; i < readmeList.value.length; i++) {
                let valueElement = readmeList.value[i];
                valueElement.id = (i + 1);
            }
            saveStorageReadmeReq(currentStorageId, readmeList.value).then(() => {
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

    const addReadmeItem = () => {
        readmeList.value.push({
            description: '表达式 - ' + (readmeList.value.length + 1),
            expression: '',
            readmeText: '',
            displayMode: 'top',
            storageId: currentStorageId
        });
    }

    const deleteReadmeItem = (index) => {
        readmeList.value.splice(index, 1);
    }

    return {
        loading, loadReadmeData, readmeList,
        addReadmeItem, deleteReadmeItem,
        saveReadmeData
    }
}