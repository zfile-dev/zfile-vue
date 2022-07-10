import axios from "~/http/request"

// 获取存储源文件列表
export const loadFileListReq = (data) => {
    return axios({
        url: `/api/storage/files`,
        method: "post",
        data,
        config: {
            showDefaultMsg: false
        }
    })
}


// 获取全局站点设置
export const loadGlobalSiteConfigReq = () => {
    return axios({
        url: `/api/site/config/global`,
        method: "get",
    })
}

// 获取存储源设置
export const loadStorageConfigReq = (data) => {
    return axios({
        url: `/api/site/config/storage`,
        method: "post",
        data
    })
}

// 生成短链
export const shortLinkReq = (data) => {
    return axios({
        url: `/api/short-link`,
        method: "get",
        data
    })
}