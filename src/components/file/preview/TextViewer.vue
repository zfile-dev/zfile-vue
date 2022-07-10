<template>
	<div class="editor" id="zfile-monaco-editor"/>
</template>

<script setup>
import {onMounted, ref, onUnmounted} from 'vue';

// import * as monaco from 'monaco-editor';
// 按需加载核心 api
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
// 按需加载语法高亮
import 'monaco-editor/esm/vs/basic-languages/html/html.contribution'
import 'monaco-editor/esm/vs/basic-languages/css/css.contribution'
import 'monaco-editor/esm/vs/basic-languages/scss/scss.contribution'
import 'monaco-editor/esm/vs/basic-languages/dockerfile/dockerfile.contribution'
import 'monaco-editor/esm/vs/basic-languages/go/go.contribution'
import 'monaco-editor/esm/vs/basic-languages/graphql/graphql.contribution'
import 'monaco-editor/esm/vs/basic-languages/ini/ini.contribution'
import 'monaco-editor/esm/vs/basic-languages/java/java.contribution'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
import 'monaco-editor/esm/vs/basic-languages/kotlin/kotlin.contribution'
import 'monaco-editor/esm/vs/basic-languages/less/less.contribution'
import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution'
import 'monaco-editor/esm/vs/basic-languages/mysql/mysql.contribution'
import 'monaco-editor/esm/vs/basic-languages/php/php.contribution'
import 'monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution'
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution'
import 'monaco-editor/esm/vs/basic-languages/xml/xml.contribution'
import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution'
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution'
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution'

import 'monaco-editor/esm/vs/editor/contrib/find/browser/findController.js'
// import 'monaco-editor/esm/vs/editor/contrib/codeAction/browser/codeAction.js'

// 组件接收的属性：
//  fileUrl:    文件下载路径
//  fileName:   文件名
const props = defineProps({
	fileUrl: String,
	fileName: String
});

// 文件内容
const fileContent = ref('');

// 定义 worker 加载
// import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
// import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
// import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
//
// self.MonacoEnvironment = {
// 	getWorker(workerId, label) {
// 		if (label === 'json') {
// 			return new JsonWorker()
// 		}
// 		if (label === 'css' || label === 'scss' || label === 'less') {
// 			return new CssWorker()
// 		}
// 		if (label === 'html' || label === 'handlebars' || label === 'razor') {
// 			return new HtmlWorker()
// 		}
// 		return new EditorWorker();
// 	},
// };


import { getFileTextReq, getFileTextFromServerReq } from "~/api/common";

// 挂载时，加载文件内容，并初始化播放器
onMounted(() => {
	let fileUrl = props.fileUrl;
	getFileTextReq(fileUrl).then((res) => {
		fileContent.value = res.data;
		initMonaco();
	}).catch((e) => {
		console.log(`默认加载文本文件: [${props.fileName}] - [${props.fileUrl}] 失败, 尝试从服务端加载.`, e);
		getFileTextFromServerReq({url: fileUrl}).then((res) => {
			fileContent.value = res.data;
			initMonaco();
		}).catch((e) => {
			console.log(`从服务器端加载文本文件: [${props.fileName}] - [${props.fileUrl}] 失败.`, e);
			alert('加载文件预览器失败，请检测文件下载链接是否正常');
		})
	});
});

// 关闭时销毁所有组件
onUnmounted(() => {
	monaco.editor.getModels().forEach((item) => {
		item.dispose();
	})
})

import useCommon from "~/composables/useCommon";
const { isNotMobile } = useCommon();

// 初始化编辑器
let initMonaco = () => {
	let model = monaco.editor.createModel(
		fileContent.value,
		undefined,
		monaco.Uri.parse(props.fileName)
	);

	monaco.editor.create(document.getElementById("zfile-monaco-editor"), {
		model: model,
		// table 个数
		tabSize: 4,
		// 自动布局
		automaticLayout: true,
		// 底部滚动超出
		scrollBeyondLastLine: false,
		// 自动换行
		wordWrap: true,
		// 只读
		readOnly: true,
		minimap: {
			enabled: isNotMobile.value
		},
		lineNumbers: isNotMobile.value ? 'on' : 'off'
	});
};
</script>

<style lang="scss" scoped>

#zfile-monaco-editor {
	height: 80vh;
	//:deep() {
	//
	//}
}
</style>