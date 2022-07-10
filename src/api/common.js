import axios from "~/http/request"
import axiosOrigin  from 'axios';

// 直接获取文件内容
export const getFileTextReq = (url) => {
    return axiosOrigin.get(url, {
        withCredentials: false
    })
}

// 调用服务端接口获取文件内容
export const getFileTextFromServerReq = (data) => {
    return axios({
        url: "/api/parse/content",
        method: "get",
        data
    })
}
