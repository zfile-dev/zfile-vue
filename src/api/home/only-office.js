import axios from "~/http/request"

// 获取 OnlyOffice 配置文件 token
export const getOnlyOfficeConfigTokenReq = (data) => {
  return axios({
    url: `/onlyOffice/config/token`,
    method: "post",
    data
  })
}
