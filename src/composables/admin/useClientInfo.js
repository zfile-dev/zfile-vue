import { getClientIpReq } from "~/api/admin/admin-setting";

export default function useClientInfo() {

  // 获取当前客户端 IP
  const clientIp = ref('');
  onBeforeMount(() => {
    getClientIpReq().then(res => {
      clientIp.value = res.data;
    });
  })

  // 获取当前浏览器 UserAgent
  const userAgent = ref(navigator.userAgent);

  return {
    clientIp, userAgent
  };

}