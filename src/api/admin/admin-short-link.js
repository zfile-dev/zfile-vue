import axios from "~/http/request"

// 获取短链列表
export const getShortLinkListReq = (data) => {
    return axios({
        url: "/admin/link/list",
        method: "get",
        data
    })
}

// 删除短链
export const deleteShortLinkReq = (id) => {
    return axios({
        url: `/admin/link/delete/${id}`,
        method: "delete"
    })
}

// 批量删除短链
export const batchDeleteShortLinkReq = (data) => {
	return axios({
		url: `/admin/link/delete/batch`,
		method: "post",
		data
	})
}

// 批量删除过期短链
export const deleteExpireLinkReq = () => {
    return axios({
        url: `/admin/link/deleteExpireLink`,
        method: "delete"
    })
}

// 批量导出短链
export const exportShortLinkListReq = (data) => {
	return axios({
		url: "/admin/link/export",
		method: "get",
		data,
		config: {
			responseType: "blob",
			showDefaultMsg: false,
			responseIntercept: false
		}
	})
}
