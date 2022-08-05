<template>
	<div class="zfile-header">
		<el-scrollbar>
			<div class="zfile-header-breadcrumb box animate__animated animate__fadeIn">
				<el-breadcrumb separator="/" separator-class="ArrowRight">
					<el-breadcrumb-item :to="rootPath">{{ '首页' }}</el-breadcrumb-item>
					<el-breadcrumb-item v-for="item in breadcrumbData"
					                    :to="{path: encodeAllIgnoreSlashes(item.fullPath)}"
					                    :key="item.fullPath"
					                    class="hidden-xs-only">
						{{ item.name }}
					</el-breadcrumb-item>
				</el-breadcrumb>
			</div>
		</el-scrollbar>

		<div class="zfile-header-right box animate__animated animate__fadeIn">
      <!-- 功能区 -->
			<div class="zfile-header-btn" v-if="isNotMobile && initStorageConfig">
        <template v-if="storageConfigStore.globalConfig.debugMode">
          <el-tooltip placement="bottom">
            <template #content>
              此功能为 DEBUG 模式下重置管理员密码功能, 使用完后请关闭 DEBUG 模式并重启服务.
            </template>
            <el-button @click="resetAdminPwd" type="danger" >
              重置管理员密码
            </el-button>
          </el-tooltip>
        </template>

        <el-tooltip placement="bottom" v-if="storageConfigStore.globalConfig.showLogin">
					<template #content>
						后台管理
					</template>
					<div @click="toLoginView">
						<svg-icon class="text-2xl text-gray-500 hover:text-blue-500" name="login"></svg-icon>
					</div>
				</el-tooltip>

				<el-dropdown v-if="storageConfigStore.permission.upload || storageConfigStore.permission.newFolder" trigger="click"
                     popper-class="zfile-header-dropdown">
					<div v-show="route.params.storageKey">
						<svg-icon class="text-2xl text-gray-500 hover:text-blue-500" name="add"></svg-icon>
					</div>
					<template #dropdown>
						<el-dropdown-menu class="font-medium">
							<el-dropdown-item v-if="storageConfigStore.permission.newFolder" @click="newFolder">
								<svg-icon class="text-[17px] mr-3" name="add-folder"></svg-icon>
								新建文件夹
							</el-dropdown-item>

              <template v-if="storageConfigStore.permission.upload">
                <el-dropdown-item @click="openUploadDialog" :divided="storageConfigStore.permission.upload && storageConfigStore.permission.newFolder">
                  <svg-icon class="text-[17px] mr-3" name="upload"></svg-icon>
                  上传文件
                </el-dropdown-item>

                <el-dropdown-item @click="openUploadFolderDialog">
                  <svg-icon class="text-[17px] mr-3" name="upload-folder"></svg-icon>
                  上传文件夹
                </el-dropdown-item>
              </template>

						</el-dropdown-menu>
					</template>
				</el-dropdown>

				<div v-show="route.params.storageKey" @click="fileDataStore.imgMode = !fileDataStore.imgMode">
					<svg-icon v-if="fileDataStore.imgMode" class="text-4xl" name="img-enable"></svg-icon>
					<svg-icon v-else class="text-4xl" name="img-disable"></svg-icon>
				</div>

				<div @click="openSettingVisible">
					<i-custom-tool-setting></i-custom-tool-setting>
				</div>
			</div>

      <!-- 存储源选择 -->
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

    <div v-if="isMobile" v-show="route.params.storageKey">
      <el-dropdown trigger="click" class="top-3">
        <MenuIcon class="block h-6 w-6" aria-hidden="true"/>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-if="storageConfigStore.globalConfig.showLogin" @click="toLoginView">
              <svg-icon class="text-base mr-2 text-gray-500" name="login"></svg-icon>
              后台管理
            </el-dropdown-item>
            <el-dropdown-item v-if="storageConfigStore.permission.newFolder" @click="newFolder">
              <svg-icon class="text-base mr-2 text-gray-500" name="add-folder"></svg-icon>
              新建文件夹
            </el-dropdown-item>
            <el-dropdown-item v-if="storageConfigStore.permission.upload" @click="openUploadDialog">
              <svg-icon class="text-base mr-2 text-gray-500" name="upload"></svg-icon>
              上传文件
            </el-dropdown-item>
            <el-dropdown-item v-if="storageConfigStore.permission.upload" @click="openUploadFolderDialog">
              <svg-icon class="text-base mr-2 text-gray-500" name="upload-folder"></svg-icon>
              上传文件夹
            </el-dropdown-item>
            <el-dropdown-item v-if="!fileDataStore.imgMode" @click="fileDataStore.imgMode = true">
              <svg-icon class="text-base mr-2 text-gray-500" name="image"></svg-icon>
              打开画廊模式
            </el-dropdown-item>
            <el-dropdown-item v-else-if="fileDataStore.imgMode" @click="fileDataStore.imgMode = false">
              <svg-icon class="text-base mr-2 text-gray-500" name="image"></svg-icon>
              关闭画廊模式
            </el-dropdown-item>
            <el-dropdown-item @click="openSettingVisible">
              <svg-icon class="text-base mr-2 text-gray-500" name="tool-setting"></svg-icon>
              更多设置
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
	<Setting></Setting>
