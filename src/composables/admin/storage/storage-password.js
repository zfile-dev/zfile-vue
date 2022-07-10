import {loadStoragePasswordReq, saveStoragePasswordReq} from "~/api/admin-storage";
import util from "~/tool/common";

let passwordList = ref([]);
let loading = ref(false);
import Sortable from "sortablejs";

export default function useStoragePassword(router, route) {
    let currentStorageId = route.params.storageId;

    const loadPasswordData = () => {
        loadStoragePasswordReq(currentStorageId).then((response) => {
            passwordList.value = response.data;
            if (passwordList.value.length === 0) {
                addPasswordItem();
            }
            setSort();
        });
    }

    const setSort = () => {
        const el = document.querySelector('.z-form-body')
        Sortable.create(el, {
            draggable: '.expression-item',
            onEnd: e => {
                if (e.oldIndex === e.newIndex) {
                    return;
                }

                const currRow = passwordList.value.splice(e.oldIndex - 1, 1)[0];
                passwordList.value.splice(e.newIndex - 1, 0, currRow)
            }
        })
    }

    const savePasswordData = () => {
        let notFill = passwordList.value.find((value) => {
            if (util.isEmpty(value.description) || util.isEmpty(value.expression) || util.isEmpty(value.password)) {
                ElMessage.warning('请检查数据填写是否完整');
                return true;
            }
        });


        if (!notFill) {
            loading.value = true;
            for (let i = 0; i < passwordList.value.length; i++) {
                let valueElement = passwordList.value[i];
                valueElement.id = (i + 1);
            }
            saveStoragePasswordReq(currentStorageId, passwordList.value).then(() => {
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

    const addPasswordItem = () => {
        passwordList.value.push({
            description: '表达式 - ' + (passwordList.value.length + 1),
            expression: '',
            password: '',
            storageId: currentStorageId
        });
    }

    const deletePasswordItem = (index) => {
        passwordList.value.splice(index, 1);
    }

    return {
        loading, loadPasswordData, passwordList,
        addPasswordItem, deletePasswordItem,
        savePasswordData
    }
}