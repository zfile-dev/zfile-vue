<template>
	<div>
		<z-form :model="data"
	        v-loading="saveLoading"
            v-if="data"
	        element-loading-text="保存中...">
		<template #form-title>
			显示信息
		</template>
		<template #form-sub-title>
			此页面显示网站前台的显示相关的信息
		</template>


		<z-form-item label="页面布局">
			<el-radio v-model="data.layout" label="full">全屏</el-radio>
			<el-radio v-model="data.layout" label="center">居中</el-radio>
		</z-form-item>

		<z-form-item label="根目录显示所有存储源">
			<el-switch v-model="data.rootShowStorage"/>
			<template #tips>
				根目录是否显示所有存储源, 如果为 true, 则根目录显示所有存储源列表, 如果为 false, 则会自动跳转到第一个存储源.
			</template>
		</z-form-item>

		<z-form-item label="文件操作习惯">
			<el-radio v-model="data.fileClickMode" label="click">单击进入</el-radio>
			<el-radio v-model="data.fileClickMode" label="dbclick">双击进入</el-radio>
			<template #tips>
				控制文件和文件夹的点击习惯, 单击/双击打开文件夹或预览文件
			</template>
		</z-form-item>

		<z-form-item label="视频文件后缀">
			<el-input v-model="data.customVideoSuffix"></el-input>
			<template #tips>
				自定义识别为视频格式的文件后缀，多个用逗号分开，如 'mp4,avi,mkv', 在此列表中的将调用播放器打开（能否播放要取决于浏览器是否支持，现代浏览器一般只支持封装格式为 h.264 (mp4) 的编码格式）
			</template>
		</z-form-item>

		<z-form-item label="图像文件后缀">
			<el-input v-model="data.customImageSuffix"></el-input>
		</z-form-item>

		<z-form-item label="音频文件后缀">
			<el-input v-model="data.customAudioSuffix"></el-input>
		</z-form-item>

		<z-form-item label="文本文件后缀">
			<el-input v-model="data.customTextSuffix"></el-input>
		</z-form-item>

    <z-form-item label="OnlyOffice 服务地址">
      <el-input v-model="data.onlyOfficeUrl"></el-input>
      <template #tips>
        <div>OnlyOffice 服务地址，默认的公共服务不保证稳定性，推荐自行部署 OnlyOffice 服务. 部署教程：<a class="link" href="https://docs.zfile.vip/advanced#only-office" target="_blank">https://docs.zfile.vip/advanced#only-office</a></div>
        <div>提示：进行预览的文件需 OnlyOffice 服务器可访问，如您的 OnlyOffice 在公网，要预览的文件在内网，则无法正常预览。</div>
        <div>提示：根据浏览器安全规范，如您的 ZFile 是 https 协议的，OnlyOffice 服务也必须是 https 协议的，否则无法正常使用。</div>
      </template>
    </z-form-item>

		<z-form-item label="显示文档区">
			<el-switch v-model="data.showDocument"/>
			<el-tooltip placement="right">
				<template #content>
					在文件列表下，显示当前文件夹的目录文档
				</template>
				<i class="el-icon-info zfile-info-tooltip"></i>
			</el-tooltip>
		</z-form-item>

		<z-form-item label="显示公告">
			<el-switch v-model="data.showAnnouncement"/>
			<el-tooltip placement="right">
				<template #content>
					网站顶部，显示公告内容，支持 HTML 语法
				</template>
				<i class="el-icon-info zfile-info-tooltip"></i>
			</el-tooltip>
		</z-form-item>

		<z-form-item label="公告内容">
			<v-md-editor v-model="data.announcement" height="400px"></v-md-editor>
			<template #tips>
				支持 Markdown 语法, 左右分栏, 所见即所得, 可以使用 HTML 语法
			</template>
		</z-form-item>

		<z-form-item label="自定义 CSS">
			<el-input
				type="textarea"
        :autosize="{ minRows: 3 }"
				placeholder="请输入自定义 CSS 内容"
				v-model="data.customCss">
			</el-input>
			<template #tips>
				自定义 CSS 内容, 无须写 &#60;style&#62;&#60;/style&#62; 标签
			</template>
		</z-form-item>

		<z-form-item label="自定义 JS">
			<el-input
				type="textarea"
        :autosize="{ minRows: 3 }"
				placeholder="请输入自定义 JS 内容"
				v-model="data.customJs">
			</el-input>
			<template #tips>
					自定义 JS 脚本, &#60;script&#62;&#60;/script&#62; 可写可不写，会自动兼容.
			</template>
		</z-form-item>

		<template #footer>
			<el-button type="primary" size="default" :icon="BadgeCheckIcon" @click="saveData">保存设置</el-button>
		</template>
	</z-form>
	</div>
</template>

<script setup>
// markdown editor 组件懒加载, 节约首屏打开时间
const VMdEditor = defineAsyncComponent(() => {
	return new Promise((resolve, reject) => {
		;(async function () {
			try {
				const res = await import('@kangc/v-md-editor')
				await import('@kangc/v-md-editor/lib/style/base-editor.css');
				await import('@kangc/v-md-editor/lib/theme/style/vuepress.css');

				const vuepressTheme = await import('@kangc/v-md-editor/lib/theme/vuepress.js');
				const Prism = await import('prismjs');

				res.use(vuepressTheme, {
					Prism,
				});

				resolve(res)
			} catch (error) {
				reject(error)
			}
		})()
	})
})


import {BadgeCheckIcon} from '@heroicons/vue/solid'

import useViewSetting from "~/composables/admin/view/useViewSetting";
const { data, saveData, saveLoading } = useViewSetting();

</script>

<style scoped>
.zfile-info-tooltip {
	line-height: 32px;
}
</style>

<route lang="yaml">
meta:
  layout: admin
  name: 显示设置
</route>