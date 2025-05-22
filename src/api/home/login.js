import axios from "~/http/request"

// 获取登录页的 SSO 列表
export const loadSsoLoginListReq = () => {
	return axios({
		url: `/api/sso/list`,
		method: "get",
	})
}