import common from "../common";

export default {
    infoEnable: state => {
        return state.config && state.config.infoEnable;
    },
    tableSize: state => {
        return state.config && state.config.tableSize;
    },
    storageStrategy: state => {
        return state.config && state.config.storageStrategy;
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
    },
    tableData: state => {
        let tableData = state.tableData;
        tableData.forEach((item) => {
            if (!item.icon) {
                item['icon'] = common.getFileIconName(item);
            }
        });
        return tableData;
    },
    filterFileByType: (state) => (type) => {
        return state.tableData.filter(function (item) {
            if (item.type === 'BACK') {
                return false
            }
            let name = item.name;
            let suffix = name.substr(name.lastIndexOf('.') + 1).toLowerCase();
            return common.constant.fileTypeMap[type].indexOf(suffix) !== -1;
        });
    }
}