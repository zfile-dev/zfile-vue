<template>
	<div class="content">
		<div class="dialog-scroll markdown-body" v-html="markdownHtml"></div>
	</div>
</template>

<script setup>
import {marked} from 'marked';
import { computed, onMounted, onUpdated, ref } from "vue";
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import 'github-markdown-css';


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

	return marked(fileContent.value, {
		highlight: function(code) {
			return hljs.highlightAuto(code).value;
		}
	});
})

import CodeCopy from '~/components/file/preview/CopyCode.vue';
import { createVNode, render } from "vue";

onUpdated(() => {
  document.querySelectorAll('pre').forEach(el => {
    if (el.classList.contains('code-copy-added')) return
    //   https://cn.vuejs.org/v2/api/index.html#Vue-extend
    /* 使用基础 Vue 构造器，创建一个“子类”。参数是一个包含组件选项的对象 */

    let codeCopyVNode = createVNode(CodeCopy, {
      code: el.innerText,
    });
    let mountNode = document.createElement("div");
    render(codeCopyVNode, mountNode);
    el.classList.add('code-copy-added')
    el.classList.add('hljs')
    el.appendChild(mountNode)
  })
})

</script>

<style scoped>
.content {
  padding: 10px 20px;
}

.content .markdown-body >>> pre {
	margin-right: 20px;
}


.content .markdown-body >>> pre:hover .copy-btn {
  opacity: 1;
}

.dialog-scroll {
	height: calc(80vh);
	overflow-y: auto;
	overflow-x: hidden;
	margin: 0;
}

.content >>> .code-copy-added {
  position: relative;
}
</style>