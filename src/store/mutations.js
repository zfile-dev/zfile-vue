export default {
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
    }
}