import axios from "~/http/request";

export const getLoginLogListReq = (data) => {
  return axios({
    url: "/admin/login/log/list",
    method: "get",
    data
  })
}
