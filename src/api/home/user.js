import axios from "~/http/request"

// 登录
export const loginReq = (data) => {
    return axios({
        url: "/user/login",
        method: "post",
        data
    })
}

// 获取登录验证方式
export const loginVerifyModeReq = (username) => {
    return axios({
        url: "/user/login/verify-mode",
        method: "get",
        data: {
            username
        }
    })
}

// 获取登录图片验证码
export const loginVerifyImgReq = () => {
    return axios({
        url: "/user/login/captcha",
        method: "get"
    })
}

// 注销
export const logoutReq = () => {
    return axios({
        url: "/user/logout",
        method: "post",
    })
}

// 检查是否已登录
export const checkLoginReq = () => {
    return axios({
        url: "/user/login/check",
        method: "get",
    })
}

// 修改密码
export const updatePwdReq = (data) => {
    return axios({
        url: "/user/updatePwd",
        method: "post",
        data
    })
}

// 重置管理员密码
export const resetAdminPwdReq = (data) => {
    return axios({
        url: "/user/resetAdminPassword",
        method: "put",
        data
    })
}