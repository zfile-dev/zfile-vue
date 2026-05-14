import axios from "~/http/request"

// 获取 OnlyOffice 配置文件 token
export const getOnlyOfficeConfigTokenReq = (data) => {
  return axios({
    url: `/onlyOffice/config/token`,
    method: "post",
    data
  })
}

// 获取分享 OnlyOffice 配置文件 token
export const getShareOnlyOfficeConfigTokenReq = (data) => {
  return axios({
    url: `/api/share/onlyOffice/config/token`,
    method: "post",
    data
  })
}
