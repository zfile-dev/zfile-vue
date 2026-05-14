<template>
  <div class="zfile-office-viewer">
    <div id="office-body"></div>
  </div>
</template>

<script setup>
import useStorageConfigStore from "~/stores/storage-config";
import { getOnlyOfficeConfigTokenReq, getShareOnlyOfficeConfigTokenReq } from "~/api/home/only-office.js";
import useRouterData from "~/composables/useRouterData";
import { concatPath } from "~/utils";
import useFilePwd from "~/composables/file/useFilePwd";
import useFileDataStore from "~/stores/file-data";
import useShareData from "~/composables/share/useShareData";

let { getPathPwd } = useFilePwd();
let { sharePassword } = useShareData();
let storageConfigStore = useStorageConfigStore();
let fileDataStore = useFileDataStore();

let { storageKey, currentPath, routeRef } = useRouterData();

// 组件接收的属性：
//  fileName:   文件名
const props = defineProps({
  fileName: String
});

// 优先使用当前点击行的路径, 兜底取路由中的当前目录, 避免分享场景下 currentPath 失效
const resolveFilePathAndName = () => {
  const rowPath = fileDataStore.currentClickRow?.path;
  if (rowPath) {
    return concatPath(rowPath, props.fileName);
  }
  return concatPath(currentPath.value, props.fileName);
}

// 分享路由下走分享接口, 否则走普通接口
const resolveOfficeFileInfo = () => {
  const filePathAndName = resolveFilePathAndName();
  const shareKey = routeRef.value?.params?.shareKey;
  if (shareKey) {
    return {
      isShare: true,
      payload: {
        shareKey,
        path: filePathAndName,
        sharePassword: sharePassword?.value || routeRef.value?.query?.pwd || ''
      }
    }
  }
  return {
    isShare: false,
    payload: {
      storageKey: storageKey.value,
      path: filePathAndName,
      password: getPathPwd()
    }
  }
}

onMounted(() => {
  loadScript(`${storageConfigStore.globalConfig.onlyOfficeUrl}/web-apps/apps/api/documents/api.js`, () => {
    const fileInfo = resolveOfficeFileInfo();
    const request = fileInfo.isShare
      ? getShareOnlyOfficeConfigTokenReq(fileInfo.payload)
      : getOnlyOfficeConfigTokenReq(fileInfo.payload);

    request.then(res => {
      let jsonObj = res.data;
      const docEditor = new DocsAPI.DocEditor("office-body", jsonObj);
    })
  })
})


function loadScript(src, callback) {
  let script = document.createElement('script'),
      head = document.getElementsByTagName('head')[0];
  script.type = 'text/javascript';
  script.charset = 'UTF-8';
  script.src = src;
  if (script.addEventListener) {
    script.addEventListener('load', function () {
      callback();
    }, false);
    script.addEventListener('error', function () {
      ElMessage.warning("调用在线文档服务失败，请检查在线文档服务是否正常");
    }, false);
  } else if (script.attachEvent) {
    script.attachEvent('onreadystatechange', function () {
      var target = window.event.srcElement;
      if (target.readyState === 'loaded') {
        callback();
      }
    });
  }
  head.appendChild(script);
}
</script>

<style scoped>

.zfile-office-viewer, #office-body {
  height: 100%;
  width: 100%;
}
</style>
