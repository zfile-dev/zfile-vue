<template>
	<div class="zfile-index-body"
       :class="storageConfigStore.config?.layout === 'center' ? 'zfile-index-table-center' : ''"
       ref="rootRef">
		<!-- 公告 -->
		<el-alert v-if="storageConfigStore.config.showAnnouncement && storageConfigStore.config.announcement" class="zfile-index-announcement" type="success">
			<v-md-preview :text="storageConfigStore.config.announcement"></v-md-preview>
		</el-alert>

		<!-- 文档模式显示 -->
		<el-card v-if="storageConfigStore.config.showDocument && route.params.storageKey && storageConfig.readmeDisplayMode === 'top'" class="my-3" >
			<v-md-preview :text="storageConfig.readmeText"></v-md-preview>
		</el-card>

		<!-- 文件区 -->
		<el-table
			v-if="!fileDataStore.imgMode"
			id="ListTable"
			ref="fileTableRef"
			v-loading="basicLoading"
			element-loading-text="拼命加载中"
			element-loading-background="rgba(255, 255, 255, 0.6)"
			@sort-change="sortChangeMethod"
			@row-click="tableClickRow"
			@row-dblclick="tableDbClickRow"
			@cell-mouse-enter="tableHoverRow"
			@cell-mouse-leave="tableLeaveRow"
			:size="storageConfigStore.config?.tableSize"
			empty-text=""
			@row-contextmenu="showMenu"
			:row-class-name="tableRowClassName"
			@selection-change="selectRowsChange"
			:data="skeletonLoading ? skeletonData : fileDataStore.fileList">
			<template #empty>
				<div v-show="!basicLoading">
					<svg-icon class="empty-icon" name="empty"/>
					<div class="font-bold text-base">数据为空，请先上传或添加文件</div>
				</div>
			</template>

			<el-table-column width="45px" type="selection" :selectable="checkSelectable">
			</el-table-column>

			<el-table-column
				prop="name"
				sortable="custom"
				class-name="zfile-table-col-name"
				label-class-name="table-header-left"
				min-width="100%">
				<template #header>
					<el-icon>
						<Document/>
					</el-icon>
					<span>文件名</span>
				</template>
				<template #default="scope">
					<div v-show="skeletonLoading">
						<el-skeleton animated>
							<template #template>
								<el-skeleton-item variant="circle"
								                  style="vertical-align: middle;width: 18px; height: 18px; margin-right: 20px" />
								<el-skeleton-item variant="text"
								                  style="vertical-align: middle;width: 30%;"/>
							</template>
						</el-skeleton>
					</div>
					<div v-show="!skeletonLoading">
						<svg-icon :name="'file-type-' + scope.row.icon"></svg-icon>
						{{ scope.row.name }}
					</div>
				</template>
			</el-table-column>

			<el-table-column
				prop="time"
				v-if="isNotMobile"
				sortable="custom"
				class-name="zfile-table-col-time"
				min-width="25%">
				<template #header>
					<el-icon>
						<Calendar/>
					</el-icon>
					<span>修改时间</span>
				</template>
				<template #default="scope">
          <div v-show="skeletonLoading">
						<el-skeleton animated>
							<template #template>
								<el-skeleton-item variant="text" style="width: 60%"/>
							</template>
						</el-skeleton>
					</div>
          <div v-show="!skeletonLoading">
						{{ scope.row.time }}
					</div>
				</template>
			</el-table-column>

			<el-table-column
				prop="size"
				v-if="isNotMobile"
				class-name="zfile-table-col-size"
				sortable="custom"
				min-width="20%">
				<template #header>
					<el-icon>
						<Coin/>
					</el-icon>
					<span>大小</span>
				</template>
				<template #default="scope">
          <div v-show="skeletonLoading">
						<el-skeleton animated>
							<template #template>
								<el-skeleton-item variant="text" style="width: 30%"/>
							</template>
						</el-skeleton>
					</div>
          <div v-show="!skeletonLoading">
						{{ common.fileSizeFilter(scope.row, null, scope.row.size) }}
					</div>
				</template>
			</el-table-column>
		</el-table>

		<!-- 画廊模式 -->
		<file-gallery v-if="fileDataStore.imgMode"></file-gallery>

		<!-- 右键菜单 -->
		<Contextmenu ref="contextmenu">
			<div>
				<ContextmenuItem v-show="selectStatistics.isSingleSelect && selectStatistics.isAllFolder"
				                 @click="openRow(selectRow)">
					<el-icon class="contextmenu-icon">
						<FolderOpened/>
					</el-icon>
					<label>打开</label>
				</ContextmenuItem>
			</div>
			<ContextmenuItem v-show="selectStatistics.isSingleSelect && selectStatistics.isAllFile"
			                 @click="openRow(selectRow)">
				<el-icon class="contextmenu-icon">
					<i-custom-preview/>
				</el-icon>
				<label>预览</label>
			</ContextmenuItem>
			<ContextmenuItem v-show="selectStatistics.isAllFile"
			                 @click="batchDownloadFile">
				<el-icon class="contextmenu-icon">
					<i-custom-download/>
				</el-icon>
				<label>下载</label>
			</ContextmenuItem>
			<ContextmenuItem v-show="selectStatistics.isAllFile &&
