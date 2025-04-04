<template>
  <div class="zfile-office-viewer">
    <div id="office-body"></div>
  </div>
</template>

<script setup>
import useStorageConfigStore from "~/stores/storage-config";
import { getOnlyOfficeConfigTokenReq } from "~/api/home/only-office.js";
import useRouterData from "~/composables/useRouterData";
import { concatPath } from "~/utils";
import useFilePwd from "~/composables/file/useFilePwd";
let { getPathPwd } = useFilePwd();
let storageConfigStore = useStorageConfigStore();

let { storageKey, currentPath } = useRouterData();

// 组件接收的属性：
//  fileName:   文件名
const props = defineProps({
  fileName: String
});

onMounted(() => {
  loadScript(`${storageConfigStore.globalConfig.onlyOfficeUrl}/web-apps/apps/api/documents/api.js`, () => {
    let filePathAndName = concatPath(currentPath.value, props.fileName);

    let fileInfo = {
      storageKey: storageKey.value,
      path: filePathAndName,
      password: getPathPwd()
    }

    getOnlyOfficeConfigTokenReq(fileInfo).then(res => {
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
