const state = {
    config: {},
    currentStorageStrategy: null
}

const mutations = {
    updateConfig(state, v) {
        debugger;
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
    updateSearchParam(state, v) {
        state.searchParam = v;
    },
    updateCurrentStorageStrategy(state, v) {
        state.currentStorageStrategy = v;
    }
}

const getters = {
    infoEnable: state => {
        return state.config && state.config.infoEnable;
    },
    tableSize: state => {
        return state.config && state.config.tableSize;
    },
    currentStorageStrategyType: state => {
        return state.currentStorageStrategy.type.key;
    },
    currentStorageStrategyId: state => {
        return state.currentStorageStrategy.id;
    },
    showOperator: state => {
        return state.config && state.config.showOperator;
    },
    showDocument: state => {
        return state.config && state.config.showDocument;
    },
    domain: state => {
        return state.config && state.config.domain;
    },
    announcement: state => {
        return state.config && state.config.announcement;
    },
    layout: state => {
        return state.config && state.config.layout;
    },
    showAnnouncement: state => {
        return state.config && state.config.showAnnouncement;
    },
    searchEnable: state => {
        return state.config && state.config.searchEnable;
    }
}

const actions = {
}

export default {
    state,
    mutations,
    getters,
    actions
}
