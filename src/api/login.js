import axios from "~/http/request"

// 登陆
export const loginReq = (data) => {
    return axios({
        url: "/admin/login",
        method: "post",
        data
    })
}

// 获取登陆验证方式
export const loginVerifyModeReq = () => {
    return axios({
        url: "/admin/login/verify-mode",
        method: "get"
    })
}

// 获取登陆图片验证码
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

// 检查是否已登陆
export const checkLoginReq = () => {
    return axios({
        url: "/admin/login/check",
        method: "get",
    })
}