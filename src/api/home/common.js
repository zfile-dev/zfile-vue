import axiosOrigin from 'axios';

// 直接获取文件内容
export const getFileTextReq = (url, responseType) => {
    return axiosOrigin.get(url, {
        withCredentials: false,
        responseType: responseType || 'blob'
    })
}
