export default {
    tableData(state, v) {
        state.tableData = v;
    },
    updateConfig(state, v) {
        state.config = v;
    },
    currentDirectory(state, v) {
        state.currentDirectory = v;
    },
    hoverRow(state, v) {
        state.hoverRow = v;
    },
    rightClickRow(state, v) {
        state.rightClickRow = v;
    },
    appendTableData(state, v) {
        if (v) {
            state.tableData = state.tableData.concat(v);
        }
    }
}