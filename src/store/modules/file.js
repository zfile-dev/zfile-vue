import common from "@/common";

const state = {
    tableData: [],
    currentDirectory: {},
    hoverRow: {},
    rightClickRow: {},
    searchParam: ""
}

const mutations = {
    tableData(state, v) {
        state.tableData = v;
    },
    appendTableData(state, v) {
        if (v) {
            state.tableData = state.tableData.concat(v);
        }
    },
}

const getters = {
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

const actions = {
}

export default {
    state,
    mutations,
    getters,
    actions
}
