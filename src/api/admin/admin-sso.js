import axios from "~/http/request";
import axiosOrigin from 'axios';

export const listReq = () => {
	return axios({
		url: "/admin/sso/providers",
		method: "get"
	})
}

export const saveOrUpdateReq = (data) => {
	return axios({
		url: "/admin/sso/provider",
		method: "post",
		data
	})
}

export const deleteReq = (provider) => {
	return axios({
		url: "/admin/sso/provider/" + provider,
		method: "delete"
	})
}

export const checkProviderDuplicateReq = (data) => {
	return axios({
		url: `/admin/sso/provider/checkDuplicate`,
		method: "get",
		data
	})
}

export const getWellKnownEndpointReq = (url) => {
	return axiosOrigin.get(url, {
		withCredentials: false,
	})
}