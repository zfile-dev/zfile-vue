import axios from "~/http/request"

// 检测是否已初始化过
export const installStatusReq = () => {
    return axios({
        url: "/api/install/status",
        method: "get"
    })
}

// 提交初始化信息
export const installReq = (data) => {
    return axios({
        url: "/api/install",
        method: "post",
        data,
    })
}