(storageConfigStore.config.showLinkBtn && (storageConfigStore.config.showShortLink || storageConfigStore.config.showPathLink))"
			                 @click="openLinkDialog">
				<el-icon class="contextmenu-icon">
					<svg-icon class="inline" name="link"></svg-icon>
				</el-icon>
				<label>生成直链</label>
			</ContextmenuItem>
			<div v-show="storageConfig.enableFileOperator !== false">
				<ContextmenuDivider></ContextmenuDivider>

				<ContextmenuItem v-show="selectStatistics.isSingleSelect"
				                 @click="rename">
					<el-icon class="contextmenu-icon">
						<svg-icon name="edit"/>
					</el-icon>
					<label>重命名</label>
				</ContextmenuItem>
				<!--<ContextmenuItem @click="moveTo">-->
				<!--	<el-icon class="contextmenu-icon">-->
				<!--		<svg-icon class="inline" name="move"></svg-icon>-->
				<!--	</el-icon>-->
				<!--	<label>移动</label>-->
				<!--</ContextmenuItem>-->
				<!--<ContextmenuItem-->
				<!--                 @click="copyTo">-->
				<!--	<el-icon class="contextmenu-icon">-->
				<!--		<CopyDocument/>-->
				<!--	</el-icon>-->
				<!--	<label>复制</label>-->
				<!--</ContextmenuItem>-->
				<ContextmenuItem @click="batchDelete">
					<el-icon class="contextmenu-icon">
						<svg-icon class="inline" name="delete"></svg-icon>
					</el-icon>
					<label>删除 {{selectRows.length > 0 ? ('(' + selectRows.length + ')') : ''}}</label>
				</ContextmenuItem>

				<ContextmenuDivider></ContextmenuDivider>

				<ContextmenuItem @click="newFolder">
					<el-icon class="contextmenu-icon">
						<FolderOpened/>
					</el-icon>
					<label>新建文件夹</label>
				</ContextmenuItem>

				<ContextmenuItem @click="openUploadDialog">
					<el-icon class="contextmenu-icon">
						<i-custom-upload/>
					</el-icon>
					<label>上传文件</label>
				</ContextmenuItem>

				<ContextmenuItem @click="openUploadFolderDialog">
					<el-icon class="contextmenu-icon">
						<i-custom-upload-folder/>
					</el-icon>
					<label>上传文件夹</label>
				</ContextmenuItem>
			</div>

		</Contextmenu>

		<!-- 视频播放器 -->
		<el-dialog draggable custom-class="zfile-video-dialog" :destroy-on-close="true"
		           top="5vh"
		           width="90%"
		           v-model="dialogVideoVisible">
			<video-player v-if="dialogVideoVisible" ref="videoPlayer"/>
		</el-dialog>

		<!-- 文本编辑器 -->
		<el-dialog draggable custom-class="zfile-text-dialog" :destroy-on-close="true"
		           top="5vh"
		           :title="fileDataStore.currentClickRow.name"
		           v-model="dialogTextVisible">
			<TextViewer :file-name="fileDataStore.currentClickRow.name"
			            :file-url="fileDataStore.currentClickRow.url"
			            v-if="dialogTextVisible && fileDataStore.currentClickRow.name.indexOf('.md') === -1"/>
			<MarkdownViewer :file-name="fileDataStore.currentClickRow.name"
			                :file-url="fileDataStore.currentClickRow.url"
			                v-if="dialogTextVisible && fileDataStore.currentClickRow.name.indexOf('.md') !== -1"/>
		</el-dialog>

		<!-- 生成直链 -->
		<Link></Link>

		<!-- 批量删除结果 -->
		<el-dialog draggable :destroy-on-close="true"
		           width="40%"
		           title="操作结果"
		           @close="batchDeleteCloseAction"
		           v-model="batchDeleteDialogShow">
			<el-progress
				:text-inside="true"
				:stroke-width="26"
				:percentage="batchDeletePercentage"
				:status="batchDeletePercentage === 100 ? 'success' : ''" />
			<el-table :data="batchDeleteResult" height="60vh" style="width: 100%">
				<el-table-column show-overflow-tooltip prop="name" label="文件名" />
				<el-table-column prop="status" label="状态" width="150">
					<template #default="scope">
						<span v-if="scope.row.status" class="text-green-500">成功</span>
						<span v-else class="text-red-500">失败</span>
					</template>
				</el-table-column>
			</el-table>
		</el-dialog>

		<ZUpload @close="loadFileAndConfig"></ZUpload>

		<!-- 音频播放器 -->
		<audio-player></audio-player>

		<!-- 回到顶部 -->
		<back-top v-show="globalConfigStore.zfileConfig.gallery.showBackTop"></back-top>

		<!-- 弹窗文档 -->
		<el-dialog draggable
		           custom-class="zfile-readme-dialog"
		           v-if="storageConfigStore.config.showDocument && storageConfig.readmeDisplayMode === 'dialog'" :model-value="true">
			<v-md-preview :text="storageConfig.readmeText"></v-md-preview>
		</el-dialog>

		<!-- 底部文档 -->
		<el-card class="mt-5" v-if="storageConfigStore.config.showDocument && storageConfig.readmeDisplayMode === 'bottom'">
			<v-md-preview :text="storageConfig.readmeText"></v-md-preview>
		</el-card>

		<!-- 悬浮菜单 -->
		<transition enter-active-class="animate__animated animate__fadeInUp animate__faster"
		            leave-active-class="animate__animated animate__fadeOutDown animate__faster">
			<div v-show="selectRows.length > 0 && storageKey && !fileDataStore.imgMode && linkVisible === false"
			     class="zfile-index-hover-tools">
				<div class="zfile-index-hover-body">

					<el-tooltip
						:show-arrow="false"
						:offset="15"
						v-if="selectStatistics.isAllFile && selectStatistics.isSingleSelect"
						effect="dark"
						content="预览"
						placement="top">
						<svg-icon v-if="selectStatistics.isAllFile && selectStatistics.isSingleSelect"
						          @click="openRow(selectRow)" name="tool-preview"></svg-icon>
					</el-tooltip>
					<el-tooltip
						:show-arrow="false"
						:offset="15"
						v-if="selectStatistics.isAllFile"
						effect="dark"
						content="下载"
						placement="top">
						<svg-icon v-if="selectStatistics.isAllFile" @click="batchDownloadFile" name="tool-download"></svg-icon>
					</el-tooltip>

          <el-tooltip
            :show-arrow="false"
            :offset="15"
            effect="dark"
            content="生成直链"
            placement="top">
            <svg-icon v-if="selectStatistics.isAllFile && selectStatistics.isAllFile &&
