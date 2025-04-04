
// 获取下载日志列表
import axios from "~/http/request";

export const getDownloadLogListReq = (data) => {
	return axios({
		url: "/admin/download/log/list",
		method: "get",
		data
	})
}

// 删除下载日志
export const deleteDownloadLogReq = (id) => {
	return axios({
		url: `/admin/download/log/delete/${id}`,
		method: "delete"
	})
}

// 批量删除下载日志
export const batchDeleteDownloadLogReq = (data) => {
	return axios({
		url: `/admin/download/log/delete/batch`,
		method: "post",
		data
	})
}

// 按条件批量删除下载日志
export const batchDeleteDownloadLogReqByQueryReq = (data) => {
	return axios({
		url: `/admin/download/log/delete/batch/query`,
		method: "post",
		data
	})
}
