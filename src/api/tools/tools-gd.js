// 加载 gd 驱动器列表 请求
import axios from "~/http/request";

export const loadGDDrivesReq = (data) => {
  return axios({
    url: `/gd/drives`,
    method: "post",
    data,
    config: {
      showDefaultMsg: false
    }
  })
}