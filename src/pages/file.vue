<template>
	<div class="zfile-index-body" @contextmenu="showFileMenu">
		<div :class="'zfile-index-table-' + (isMobile ? storageConfigStore.globalConfig?.mobileLayout : storageConfigStore.globalConfig?.layout)"
			 ref="fileIndexBodyRef">

			<!-- 公告 -->
			<el-alert
				v-if="storageConfigStore.globalConfig.showAnnouncement && storageConfigStore.globalConfig.announcement"
				class="zfile-index-announcement" type="success">
				<v-md-preview :text="storageConfigStore.globalConfig.announcement" />
			</el-alert>

			<!-- 文档模式显示 -->
			<card-readme display-mode="top" class="my-3" />

			<table-file-view class="z-file-view" v-if="zfileSettingCache.view.type === 'table'"/>

      <card-file-view class="z-file-view" v-if="zfileSettingCache.view.type === 'card'"/>

			<!-- 画廊模式 -->
			<file-gallery v-if="fileDataStore.imgMode" />

			<!-- 右键菜单 -->
			<z-contextmenu />

			<!-- 文本编辑器 -->
			<text-viewer-dialog />

			<!-- pdf 在线预览 -->
			<pdf-viewer-dialog />

			<!-- 视频播放器 -->
			<video-player-dialog />

			<!-- office 在线预览 -->
			<office-viewer-dialog />

			<!-- kkfileview 在线预览 -->
			<KkFileViewerDialog />

			<!-- 3d 在线预览 -->
			<three3d-preview-dialog />

			<!-- 生成直链 -->
			<GenerateLink v-if="generateLinkDialogVisible" />
			<GenerateLinkResult />

			<!-- 上传框 -->
			<ZUpload @close="loadFile" />

			<!-- 音频播放器 -->
			<audio-player />

			<!-- 回到顶部 -->
			<back-top v-show="globalConfigStore.zfileConfig.gallery.showBackTop" />

			<!-- 弹窗文档 -->
			<dialog-readme />

			<!-- 底部文档 -->
			<card-readme display-mode="bottom" />

			<!-- 批量删除结果 -->
			<batch-operator-result />

		</div>
	</div>
</template>

<script setup>
import { isMobile } from "~/utils";

// 页面
import CardReadme from "~/components/file/readme/CardReadme.vue";
import DialogReadme from "~/components/file/readme/DialogReadme.vue";
import BatchOperatorResult from "~/components/file/BatchOperatorResult.vue";
const FileGallery = defineAsyncComponent(() => import("~/components/file/preview/FileGallery.vue"))

// 业务代码
import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();

// 右键, 长按菜单相关
import useFileContextMenu from "~/composables/file/useFileContextMenu";
const { showFileMenu } = useFileContextMenu();
const fileIndexBodyRef = ref();
import useFileLongPressEvent from "~/composables/file/useFileLongPressEvent";
useFileLongPressEvent(fileIndexBodyRef);

// 文件数据相关
import useFileData from "~/composables/file/useFileData";
const { loadFile } = useFileData();

import useSetting from "~/composables/header/useSetting";
const { zfileSettingCache } = useSetting();

// 直链
import useFileLink from "~/composables/file/useFileLink";
import TableFileView from "~/components/file/view/TableFileView.vue";
import CardFileView from "~/components/file/view/CardFileView.vue";
import {loadUserRootPathReq} from "~/api/home/home";
const { generateLinkDialogVisible } = useFileLink();

// 初始化时，加载文件列表
onBeforeMount(() => {
	loadUserRootPath().then(() => {
		loadFile({ init: true});
	})
})

// 切换存储源或路径时，重新加载文件列表
let route = useRoute();
watch(() => [route.params.storageKey, route.params.fullpath], () => {
	loadUserRootPath().then(() => {
		loadFile({ init: true});
	})
})

const loadUserRootPath = () => {
	return new Promise((resolve, reject) => {
		if (!route.params.storageKey) {
			resolve();
			return;
		}
		loadUserRootPathReq(route.params.storageKey).then((res) => {
			storageConfigStore.updateUserRootPath(res.data);
			resolve(res.data);
		}).catch((err) => {
			reject(err);
		});
	});
}

</script>

<style lang="scss" scoped>
.zfile-index-body {
	@apply h-full;
}
.zfile-index-body > div:has(.zfile-table-empty) {
	@apply h-full;
}

// 公告显示样式
.zfile-index-announcement {
	margin: 10px 0;

	:deep(.github-markdown-body) {
		padding: unset;
	}
}

// 居中模式
.zfile-index-table-center {
	@apply w-[80%] mx-auto;
}
// 卡片模式
.zfile-index-table-card {
	@apply w-11/12 max-w-7xl mx-auto;

	&::after {
		content: "";
		@apply top-2 h-2.5 block relative;
	}

	.z-file-view {
		@apply my-5 p-5 rounded-lg shadow-lg;
	}
}
</style>

<route lang="yaml">
meta:
  layout: file
</route>