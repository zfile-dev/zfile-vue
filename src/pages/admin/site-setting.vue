<template>
	<el-form :model="siteSetting"
			 v-if="siteSetting"
			 v-loading="saveLoading"
			 :label-width="globalConfigStore.adminForm.labelWidth"
			 :label-position="globalConfigStore.adminForm.labelPosition"
			 :size="globalConfigStore.adminForm.size"
			 scroll-to-error
			 status-icon
			 class="z-admin-form"
			 ref="settingFormRef"
			 :rules="rules">

		<admin-form-header title="站点信息" sub-title="请填写您的站点信息" />

		<el-form-item prop="siteName" label="站点名称">
			<el-input id="siteName" :prefix-icon="DocumentTextIcon" v-model="siteSetting.siteName" />
		</el-form-item>

		<el-form-item prop="faviconUrl" label="站点 favicon">
			<el-input id="faviconUrl" :prefix-icon="PhotoIcon" v-model="siteSetting.faviconUrl" />
			<div class="el-form-item-tips">网站在浏览器标题栏的 favicon 图标，需确保输入的地址没有 referer
				防盗链，如修改后不生效请清理浏览器缓存或再试。
			</div>
		</el-form-item>

		<el-form-item prop="frontDomain" label="前端站点域名"
					  v-show="globalConfigStore.zfileConfig.baseUrl || siteSetting.frontDomain">
			<el-input :prefix-icon="LinkIcon" v-model="siteSetting.frontDomain" />
			<div class="el-form-item-tips">前后端分离后，需配置此地址，用于访问未授权页面调回登录页、访问失效短链时调到 403
				页面时确保跳转到前端服务的地址，不配置的话会跳转到后端地址
			</div>
			<el-popover placement="right" :width="400" trigger="click">
				<template #reference>
					<div v-show="fixFrontDomain.flag" class="mt-2">
						<span class="text-red-500 text-sm">设置异常，点击查看</span>
						<ExclamationTriangleIcon class="inline w-5 text-red-500" />
					</div>
				</template>
				<div class="text-sm">
					<div class="mb-2">检测到设置异常，实际前端域名应为 <span
						class="text-red-500">{{ fixFrontDomain.except }}</span>，是否需要修复？（不修正会影响 401、403、404
						页面的跳转功能）
					</div>
					<div class="flex justify-end">
						<el-button size="small" type="warning" :icon="CheckBadgeIcon" @click="fixFrontDomain.action">
							自动修正
						</el-button>
					</div>
				</div>
			</el-popover>
		</el-form-item>

		<el-form-item prop="siteHomeName" label="根路径名称">
			<el-input id="siteHomeName" :prefix-icon="HomeIcon" v-model="siteSetting.siteHomeName" />
			<div class="el-form-item-tips">用于设置首页上方面包屑根目录的默认名称.</div>
		</el-form-item>

		<el-form-item prop="siteHomeLogo" label="首页 Logo 图片地址">
			<el-input id="siteHomeLogo" :prefix-icon="PhotoIcon" v-model="siteSetting.siteHomeLogo" />
			<div class="el-form-item-tips">用于设置首页上面包屑左侧 Logo，留空为不显示，会自动居中显示，如有需要可通过自定义
				css 来修改默认样式, logo 元素的 id 为 zfile-home-logo
			</div>
		</el-form-item>

		<el-form-item prop="siteHomeLogoLink" label="首页 Logo 打开链接">
			<el-input :disabled="!siteSetting.siteHomeLogo" id="siteHomeLogoLink" :prefix-icon="LinkIcon"
					  v-model="siteSetting.siteHomeLogoLink" />
			<div class="el-form-item-tips">点击 Logo 链接后打开的地址，为空则点击不进行任何跳转</div>
		</el-form-item>

		<el-form-item prop="siteHomeLogoTargetMode" label="首页 Logo 链接打开方式">
			<el-radio-group v-model="siteSetting.siteHomeLogoTargetMode">
				<el-radio value="_blank">新标签打开</el-radio>
				<el-radio value="_self">当前页面打开</el-radio>
			</el-radio-group>
		</el-form-item>

		<el-form-item prop="siteAdminLogoTargetMode" label="管理员页面 logo 链接打开方式">
			<el-radio-group v-model="siteSetting.siteAdminLogoTargetMode">
				<el-radio value="_blank">新标签打开</el-radio>
				<el-radio value="_self">当前页面打开</el-radio>
			</el-radio-group>
			<div class="el-form-item-tips">管理员页面左上角的 ZFile Logo 点击会回到首页</div>
		</el-form-item>

		<el-form-item prop="siteAdminVersionOpenChangeLog" label="管理员页面点击版本号打开更新日志">
			<el-switch v-model="siteSetting.siteAdminVersionOpenChangeLog" />
		</el-form-item>

		<el-form-item label="备案号">
			<el-input id="icp" :prefix-icon="ShieldCheckIcon" v-model="siteSetting.icp" />
		</el-form-item>

		<el-form-item label="最大同时上传文件数">
			<el-input-number id="maxFileUploads" v-model="siteSetting.maxFileUploads" :min="1" :max="99" />
		</el-form-item>

		<el-form-item class="admin-from-footer">
			<el-button class="ml-auto" type="primary" :icon="CheckBadgeIcon" @click="saveData">保存设置</el-button>
		</el-form-item>
	</el-form>
