import axios from "~/http/request"

// 加载系统设置信息
export const loadConfigReq = () => {
    return axios({
        url: "/admin/config",
        method: "get",
    })
}



// ------------------站点设置------------------
export const updateSiteSettingReq = (data) => {
    return axios({
        url: "/admin/config/site",
        method: "put",
        data
    })
}

export const getServerAddressReq = () => {
	return axios({
		url: "/admin/serverAddress",
		method: "get",
		config: {
			showDefaultMsg: false,
		}
	})
}

// ------------------显示设置------------------
export const updateViewSettingReq = (data) => {
    return axios({
        url: "/admin/config/view",
        method: "put",
        data
    })
}

// ------------------直链设置------------------
export const getClientIpReq = () => {
	return axios({
		url: "/admin/clientIp",
		method: "get",
		config: {
			showDefaultMsg: false,
		}
	})
}

export const testRuleMatcherReq = (data) => {
	return axios({
		url: "/admin/rule-test",
		method: "post",
		data: data
	})
}

export const getLinkLimitInfoReq = (data) => {
	return axios({
		url: "/admin/link/limit/info",
		method: "get",
		data: data
	})
}

export const updateLinkSettingReq = (data) => {
	return axios({
		url: "/admin/config/link",
		method: "put",
		data
	})
}



// ------------------安全设置------------------
export const updateSecuritySettingReq = (data) => {
    return axios({
        url: "/admin/config/security",
        method: "put",
        data
    })
}



// ------------------访问控制------------------
export const updateAccessSettingReq = (data) => {
    return axios({
        url: "/admin/config/access",
        method: "put",
        data
    })
}



// ------------------系统日志下载------------------
export const downloadLogReq = () => {
    return axios({
        url: "/admin/log/download",
        method: "get",
        config: {
            responseType: "blob",
            showDefaultMsg: false,
            responseIntercept: false
        }
    })
}