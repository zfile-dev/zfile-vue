import axios from "~/http/request"

// github 信息
export const githubInfoReq = () => {
    return axios({
        url: "https://api.github.com/repos/zhaojun1998/zfile/releases/latest",
        method: "get",
        config: {
            responseIntercept: false,
            withCredentials: false,
            showDefaultMsg: false
        }
    })
}

// 加载系统设置信息
export const loadConfigReq = () => {
    return axios({
        url: "/admin/config",
        method: "get",
    })
}

// 修改密码
export const updatePwdReq = (data) => {
    return axios({
        url: "/admin/config/password",
        method: "put",
        data
    })
}

// 修改站点设置
export const updateSiteSettingReq = (data) => {
    return axios({
        url: "/admin/config/site",
        method: "put",
        data
    })
}

// 修改显示设置
export const updateViewSettingReq = (data) => {
    return axios({
        url: "/admin/config/view",
        method: "put",
        data
    })
}

// 修改登录安全设置
export const updateSecuritySettingReq = (data) => {
    return axios({
        url: "/admin/config/security",
        method: "put",
        data
    })
}

// 修改直链设置
export const updateLinkSettingReq = (data) => {
    return axios({
        url: "/admin/config/link",
        method: "put",
        data
    })
}



// 生成 2FA 认证信息
export const generator2FAInfoReq = () => {
    return axios({
        url: "/admin/2fa/setup",
        method: "get"
    })
}

// 确认 2FA 认证信息
export const verify2FAInfoReq = (data) => {
    return axios({
        url: "/admin/2fa/verify",
        method: "post",
        data
    })
}


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