(storageConfigStore.config.showLinkBtn && (storageConfigStore.config.showShortLink || storageConfigStore.config.showPathLink))" @click="openLinkDialog" name="tool-link"></svg-icon>
          </el-tooltip>

					<template v-if="storageConfig.enableFileOperator !== false">
						<el-tooltip
							:show-arrow="false"
							:offset="15"
							effect="dark"
							v-if="selectStatistics.isSingleSelect"
							content="重命名"
							placement="top">
							<svg-icon v-if="selectStatistics.isSingleSelect" @click="rename" name="tool-edit"></svg-icon>
						</el-tooltip>
						<!--<el-tooltip-->
						<!--	:show-arrow="false"-->
						<!--	:offset="15"-->
						<!--	effect="dark"-->
						<!--	content="移动"-->
						<!--	placement="top">-->
						<!--	<svg-icon @click="moveTo" name="tool-move"></svg-icon>-->
						<!--</el-tooltip>-->
						<el-tooltip
							:show-arrow="false"
							:offset="15"
							effect="dark"
							content="删除"
							placement="top">
							<svg-icon @click="batchDelete" name="tool-delete"></svg-icon>
						</el-tooltip>
					</template>

					<el-tooltip
						:show-arrow="false"
						:offset="15"
						:disabled="selectRows.length === 0"
						effect="dark"
						content="取消选择"
						placement="top">
						<svg-icon @click="clearSelection" name="tool-close"></svg-icon>
					</el-tooltip>
				</div>
			</div>
		</transition>
	</div>
