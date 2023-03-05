import "v-contextmenu/dist/themes/default.css";

import useFileSelect from "~/composables/file/useFileSelect";
const { selectRows, clearSelection, toggleRowSelection } = useFileSelect();

import useRouterData from "~/composables/useRouterData";
let { storageKey } = useRouterData();

import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

const contextMenuTargetFile = ref(false);
const contextMenuTargetBlank = ref(false);

let contextmenuRef;

export default function useFileContextMenu() {

    const showFileMenu = (row, column, event) => {
        if (!storageKey.value) {
            return;
        }

        // 如果右键的不是空白区域，则不显示菜单
        if (row instanceof Event) {
            event = row;
            let parentDom = document.querySelector(".zfile-index-body-wrapper");
            let ignoreDom = document.querySelector(".el-dialog");
            if (!parentDom.contains(event.target) || ignoreDom?.contains(event.target)) {
                return;
            }
            contextMenuTargetBlank.value = true;
        } else {
            if (row.type === 'BACK') {
                return;
            }
            fileDataStore.updateCurrentRightClickRow(row);

            if (!selectRows.value.includes(row)) {
                clearSelection();
                toggleRowSelection(row, true);
            }
            contextMenuTargetFile.value = true;
        }

        let contextmenuRef = currentInstance.proxy.$refs.contextmenu;

        event.preventDefault();
        event.stopPropagation();

        contextmenuRef.show({
            top: event.clientY,
            left: event.clientX
        });

        window.onclick = () => {
            contextmenuRef.hide();
            contextMenuTargetBlank.value = false;
            contextMenuTargetFile.value = false;
        };

        contextmenuRef.$el.hidden = false;
    }

    const initContextMenu = (ref) => {
        contextmenuRef = ref.value;
    }

    return {
        initContextMenu, showFileMenu, contextMenuTargetFile, contextMenuTargetBlank
    }
}