</template>

<script setup>
import { DocumentTextIcon, LinkIcon, CheckBadgeIcon, ShieldCheckIcon, HomeIcon, PhotoIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/solid";

import { getUserListReq } from "~/api/admin/admin-user";
import { updateSiteSettingReq } from "~/api/admin/admin-setting";

import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();

const settingFormRef = ref();
import useAdminSetting from "~/composables/admin/useAdminSetting";
import {loadStorageListReq} from "~/api/admin/admin-storage";
const { siteSetting, siteSettingLoading, saveData, saveLoading } = useAdminSetting(updateSiteSettingReq, settingFormRef);

let rules = ref({
	siteName: [
		{ required: true, message: "请输入站点名称" }
	],
	faviconUrl: [
		{ type: "url", message: "请输入正确的 favicon 地址，需以 http 或 https 开头" }
	]
});

let fixFrontDomain = ref({
	flag: false,
	except: "",
	action: () => {
	}
});

watch(() => siteSettingLoading.value, (newVal, oldValue) => {
	// 如果是刚加载完成, 则检测域名配置是否正确.
	if (oldValue === true) {

		// 校验前端域名
		let siteFrontDomain = siteSetting.value.frontDomain;
		let origin = window.location.origin;
		// 如果是前后端分离场景，但设置的前端域名不等于当前域名，则提示用户修改
		if (globalConfigStore.zfileConfig.baseUrl !== "" && siteFrontDomain !== origin) {
			fixFrontDomain.value.flag = true;
			fixFrontDomain.value.current = siteFrontDomain;
			fixFrontDomain.value.except = origin;
			fixFrontDomain.value.action = () => {
				siteSetting.value.frontDomain = origin;
				saveData();
				fixFrontDomain.value.flag = false;
			};
			// 如果是前后端不分离场景，但设置的前端域名不为空，则提示用户修改
		} else if (globalConfigStore.zfileConfig.baseUrl === "" && !!siteFrontDomain) {
			fixFrontDomain.value.flag = true;
			fixFrontDomain.value.current = siteFrontDomain;
			fixFrontDomain.value.except = "空";
			fixFrontDomain.value.action = () => {
				siteSetting.value.frontDomain = "";
				saveData();
				fixFrontDomain.value.flag = false;
			};
		}
	}
});


onMounted(() => {
    checkAdminStoragePermission();
});

const router = useRouter();
const checkAdminStoragePermission = () => {
	loadStorageListReq().then((response) => {
		let storageSize = response.data?.length;
		if (storageSize > 0) {
			getUserListReq({
				hideDisabledStorage: true
			}).then(res => {
				let data = res.data;
				if (data.length > 0) {
					let user = data.find(item => item.id === 1);
					if (user.userStorageSourceList?.length === 0) {
						ElMessageBox.confirm(`检测到你有 ${storageSize} 个存储源，但没有给管理员分配任何存储源，是否前往配置？（不配置将无法访问存储源）`, "提示", {
							confirmButtonText: "确定",
							cancelButtonText: "取消",
							type: "warning"
						}).then(() => {
							router.push("/admin/user-list");
						});
					}
				}
			});
		}
	});
}
</script>

<style lang="scss" scoped>

</style>

<route lang="yaml">
meta:
  layout: admin
  name: 基本设置
</route>