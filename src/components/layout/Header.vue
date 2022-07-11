<template>
	<div class="zfile-header">
		<el-scrollbar>
			<div class="zfile-header-breadcrumb box animate__animated animate__fadeIn">
				<el-breadcrumb separator="/" separator-class="ArrowRight">
					<el-breadcrumb-item :to="rootPath">{{ '首页' }}</el-breadcrumb-item>
					<el-breadcrumb-item v-for="item in breadcrumbData"
					                    :to="{path: item.fullPath}"
					                    :key="item.fullPath"
					                    class="hidden-xs-only">
						{{ item.name }}
					</el-breadcrumb-item>
				</el-breadcrumb>
			</div>
		</el-scrollbar>

		<div class="zfile-header-right box animate__animated animate__fadeIn">
			<div class="zfile-header-btn" v-if="initStorageConfig">
				<el-tooltip placement="bottom">
					<template #content>
						此功能为 DEBUG 模式下重置管理员密码功能, 使用完后请关闭 DEBUG 模式并重启服务.
					</template>
					<el-button @click="resetAdminPwd" type="danger"  v-if="storageConfigStore.config.debugMode">
						重置管理员密码
					</el-button>
				</el-tooltip>


				<el-tooltip placement="bottom">
					<template #content>
						登录后台
					</template>
					<div @click="toLoginView" v-if="storageConfigStore.config.showLogin">
						<svg-icon class="text-2xl text-gray-500 hover:text-blue-500" name="login"></svg-icon>
					</div>
				</el-tooltip>

				<el-dropdown v-if="storageConfig.enableFileOperator !== false" trigger="click" popper-class="zfile-header-dropdown">
					<div v-show="route.params.storageKey">
						<svg-icon class="text-2xl text-gray-500 hover:text-blue-500" name="add"></svg-icon>
					</div>
					<template #dropdown>
						<el-dropdown-menu class="font-medium">
							<el-dropdown-item @click="newFolder">
								<svg-icon class="text-[17px] mr-3" name="add-folder"></svg-icon>
								新建文件夹
							</el-dropdown-item>
							<el-dropdown-item @click="openUploadDialog" divided>
								<svg-icon class="text-[17px] mr-3" name="upload"></svg-icon>
								上传文件
							</el-dropdown-item>
							<el-dropdown-item @click="openUploadFolderDialog">
								<svg-icon class="text-[17px] mr-3" name="upload-folder"></svg-icon>
								上传文件夹
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>

				<div v-show="route.params.storageKey" @click="imgModel = !imgModel">
					<svg-icon v-if="imgModel" class="text-4xl" name="img-enable"></svg-icon>
					<svg-icon v-else class="text-4xl" name="img-disable"></svg-icon>
				</div>

				<div @click="openSettingVisible">
					<i-custom-tool-setting></i-custom-tool-setting>
				</div>
			</div>
			<div class="zfile-header-storage-select" v-if="isNotMobile">
				<el-select size="default" v-model="currentStorageKey" placeholder="请选择存储源">
					<el-option v-for="item in storageList"
					           :key="item.key"
					           :label="item.name"
					           :value="item.key">
					</el-option>
				</el-select>
			</div>
		</div>
	</div>
	<Setting></Setting>
</template>

<script setup>
let router = useRouter();
let route = useRoute();

// debug 模式相关操作.
import useHeaderDebugMode from "~/composables/header/useHeaderDebugMode";
const { resetAdminPwd } = useHeaderDebugMode();

// 图片模式
import useHeaderImgMode from "~/composables/header/useHeaderImgMode";
const { imgModel } = useHeaderImgMode();

// 存储源列表.
import useHeaderStorageList from "~/composables/header/useHeaderStorageList";
const { loadStorageSourceList, currentStorageKey, storageList } = useHeaderStorageList(router, route);

// 面包屑数据和操作
import useBreadcrumb from "~/composables/header/useHeaderBreadcrumb";
const { buildBreadcrumbData, rootPath, breadcrumbData } = useBreadcrumb(router, route);

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

onMounted(() => {
	loadStorageSourceList().then(() => {
		buildBreadcrumbData();
	});
})

import useSearch from "~/composables/header/useSearch";
const { search } = useSearch();

watch(() => route.params.storageKey, (value) => {
	if (value === undefined) {
		currentStorageKey.value = '';
	}
})

// 切换存储源或路径时，取消图片模式.
watch(() => [route.params.storageKey, route.params.fullpath], () => {
	imgModel.value = false;
})


import useFileOperator from '~/composables/file/useFileOperator';
const { newFolder } = useFileOperator(router, route);

import useFileUpload from "~/composables/file/useFileUpload";
const { openUploadDialog, openUploadFolderDialog } = useFileUpload(router, route);

import useSetting from "~/composables/header/useSetting";
const { openSettingVisible } = useSetting();

import useCommon from "~/composables/useCommon";
const { isNotMobile } = useCommon();


import useFileData from "~/composables/file/useFileData";
let { storageConfig, initStorageConfig } = useFileData(router, route);

// 监听存储源设置 -> 默认打开图片模式, 如果为是, 则打开图片模式.
watchOnce(() => storageConfig.value.defaultSwitchToImgMode, (val) => {
	if (val === true) {
		imgModel.value = val;
	}
})


const toLoginView = () => {
	window.location.href = '/login'
}


// 自定义 css js 功能.
import { useStyleTag } from '@vueuse/core'
if (storageConfigStore.config.customCss) {
	useStyleTag(storageConfigStore.config.customCss);
}

if (storageConfigStore.config.customJs) {
	let script = document.createElement('script');
	script.type = 'text/javascript';
	script.text = storageConfigStore.config.customJs;
	document.getElementsByTagName('head')[0].appendChild(script)
}


</script>

<style scoped lang="scss">

.zfile-header {
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-between;
	height: 48px;
	line-height: 48px !important;
	padding: 0 15px;

	background-color: #ffffff;
	color: #606266;
	transition: border-color var(--el-transition-duration), background-color var(--el-transition-duration);
	border-bottom: 1px solid rgba(132, 133, 141, 0.2);
	@apply space-x-20;


	.el-scrollbar {
		@apply max-w-[40%] md:max-w-[50%] lg:max-w-[60%] xl:max-w-[70%];
		:deep(.el-scrollbar__bar.is-vertical) {
			display: none !important;
		}
	}

	.zfile-header-breadcrumb {
		:deep(.el-breadcrumb) {
			line-height: 48px;
			font-size: 13px;
			white-space: nowrap;
			margin-left: 14px;

			.el-breadcrumb__item {
				display: inline;
				float: none;
			}
		}
	}

	.zfile-header-right {
		@apply flex space-x-10;

		.zfile-header-btn {
			@apply flex text-4xl space-x-10 items-center;

			div {
				@apply cursor-pointer h-5 #{!important};
			}
		}

		.zfile-header-storage-select {
			@apply mr-4;
		}
	}

}

@media only screen and (max-width: 767px) {
	.zfile-header {
		:deep(.el-breadcrumb__separator) {
			display: none !important;
		}

		:deep(.el-form-item__label) {
			display: none !important;
		}

		:deep(.el-select) {
			width: 120px;
		}
	}
}

.zfile-debug-tips {
	:deep(.el-form-item__label) {
		font-weight: bold;
		color: red !important;
	}
}

</style>

<style lang="scss">
.zfile-header-dropdown {
	.el-dropdown-menu__item:hover,
	.el-dropdown-menu__item:hover svg {
		@apply text-blue-500
	}
}
</style>