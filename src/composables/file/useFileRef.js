let tableRef = null;
export default function useFileRef(initTableRef, initRootRef) {

    if (tableRef === null && initTableRef) {
        tableRef = initTableRef;
    }

    const clearSelection = () => {
        tableRef.value.clearSelection();
    }

    const toggleRowSelection = (row, selected) => {
        if (row?.type === 'BACK') {
            return;
        }
        tableRef.value.toggleRowSelection(row, selected);
    }

    const toggleAllSelection = () => {
        tableRef.value.toggleAllSelection();
    }

    return {
        tableRef,
        clearSelection, toggleRowSelection, toggleAllSelection
    }
}