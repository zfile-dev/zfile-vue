import { encodeData } from 'beautify-qrcode';

export const generateQRCode = (options: Object, rendererFunc: Function) => {
  const qrcode = encodeData(options);
  return svgToDataUri(rendererFunc(qrcode));
}

const svgToDataUri = (svgText: string) => {
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