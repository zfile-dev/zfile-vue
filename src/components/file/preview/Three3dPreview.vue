<template>
  <vue3dLoader
    v-if="loadFinish"
    class="h-[75vh]"
    :mtlPath="mtlPath"
    :backgroundColor="0x000000"
    :filePath='props.fileUrl'>
  </vue3dLoader>
</template>

<script setup>
let mtlPath = ref();

const loadFinish = ref(false);

// 组件接收的属性：
//  fileUrl:    文件下载路径
//  fileName:   文件名
const props = defineProps({
  fileUrl: String,
  fileName: String
});

import common from "~/common";
import { vue3dLoader } from "vue-3d-loader";
import { loadFileItemReq } from "~/api/home";
import useRouterData from "~/composables/useRouterData";
import useFilePwd from "~/composables/file/useFilePwd";
let { currentPath, storageKey } = useRouterData();
let { getPathPwd } = useFilePwd();

onMounted(() => {
  init();
})

const init = async () => {
  if (props.fileName.endsWith(".obj")) {
    let basicName = common.getFileName(props.fileName);

    let mtlPathAndName = common.removeDuplicateSeparator(`${currentPath.value}/${basicName}.mtl`);

    let mtlFileItemParam = {
      storageKey: storageKey.value,
      path: mtlPathAndName,
      password: getPathPwd()
    }

    let fileItemResult = await loadFileItemReq(mtlFileItemParam);

    if (fileItemResult?.data?.code === 0) {
      console.log('检测到当前存在 mtl 纹理文件: ' + mtlFileItemParam, fileItemResult);
      mtlPath.value = fileItemResult.data.data.url;
    }
  }
  loadFinish.value = true;
}

onUnmounted(() => {
  mtlPath.value = null;
})


</script>

<style scoped>

</style>