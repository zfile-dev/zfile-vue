import axios from "~/http/request"

// 登录
export const loginReq = (data) => {
    return axios({
        url: "/admin/login",
        method: "post",
        data
    })
}

// 获取登录验证方式
export const loginVerifyModeReq = () => {
    return axios({
        url: "/admin/login/verify-mode",
        method: "get"
    })
}

// 获取登录图片验证码
export const loginVerifyImgReq = () => {
    return axios({
        url: "/admin/login/captcha",
        method: "get"
    })
}

// 注销
export const logoutReq = () => {
    return axios({
        url: "/admin/logout",
        method: "post",
    })
}

// 检查是否已登录
export const checkLoginReq = () => {
    return axios({
        url: "/admin/login/check",
        method: "get",
    })
}