</template>

<script setup>
import common from "~/common";

import MarkdownViewerAsyncLoading from '~/components/file/preview/MarkdownViewerAsyncLoading.vue'
import MarkdownViewerDialogAsyncLoading from '~/components/file/preview/MarkdownViewerDialogAsyncLoading.vue'
import VideoPlayerAsyncLoading from '~/components/file/preview/VideoPlayerAsyncLoading.vue'
import TextViewerAsyncLoading from '~/components/file/preview/TextViewerAsyncLoading.vue'

// markdown viewer 组件懒加载, 节约首屏打开时间
const VMdPreview = defineAsyncComponent({
  loader: () => {
    return new Promise((resolve, reject) => {
      ;(async function () {
        try {
          const res = await import('@kangc/v-md-editor/lib/preview')
          import('@kangc/v-md-editor/lib/style/preview.css');
          import('@kangc/v-md-editor/lib/theme/style/github.css');
          const hljs = await import('highlight.js');
          const githubTheme = await import('@kangc/v-md-editor/lib/theme/github.js');
          res.use(githubTheme, {
            Hljs: hljs,
          });
          resolve(res)
        } catch (error) {
          reject(error)
        }
      })()
    })
  },
  loadingComponent: MarkdownViewerAsyncLoading
})

// 文件预览相关, 视频、音频、文本、图片
const VideoPlayer = defineAsyncComponent({
  loader: () => import("~/components/file/preview/VideoPlayer.vue"),
  loadingComponent: VideoPlayerAsyncLoading
})
const TextViewer = defineAsyncComponent({
  loader: () => import("~/components/file/preview/TextViewer.vue"),
  loadingComponent: TextViewerAsyncLoading
})
const MarkdownViewer = defineAsyncComponent({
  loader: () => import("~/components/file/preview/MarkdownViewer.vue"),
  loadingComponent: MarkdownViewerDialogAsyncLoading
})


import AudioPlayer from '~/components/file/preview/AudioPlayer.vue'
const FileGallery = defineAsyncComponent(() => import("~/components/file/preview/FileGallery.vue"))
import BackTop from '~/components/BackTop.vue'
import SvgIcon from '~/components/SvgIcon.vue'
import Link from '~/components/file/Link.vue'
import ZUpload from "~/components/file/ZUpload.vue";

import useFileDataStore from "~/stores/file-data";
import useStorageConfigStore from "~/stores/storage-config";
import useGlobalConfigStore from "~/stores/global-config";
// element 弹窗消息提示相关
// element table 表格加载动画
import "~/assets/table-animation.less";
// element 图标
import {Calendar, Coin, CopyDocument, Document, FolderOpened} from '@element-plus/icons-vue';

// 右键菜单
import {Contextmenu, ContextmenuItem, ContextmenuDivider } from "v-contextmenu";
import useFileContextMenu from "~/composables/file/useFileContextMenu";

