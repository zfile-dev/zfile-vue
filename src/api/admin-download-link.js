import axios from "~/http/request"

// 获取短链列表
export const getShortLinkList = (data) => {
    return axios({
        url: "/admin/link/list",
        method: "get",
        data
    })
}


// 删除短链
export const deleteShortLink = (id) => {
    return axios({
        url: `/admin/link/delete/${id}`,
        method: "delete"
    })
}

// 批量删除短链
export const batchDeleteShortLink = (data) => {
    return axios({
        url: `/admin/link/delete/batch`,
        method: "post",
        data
    })
}



// 获取下载日志列表
export const getDownloadLogList = (data) => {
    return axios({
        url: "/admin/download/log/list",
        method: "get",
        data
    })
}

// 删除下载日志
export const deleteDownloadLog = (id) => {
    return axios({
        url: `/admin/download/log/delete/${id}`,
        method: "delete"
    })
}

// 批量删除下载日志
export const batchDeleteDownloadLog = (data) => {
    return axios({
        url: `/admin/download/log/delete/batch`,
        method: "post",
        data
    })
}