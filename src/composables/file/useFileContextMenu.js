import "v-contextmenu/dist/themes/default.css";
import useFileData from "~/composables/file/useFileData";

import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

import useFileRef from "~/composables/file/useFileRef";
const { clearSelection, toggleRowSelection } = useFileRef();

const visible = ref(false);

export default function useFileContextMenu(router, route, currentInstance) {

    const { storageKey, selectRows } = useFileData(router, route);

    const showMenu = (row, column, event) => {

        if (row.type === 'BACK') {
            return;
        }

        let contextmenuRef = currentInstance.proxy.$refs.contextmenu;

        if (!storageKey.value) {
            return;
        }

        fileDataStore.updateCurrentRightClickRow(row);

        if (!selectRows.value.includes(row)) {
            clearSelection();
            toggleRowSelection(row, true);
        }

        event.preventDefault();
        contextmenuRef.show({
            top: event.clientY,
            left: event.clientX
        });
        visible.value = true;

        window.onclick = () => {
            contextmenuRef.hide();
            visible.value = false;
        };

        contextmenuRef.$el.hidden = false;
    }

    return {
        showMenu, visible
    }
}