<template>
  <div ref="el">
    <div class="float-right mb-1">
      <span>背景颜色: </span>
      <el-color-picker v-model="color" show-alpha :predefine="predefineColors" />
    </div>
    <vue3dLoader
      v-if="loadFinish"
      :key="resizeCount"
      class="h-[75vh] clear-right"
      :fileType="fileSuffix"
      :mtlPath="mtlPath"
      :backgroundColor="color"
      :filePath='fileLinkUrl'>
    </vue3dLoader>
  </div>

</template>

<script setup>
import { useResizeObserver } from '@vueuse/core'
const el = ref(null)
const resizeCount = ref(0);

useResizeObserver(el, () => {
  resizeCount.value++;
})

import { getFileNameIgnoreExt, getFileSuffix } from "~/utils";
import { vue3dLoader } from "vue-3d-loader";

import useRouterData from "~/composables/useRouterData";
let { currentPath } = useRouterData();

import useFileLink from "~/composables/file/useFileLink";
let { batchGetFilePathLink } = useFileLink();

const loadFinish = ref(false);
let mtlPath = ref();

// 组件接收的属性：
//  fileUrl:    文件下载路径
//  fileName:   文件名
const props = defineProps({
  fileUrl: String,
  fileName: String
});

onMounted(() => {
  init();
})

let fileSuffix = getFileSuffix(props.fileName);
let fileLinkUrl = ref();

const init = async () => {

	let loadPathLinkFiles = [
		{
			path: currentPath.value,
			name: props.fileName
		}
	]

  if (fileSuffix === "obj") {
    let basicName = getFileNameIgnoreExt(props.fileName);
	  loadPathLinkFiles.push({
		  path: currentPath.value,
		  name: basicName + '.mtl',
	  })
  }

	let generateLinkResult = await batchGetFilePathLink(loadPathLinkFiles);
	if (generateLinkResult) {
		fileLinkUrl.value = generateLinkResult[0];
		if (generateLinkResult.length > 1) {
			mtlPath.value = generateLinkResult[1];
		}
	} else {
		console.log('加载文件直链失败，无法预览。');
	}

  loadFinish.value = true;
}

onUnmounted(() => {
  mtlPath.value = null;
})


const color = useStorage('zfile-3d-color', '#ffffff');

const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsva(120, 40, 94, 0.5)',
  'hsl(181, 100%, 37%)',
  'hsla(209, 100%, 56%, 0.73)',
  '#c7158577',
])

</script>

<style scoped>

</style>