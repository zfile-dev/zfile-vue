const state = {
    config: {},
    currentStorageStrategy: null,
    imgMode: false,
    newImgMode: false,
    oldDriveId: null
}

const mutations = {
    updateOldDriveId(state, v) {
        state.oldDriveId = v;
    },
    updateNewImgMode(state, v) {
        state.newImgMode = v;
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
    updateSearchParam(state, v) {
        state.searchParam = v;
    },
    updateCurrentStorageStrategy(state, v) {
        state.currentStorageStrategy = v;
    },
    switchImgMode(state, v) {
        state.imgMode = v;
    },
}

const getters = {
    directLinkPrefix: state => {
        return state.config && state.config.directLinkPrefix;
    },
    oldDriveId: state => {
        return state.oldDriveId;
    },
    newImgMode: state => {
        return state.newImgMode === true;
    },
    defaultSwitchToImgMode: state => {
        return state.config && state.config.defaultSwitchToImgMode;
    },
    imgMode: state => {
        return state.imgMode;
    },
    infoEnable: state => {
        return state.config && state.config.infoEnable;
    },
    showLinkBtn: state => {
        return state.config && state.config.showLinkBtn;
    },
    showShortLink: state => {
        return state.config && state.config.showShortLink;
    },
    showPathLink: state => {
        return state.config && state.config.showPathLink;
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
    debugMode: state => {
        return state.config && state.config.debugMode;
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
