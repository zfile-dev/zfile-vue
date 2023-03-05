<template>
	<z-form :model="data"
	        v-if="data"
	        v-loading="saveLoading"
	        :rules="dataRules" ref="siteSettingForm">
		<template #form-title>
			站点信息
		</template>
		<template #form-sub-title>
			请填写您的站点信息
		</template>

		<z-form-item prop="siteName" label="站点名称">
			<el-input id="siteName" :prefix-icon="Tickets" v-model="data.siteName"/>
		</z-form-item>

		<z-form-item prop="domain" label="后端站点域名">
			<el-input id="domain" :prefix-icon="Link" v-model="data.domain"/>
			<template #tips>此地址用于生成直链及本次存储下载使用，请务必保持和服务端地址一样 (需写 http(s):// 协议头)</template>
    </z-form-item>

		<z-form-item prop="frontDomain" label="前端站点域名">
			<el-input :prefix-icon="Link" v-model="data.frontDomain"/>
			<template #tips>前后端分离后，需配置此地址，会影响 401、403、404 页面的跳转 (需写 http(s):// 协议头，未前后端分离请保持为空)</template>
		</z-form-item>

		<z-form-item prop="avatar" label="头像地址">
			<el-input id="avatar" :prefix-icon="Avatar" v-model="data.avatar"/>
			<template #tips>用于管理员页面右上角头像地址，推荐尺寸为 35 * 35.</template>
		</z-form-item>

    <z-form-item prop="siteHomeName" label="根路径名称">
      <el-input id="siteHomeName" :prefix-icon="HomeIcon" v-model="data.siteHomeName"/>
      <template #tips>用于设置首页上方面包屑根目录的默认名称.</template>
    </z-form-item>

    <z-form-item prop="siteHomeLogo" label="首页 Logo 图片地址">
      <el-input id="siteHomeLogo" :prefix-icon="PhotographIcon" v-model="data.siteHomeLogo"/>
      <template #tips>用于设置首页上面包屑左侧 Logo，留空为不显示，会自动居中显示，如有需要可通过自定义 css 来修改默认样式, logo 元素的 id 为 zfile-home-logo</template>
    </z-form-item>

    <z-form-item prop="siteHomeLogoLink" label="首页 Logo 打开链接">
      <el-input id="siteHomeLogoLink" :prefix-icon="Link" v-model="data.siteHomeLogoLink"/>
      <template #tips>点击 Logo 链接后打开的地址，为空则点击不进行任何跳转</template>
    </z-form-item>

    <z-form-item prop="siteHomeLogoTargetMode" label="首页 Logo 链接打开方式">
      <el-radio v-model="data.siteHomeLogoTargetMode" label="_blank">新标签打开</el-radio>
      <el-radio v-model="data.siteHomeLogoTargetMode" label="_self">当前页面打开</el-radio>
      <template #tips>控制 Logo 链接的打开方式</template>
    </z-form-item>


		<z-form-item label="备案号">
			<el-input id="icp" :prefix-icon="ShieldCheckIcon" v-model="data.icp"/>
		</z-form-item>

    <z-form-item label="最大同时上传文件数">
      <el-input-number id="maxFileUploads" v-model="data.maxFileUploads" :min="1" :max="99" />
    </z-form-item>

		<template #footer>
			<el-button type="primary" size="default" :icon="BadgeCheckIcon" @click="saveForm">保存设置</el-button>
		</template>
	</z-form>
</template>

<script setup>
import { Tickets, Link, Avatar } from '@element-plus/icons-vue'
import { BadgeCheckIcon, ShieldCheckIcon, KeyIcon, HomeIcon, PhotographIcon, ExclamationIcon } from "@heroicons/vue/solid";

import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();

import useSiteSetting from "~/composables/admin/site/useSiteSetting";
const { data, dataLoading, saveData, saveLoading } = useSiteSetting();

let dataRules = ref({
	siteName: [
		{required: true, message: '请输入站点名称'},
	],
	domain: [
		{required: true, message: '请输入后端站点域名'},
	],
	frontDomain: [
	],
	avatar: [
		{type: 'url', message: '请输入正确的头像地址，需以 http 或 https 开头'},
	]
});

const siteSettingForm = ref();
const saveForm = () => {
	siteSettingForm.value.validate(checked => {
		if (checked) {
			saveData();
		}
	})
}


watch(() => dataLoading.value, (newVal, oldValue) => {
	// 如果是刚加载完成, 则检测域名配置是否正确.
	if (oldValue === true) {
		let serverDomain = globalConfigStore.zfileConfig.baseUrl || window.location.origin;
		let siteDomain = data.value.domain;

		if (serverDomain !== siteDomain) {
			ElMessageBox.confirm(`检测到服务端地址为 ${serverDomain}，当前配置站点域名为 ${siteDomain}，是否自动进行修正？（不修正可能会影响下载、文件夹加密和文档预览功能）`, '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
				callback: action => {
					if (action === 'confirm') {
						data.value.domain = serverDomain;
						saveForm();
					}
				}
			});
		} else {
			let siteFrontDomain = data.value.frontDomain;
			let origin = window.location.origin;
			if (globalConfigStore.zfileConfig.baseUrl !== '' && siteFrontDomain !== origin) {
				ElMessageBox.confirm(`检测到当前为前后端分离模式，访问域名为 ${origin}，当前配置前端站点域名为 ${siteFrontDomain}，是否自动进行修正？（不修正可能会防盗链功能）`, '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning',
					callback: action => {
						if (action === 'confirm') {
							data.value.frontDomain = origin;
							saveForm();
						}
					}
				});
			}
		}
	}
})

</script>

<style lang="scss" scoped>
	.el-button {
		height: 35px;
	}
	.el-input {
		:deep(input) {
			height: 35px;
		}
	}
</style>

<route lang="yaml">
meta:
  layout: admin
  name: 基本设置
</route>