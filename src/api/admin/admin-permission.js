import axios from "~/http/request"

// 获取权限组列表
export const getPermissionListReq = () => {
  return axios({
    url: "/admin/permission/list",
    method: "get"
  })
}
