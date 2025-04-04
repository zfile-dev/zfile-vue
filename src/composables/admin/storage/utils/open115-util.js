import { authDeviceCodeReq, getStatusReq } from "~/api/tools/tools-115";
import { encodeData, rendererRect } from 'beautify-qrcode';

/**
 * svg 转为 src data uri
 * @param   svgText     svg 文本
 * @returns {string}    src data uri
 */
const svgToDataUri = (svgText) => {
  let xmlElement = document.createElement("xml")
  xmlElement.innerHTML = svgText;

  // 增加 svg 底色, 防止复制后是透明.
  let rectElement = document.createElement("rect")
  rectElement.setAttribute('width', '100%');
  rectElement.setAttribute('height', '100%');
  rectElement.style.fill = '#ffffff';

  xmlElement.children[0].prepend(rectElement);

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(xmlElement.innerHTML);
}

export default function useOpen115Util() {

  const qrCode = ref("");
  const qrCodeStatus = ref({
    status: "",
    errorMessage: "",
    accessToken: "",
    refreshToken: "",
  });

  const generateQrCode = (appId) => {
    authDeviceCodeReq({ appId: appId }).then(res => {
      getQrCodeStatus(res.data);

      qrCodeStatus.value.status = "waiting";

      // 生成二维码
      qrCode.value = svgToDataUri(rendererRect(encodeData({
        text: res.data.qrcode,
        correctLevel: 2,
        isSpace: false
      })))
    })
  }

  const getQrCodeStatus = (data) => {
    getStatusReq(data).then(res => {
      qrCodeStatus.value = res.data;
      if (qrCodeStatus.value.status === "scanning" || qrCodeStatus.value.status === "waiting") {
        getQrCodeStatus(data);
      }
    });
  }

  return {
    generateQrCode, qrCode, qrCodeStatus
  }
}