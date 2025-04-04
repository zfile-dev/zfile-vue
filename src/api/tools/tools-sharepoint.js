import axios from "~/http/request"

// 加载 SharePoint Sites 请求
export const loadSharePointSitesReq = (data) => {
    return axios({
        url: `/sharepoint/getSites`,
        method: "post",
        data
    })
}

// 保存存储源过滤参数
export const loadSharePointSiteListsReq = (data) => {
    return axios({
        url: `/sharepoint/getSiteLists`,
        method: "post",
        data
    })
}
