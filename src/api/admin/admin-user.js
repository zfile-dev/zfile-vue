import axios from "~/http/request"

// 获取用户列表
export const getUserListReq = (data) => {
  return axios({
    url: "/admin/user/list",
    method: "get",
    data
  })
}

// 更新用户状态
export const updateUserEnableReq = (id, enable) => {
  return axios({
    url: `/admin/user/${enable ? 'enable' : 'disable'}/${id}`,
    method: "post"
  })
}

export const saveOrUpdateUserReq = (data) => {
  return axios({
    url: "/admin/user/saveOrUpdate",
    method: "post",
    data
  })
}


// 删除用户
export const deleteUserReq = (id) => {
  return axios({
    url: `/admin/user/delete/${id}`,
    method: "delete"
  })
}

// 获取用户信息
export const getUserInfoReq = (id) => {
  return axios({
    url: `/admin/user/${id}`,
    method: "get"
  })
}

// 检查用户名是否重复
export const checkUsernameDuplicateReq = (data) => {
  return axios({
    url: `/admin/user/checkDuplicate`,
    method: "get",
    data
  })
}

// 复制用户
export const copyUserReq = (data) => {
  return axios({
    url: `/admin/user/copy`,
    method: "post",
    data
  })
}