// 文件类别数据相关
import useFileData from "~/composables/file/useFileData";
// 直链相关
import useFileLink from "~/composables/file/useFileLink";
// 表格相关基础操作
import useTableOperator from "~/composables/file/useTableOperator";
// 文件预览相关
import useFilePreview from '~/composables/file/useFilePreview';
// 文件操作相关
import useFileOperator from '~/composables/file/useFileOperator';
// element table ref 相关操作
import useFileRef from "~/composables/file/useFileRef";

import useCommon from "~/composables/useCommon";
const { isNotMobile } = useCommon();

let route = useRoute();
let router = useRouter();

let fileDataStore = useFileDataStore();
let storageConfigStore = useStorageConfigStore();
let globalConfigStore = useGlobalConfigStore();

// 初始化 tableRef
const fileTableRef = ref();
const contextmenu = ref();
const rootRef = ref();
const { clearSelection } = useFileRef(fileTableRef, rootRef);

const currentInstance = getCurrentInstance();
const { showMenu, visible:contextMenuVisible } = useFileContextMenu(router, route, currentInstance);

// 初始化时，加载文件列表
onBeforeMount(() => {
	loadFileAndConfig();
})

const loadFileAndConfig = () => {
	if (route.params.storageKey) {
		loadFile();
		loadFileConfig();
	}
}

// 切换存储源或路径时，重新加载文件列表
watch(() => [route.params.storageKey, route.params.fullpath], () => {
	loadFileAndConfig();
})

const { currentPath, storageKey,
	openRow, sortChangeMethod, checkSelectable,
	selectRowsChange, selectRow, selectRows,
	basicLoading, skeletonLoading, skeletonData, loadFile, tableRowClassName,
	selectStatistics, storageConfig, loadFileConfig } = useFileData(router, route);


// 直链打开
const { openLinkDialog, visible:linkVisible } = useFileLink();

const { tableClickRow, tableDbClickRow, tableHoverRow, tableLeaveRow } = useTableOperator(router, route);

const { dialogVideoVisible, dialogTextVisible, dialogOfficeVisible } = useFilePreview();

const {rename, batchDownloadFile, moveTo, copyTo, newFolder,
	batchDelete, batchDeleteResult, batchDeleteDialogShow, batchDeleteCloseAction, batchDeletePercentage
} = useFileOperator(router, route);

// 文件上传相关
import useFileUpload from "~/composables/file/useFileUpload";
const { openUploadDialog, openUploadFolderDialog } = useFileUpload(router, route);
</script>

<style lang="scss" scoped>
// 最外层边框
.zfile-index-body {

	height: 100%;
	//overflow: hidden;
	padding: 0 15px;

	// 移动端去除边框
	@media (max-device-width: 768px) {
		padding: 0;
	}
}

// 文件列表主体
.el-table {
	// 全局 -- 隐藏自带的纵向滚动条
	overflow-y: hidden;

	// 移动端 -- 去除边框
	@media (max-device-width: 768px) {
		margin: 0 0 0 0;
		padding-right: 0;
	}

	/* 表头 -- icon 位置 */
	.el-table__header-wrapper .el-icon {
		margin-right: 12px;
		top: 1.5px;
		font-size: 13px;
	}

	/* 表身 -- 文件名列 icon 位置 */
	.el-table__body-wrapper .zfile-table-col-name svg {
		@apply relative -top-[1.5px] align-middle text-xl mr-1.5 inline;
	}

	// 表身 -- 操作列图标布局位置
	.operator-btn {
		margin-right: 20px;
		display: inline-block;
	}

	// 表身 -- 操作列图标大小和颜色
	.operator-btn svg {
		color: #1E9FFF;
		font-size: 16px;
	}

	/* 表身 -- 每行悬浮小手 不支持文字选中 */
	:deep(tr) {
		//cursor: pointer;
		user-select: none;
	}

}

// table default 模式样式
.el-table.el-table--default {
	/* 表身 -- 文件名列 icon 位置 */
	.el-table__body-wrapper .zfile-table-col-name svg {
		@apply text-2xl;
	}
}

