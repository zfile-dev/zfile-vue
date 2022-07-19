<template>
	<div class="content">
		<div class="dialog-scroll markdown-body" v-html="markdownHtml"></div>
	</div>
</template>

<script setup>
import {marked} from 'marked';
import 'github-markdown-css';
import {computed, onMounted, ref} from "vue";

import {getFileTextFromServerReq, getFileTextReq} from "~/api/common";

let props = defineProps({
	fileUrl: String,
	fileName: String
});

const fileContent = ref('');

onMounted(() => {
	let fileUrl = props.fileUrl;
	getFileTextReq(fileUrl).then((res) => {
		fileContent.value = res.data;
	}).catch((e) => {
		console.log(`默认加载文本文件: [${props.fileName}] - [${props.fileUrl}] 失败, 尝试从服务端加载.`, e);
		getFileTextFromServerReq({url: fileUrl}).then((res) => {
			fileContent.value = res.data;
		}).catch((e) => {
			console.log(`从服务器端加载文本文件: [${props.fileName}] - [${props.fileUrl}] 失败.`, e);
			alert('加载文件预览器失败，请检测文件下载链接是否正常');
		})
	});
})

let markdownHtml = computed(() => {
	// url 新窗口打开.
	let renderer = new marked.Renderer();
	renderer.link = function() {
		let link = marked.Renderer.prototype.link.apply(this, arguments);
		return link.replace("<a","<a target='_blank'");
	};
	marked.setOptions({
		renderer: renderer
	});

	return marked(fileContent.value);

	// return marked(fileContent, {
	// 	// highlight: function(code) {
	// 	// 	return hljs.highlightAuto(code).value;
	// 	// }
	// });
})

</script>

<style scoped>
.content {
  padding: 10px 20px;
}
.content >>> img {
	max-height: 150vh;
	max-width: 150vh;
	vertical-align: middle;
}

.content .markdown-body >>> pre {
	margin-right: 20px;
}

.dialog-scroll {
	height: calc(80vh);
	overflow-y: auto;
	overflow-x: hidden;
	margin: 0;
}
</style>