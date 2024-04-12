<template>
  <div class="zfile-office-viewer">
    <div id="office-body"></div>
  </div>
</template>

<script setup>
import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

// 组件接收的属性：
//  fileUrl:    文件下载路径
//  fileName:   文件名
const props = defineProps({
  fileUrl: String,
  fileName: String
});

onMounted(() => {
  loadScript(`${storageConfigStore.globalConfig.onlyOfficeUrl}/web-apps/apps/api/documents/api.js`, () => {
    const index = props.fileName.lastIndexOf('.');
    const fileType = props.fileName.substr(index + 1);
    const config = {
      "document": {
        "fileType": fileType,
        "title": props.fileName,
        "url": props.fileUrl,
        "lang": "zh-CN"
      },
      "width": '100%',
      "editorConfig": {
        mode: 'view',
        "lang": "zh-CN",
        "user": { "name": "匿名" },
      }
    };
    const docEditor = new DocsAPI.DocEditor("office-body", config);
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
