import axios from "~/http/request"

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

// 获取用户存储源基目录
export const loadUserRootPathReq = (storageKey) => {
	return axios({
		url: `/api/site/config/userRootPath/${storageKey}`,
		method: "get",
	})
}

// 获取已启用的存储源列表
export const getSourceListReq = (data) => {
	return axios({
		url: "/api/storage/list",
		method: "get",
		data
	})
}

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

// 获取存储源文件详情
export const loadFileItemReq = (data) => {
    return axios({
        url: `/api/storage/file/item`,
        method: "post",
        data,
        config: {
            responseIntercept: false,
            showDefaultMsg: false
        }
    })
}

// 批量生成直链
export const batchGeneratePathLinkReq = (data) => {
	return axios({
		url: `/api/path-link/batch/generate`,
		method: "post",
		data
	})
}

// 批量生成短链
export const batchGenerateShortLinkReq = (data) => {
    return axios({
        url: `/api/short-link/batch/generate`,
        method: "post",
        data
    })
}

// 搜索存储源文件列表
export const searchFileListReq = (data) => {
    return axios({
        url: `/api/storage/search`,
        method: "post",
        data
    })
}