// table large 模式样式
.el-table.el-table--large {
	/* 表身 -- 文件名列 icon 位置 */
	.el-table__body-wrapper .zfile-table-col-name svg {
		@apply text-3xl;
	}
}

// dialog 相关
.zfile-index-body {
	/* 所有弹窗 -- 标题居中, 高度减少 */
	:deep(.el-dialog__header) {
		margin-bottom: -10px;
		padding: 5px 0 5px 0;
		@apply line-clamp-1 text-center ml-2;
	}

  /* 视频弹窗样式 -- 修正去除边框后关闭按钮错位的问题 */
  :deep(.el-dialog__header .el-dialog__headerbtn) {
    top: -6px;
  }

	/* 所有弹窗 -- 去除 dialog 打开后滚动条 */
	:deep(.el-overlay-dialog) {
		overflow: hidden;
	}

	/* 视频弹窗样式 -- 去除内容边框 */
	:deep(.zfile-video-dialog .el-dialog__body) {
		padding: 10px 0 0 0;
	}

	// 移动端视频宽屏显示
	@media screen and (max-device-width: 769px) {
		:deep(.zfile-video-dialog) {
			margin-top: 10vh !important;
			width: 90% !important;
		}
	}
}

// 右键菜单
.v-contextmenu-item {
	// 文字和图标的距离
	:deep(label) {
		margin-left: 10px;
	}

	// 图标位置修正为居中
	:deep(.contextmenu-icon) {
		top: 1px;
		padding-top: 1px;
	}
}

// 直链结果弹窗
.zfile-dialog-link-result-info {
	.el-form-item {
		margin-bottom: 10px;
	}
}

#batchCopyLinkDialog >>> thead {
	cursor: pointer;
}

#ListTable {
  height: 100%;
  :deep(.el-table__inner-wrapper) {
    height: 100%;
  }
  :deep(.el-table__body-wrapper) {
    height: 100%;
  }
}


.zfile-index-table-center {
  @apply w-[80%] ml-[10%];
}


// 文件选中效果
.zfile-index-body {
	:deep(.select-row) {
		background-color: #F4F5F6;
		//color: white;
	}

	:deep(.select-row:hover) {
		--el-table-row-hover-bg-color: #F4F5F6;
		//color: white;
	}
}

.zfile-index-body {
	:deep(.el-table__body-wrapper .el-scrollbar__view) {
		height: 100%;
	}

	:deep(.empty-icon) {
		display: initial;
		@apply h-80 w-80;
	}
}


.zfile-index-body {
	:deep(.v-md-editor-preview .github-markdown-body) {
		padding: unset;
	}
}

.zfile-index-announcement {
	margin: 10px 0;
}


.zfile-index-body {
	:deep(.zfile-readme-dialog .el-dialog__header) {
		margin-bottom: unset;
		padding: var(--el-dialog-padding-primary);
		padding-bottom: 10px;
	}

	:deep(.zfile-readme-dialog .el-dialog__header .el-dialog__title) {
		display: none;
	}

	:deep(.zfile-index-operator svg) {
		//font-size: 20px;
	}
}

.zfile-index-body {
	.zfile-index-hover-tools {
		@apply absolute z-10 bottom-0 sm:bottom-10 left-0 right-0 mx-auto w-fit;

		.zfile-index-hover-body {
			@apply bg-[#313136] w-fit px-5 h-12 py-2 text-white rounded mx-auto space-x-6 text-2xl;

			svg {
				@apply inline text-white cursor-pointer outline-none;
				&:hover {
					@apply text-blue-400;
				}
			}
		}
	}
}


.zfile-index-body {
	:deep(.zfile-text-dialog) {

		width: 90%;
		.el-dialog__body {
			padding: 15px 5px;
		}
	}
}


.zfile-index-body {
  :deep(.el-table__empty-block) {
    @apply -mt-10;
  }
  :deep(.el-table__empty-text) {
    @apply w-full;
  }
}

</style>

<route lang="yaml">
meta:
  layout: file
</route>