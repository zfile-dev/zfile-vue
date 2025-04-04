import axios from "~/http/request";

// 生成 2FA 认证信息
export const generator2FAInfoReq = () => {
	return axios({
		url: "/admin/2fa/setup",
		method: "get"
	})
}

// 确认 2FA 认证信息
export const verify2FAInfoReq = (data) => {
	return axios({
		url: "/admin/2fa/verify",
		method: "post",
		data
	})
}
