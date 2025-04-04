import axios from "~/http/request";

export const authDeviceCodeReq = (data) => {
  return axios({
    url: `/115/qrcode`,
    method: "get",
    data
  })
};

export const getStatusReq = (data) => {
  return axios({
    url: `/115/qrCodeStatus`,
    method: "post",
    data
  })
};