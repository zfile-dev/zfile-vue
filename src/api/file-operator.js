import axios from "~/http/request"

// 新建文件夹
export const newFolderReq = (data) => {
    return axios({
        url: `/api/file/operator/mkdir`,
        method: "post",
        data
    })

}
// 批量删除文件/文件夹
export const batchDeleteReq = (data) => {
    return axios({
        url: `/api/file/operator/delete/batch`,
        method: "post",
        data
    })
}


// 重命名文件
export const renameFileReq = (data) => {
    return axios({
        url: `/api/file/operator/rename/file`,
        method: "post",
        data
    })
}

// 重命名文件夹
export const renameFolderReq = (data) => {
    return axios({
        url: `/api/file/operator/rename/folder`,
        method: "post",
        data
    })
}

// 获取文件上传链接
export const uploadFileReq = (data) => {
    return axios({
        url: `/api/file/operator/upload/file`,
        method: "post",
        data
    })
}