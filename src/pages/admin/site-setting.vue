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
      <el-popover placement="right" :width="400" trigger="click">
        <template #reference>
          <div v-show="fixDomain.flag" class="mt-2">
            <span class="text-red-500 text-sm">设置异常，点击查看</span>
            <ExclamationTriangleIcon class="inline w-5 text-red-500"/>
          </div>
        </template>
        <div class="text-sm">
          <div class="mb-2">检测到设置异常，实际后端域名应为 <span class="text-red-500">{{ fixDomain.except }}</span>，是否需要修复？（不修正可能会影响下载、文件夹加密和文档预览功能）</div>
          <div class="flex justify-end">
            <el-button size="small" type="warning" :icon="CheckBadgeIcon" @click="fixDomain.action">自动修正</el-button>
          </div>
        </div>
      </el-popover>
    </z-form-item>

		<z-form-item prop="frontDomain" label="前端站点域名">
			<el-input :prefix-icon="Link" v-model="data.frontDomain"/>
			<template #tips>前后端分离后，需配置此地址，会影响 401、403、404 页面的跳转 (需写 http(s):// 协议头，未前后端分离请保持为空)</template>
      <el-popover placement="right" :width="400" trigger="click">
        <template #reference>
          <div v-show="fixFrontDomain.flag" class="mt-2">
            <span class="text-red-500 text-sm">设置异常，点击查看</span>
            <ExclamationTriangleIcon class="inline w-5 text-red-500"/>
          </div>
        </template>
        <div class="text-sm">
          <div class="mb-2">检测到设置异常，实际前端域名应为 <span class="text-red-500">{{ fixFrontDomain.except }}</span>，是否需要修复？（不修正会影响 401、403、404 页面的跳转功能）</div>
          <div class="flex justify-end">
            <el-button size="small" type="warning" :icon="CheckBadgeIcon" @click="fixFrontDomain.action">自动修正</el-button>
          </div>
        </div>
      </el-popover>
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
      <el-input id="siteHomeLogo" :prefix-icon="PhotoIcon" v-model="data.siteHomeLogo"/>
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
			<el-button type="primary" size="default" :icon="CheckBadgeIcon" @click="saveForm">保存设置</el-button>
		</template>
	</z-form>
</template>

<script setup>
import { Tickets, Link, Avatar } from '@element-plus/icons-vue'
import { CheckBadgeIcon, ShieldCheckIcon, KeyIcon, HomeIcon, PhotoIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid'

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
  document.querySelector(".z-form").click();
	siteSettingForm.value.validate(checked => {
		if (checked) {
			saveData();
		}
	})
}

let fixDomain = ref({
  flag: false,
  except: '',
  action: () => {}
});
let fixFrontDomain = ref({
  flag: false,
  except: '',
  action: () => {}
});

watch(() => dataLoading.value, (newVal, oldValue) => {
	// 如果是刚加载完成, 则检测域名配置是否正确.
	if (oldValue === true) {
    // 校验后端域名
		let serverDomain = globalConfigStore.zfileConfig.baseUrl || window.location.origin;
		let siteDomain = data.value.domain;
		if (serverDomain !== siteDomain) {
      fixDomain.value.flag = true;
      fixDomain.value.current = siteDomain;
      fixDomain.value.except = serverDomain;
      fixDomain.value.action = () => {
        data.value.domain = serverDomain;
        saveForm();
        fixDomain.value.flag = false;
      }
		}

    // 校验前端域名
    let siteFrontDomain = data.value.frontDomain;
    let origin = window.location.origin;
    // 如果是前后端分离场景，但设置的前端域名不等于当前域名，则提示用户修改
    if (globalConfigStore.zfileConfig.baseUrl !== '' && siteFrontDomain !== origin) {
      fixFrontDomain.value.flag = true;
      fixFrontDomain.value.current = siteFrontDomain;
      fixFrontDomain.value.except = origin;
      fixFrontDomain.value.action = () => {
        data.value.frontDomain = origin;
        saveForm();
        fixFrontDomain.value.flag = false;
      }
      // 如果是前后端不分离场景，但设置的前端域名不为空，则提示用户修改
    } else if (globalConfigStore.zfileConfig.baseUrl === '' && !!siteFrontDomain) {
      fixFrontDomain.value.flag = true;
      fixFrontDomain.value.current = siteFrontDomain;
      fixFrontDomain.value.except = '空';
      fixFrontDomain.value.action = () => {
        data.value.frontDomain = '';
        saveForm();
        fixFrontDomain.value.flag = false;
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