</template>

<script setup>
import { MenuIcon } from '@heroicons/vue/outline'

let router = useRouter();
let route = useRoute();

// debug 模式相关操作.
import useHeaderDebugMode from "~/composables/header/useHeaderDebugMode";
const { resetAdminPwd } = useHeaderDebugMode();

// 存储源列表.
import useHeaderStorageList from "~/composables/header/useHeaderStorageList";
const { loadStorageSourceList, currentStorageKey, storageList } = useHeaderStorageList();

// 面包屑数据和操作
import useBreadcrumb from "~/composables/header/useHeaderBreadcrumb";
const { buildBreadcrumbData, rootPath, breadcrumbData } = useBreadcrumb();

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

onMounted(() => {
	loadStorageSourceList().then(() => {
		buildBreadcrumbData();
	});
})


watch(() => route.params.storageKey, (value) => {
	if (value === undefined) {
		currentStorageKey.value = '';
	}
})


import useFileOperator from '~/composables/file/useFileOperator';
const { newFolder } = useFileOperator();

import useFileUpload from "~/composables/file/useFileUpload";
const { openUploadDialog, openUploadFolderDialog } = useFileUpload();

import useSetting from "~/composables/header/useSetting";
const { openSettingVisible } = useSetting();

import useCommon from "~/composables/useCommon";
const { isNotMobile, isMobile, encodeAllIgnoreSlashes } = useCommon();

import useFileData from "~/composables/file/useFileData";
let { initStorageConfig } = useFileData();

// 监听存储源设置 -> 默认打开图片模式, 如果为是, 则打开图片模式.
watch(() => [storageConfigStore.folderConfig.defaultSwitchToImgMode, fileDataStore.oldStorageKey], (val, oldValue) => {
  let defaultSwitchToImgMode = val[0];
  let storageKey = val[1];
  let oldStorageKey = oldValue[1];

  if (storageKey !== oldStorageKey) {
    fileDataStore.imgMode = defaultSwitchToImgMode;
	}
})

const toLoginView = () => {
	window.location.href = '/login'
}

// 自定义 css js 功能.
import { useStyleTag } from '@vueuse/core'
if (storageConfigStore.globalConfig.customCss) {
  try {
	  useStyleTag(storageConfigStore.globalConfig.customCss);
  } catch (e) {
    console.error('加载自定义 css 加载失败:', storageConfigStore.globalConfig.customCss, e);
  }
}

if (storageConfigStore.globalConfig.customJs) {
  try {
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = storageConfigStore.globalConfig.customJs;
    document.getElementsByTagName('head')[0].appendChild(script)
  } catch (e) {
    console.log('加载自定义 js 失败: ', storageConfigStore.globalConfig.customJs, e);
  }

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
	@apply space-x-5 sm:space-x-20;


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

    :deep(.el-dropdown) {
      line-height: 48px !important;
    }

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
      @apply truncate text-sm font-medium text-gray-700;
		}
	}
}

.zfile-debug-tips {
	:deep(.el-form-item__label) {
		font-weight: bold;
		color: red !important;
	}
}


.zfile-header-storage-select {
  :deep(.el-input__wrapper) {
    @apply truncate text-sm font-medium;
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