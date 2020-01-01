export default {
    infoEnable: state => {
        return state.config.viewConfig && state.config.viewConfig.infoEnable;
    },
    searchEnable: state => {
        return state.config.viewConfig && state.config.viewConfig.searchEnable;
    }
}