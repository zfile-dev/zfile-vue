<template>
  <div class="zfile-index-body-wrapper" @contextmenu="showFileMenu">
    <div class="zfile-index-body"
         :class="'zfile-index-table-' + storageConfigStore.globalConfig?.layout">

      <!-- 公告 -->
      <el-alert v-if="storageConfigStore.globalConfig.showAnnouncement && storageConfigStore.globalConfig.announcement" class="zfile-index-announcement" type="success">
        <v-md-preview :text="storageConfigStore.globalConfig.announcement"></v-md-preview>
      </el-alert>

      <!-- 文档模式显示 -->
      <el-card v-if="storageConfigStore.globalConfig.showDocument
                && route.params.storageKey
                && storageConfigStore.folderConfig.readmeDisplayMode === 'top'
                && storageConfigStore.folderConfig.readmeText" class="my-3" >
        <v-md-preview :text="storageConfigStore.folderConfig.readmeText"></v-md-preview>
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
        :size="storageConfigStore.globalConfig?.tableSize"
        empty-text=""
        @row-contextmenu="showFileMenu"
        :row-class-name="tableRowClassName"
        @selection-change="selectRowsChange"
        :data="skeletonLoading ? skeletonData : fileDataStore.fileList">
        <template #empty>
          <div v-show="!basicLoading">
            <svg-icon class="empty-icon" name="empty"/>
            <div class="font-bold text-base">数据为空，请先上传或添加文件</div>
          </div>
        </template>

        <el-table-column width="30px" type="selection" :selectable="checkSelectable">
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

        <template #append>
            <load-more-file></load-more-file>
        </template>
      </el-table>

      <!-- 画廊模式 -->
      <file-gallery v-if="fileDataStore.imgMode"></file-gallery>

      <!-- 右键菜单 -->
      <z-contextmenu></z-contextmenu>


      <!-- 视频播放器 -->
      <el-dialog draggable class="zfile-video-dialog" :destroy-on-close="true"
                 v-model="dialogVideoVisible">
        <video-player v-if="dialogVideoVisible" ref="videoPlayer"/>
      </el-dialog>

      <!-- 文本编辑器 -->
      <el-dialog draggable class="zfile-text-dialog zfile-dialog-mini-close" :destroy-on-close="true"
                 :title="fileDataStore.currentClickRow.name"
                 v-model="dialogTextVisible">
        <TextViewer :file-name="fileDataStore.currentClickRow.name"
                    :file-url="fileDataStore.currentClickRow.url"
                    v-if="dialogTextVisible && fileDataStore.currentClickRow.name.indexOf('.md') === -1"/>
        <MarkdownViewer :file-name="fileDataStore.currentClickRow.name"
                        :file-url="fileDataStore.currentClickRow.url"
                        v-if="dialogTextVisible && fileDataStore.currentClickRow.name.indexOf('.md') !== -1"/>
      </el-dialog>

      <!-- pdf 在线预览 -->
      <el-dialog draggable class="zfile-pdf-dialog"
                 :title="fileDataStore.currentClickRow.name"
                 v-model="dialogPdfVisible">
        <PdfViewer :file-name="fileDataStore.currentClickRow.name"
                    :file-url="fileDataStore.currentClickRow.url"
                    v-if="dialogPdfVisible"/>
      </el-dialog>

      <!-- office 在线预览 -->
      <el-dialog draggable class="zfile-office-dialog zfile-dialog-mini-close zfile-dialog-hidden-title"
                 :title="fileDataStore.currentClickRow.name"
                 v-model="dialogOfficeVisible">
        <OfficeViewer
          :file-name="fileDataStore.currentClickRow.name"
          :file-url="fileDataStore.currentClickRow.url"
          v-if="dialogOfficeVisible"/>
      </el-dialog>

      <!-- 3d 在线预览 -->
      <el-dialog draggable class="zfile-3d-dialog"
                 :title="fileDataStore.currentClickRow.name"
                 v-model="dialog3dVisible">
        <Three3dPreview
          :file-name="fileDataStore.currentClickRow.name"
          :file-url="fileDataStore.currentClickRow.url"
           v-if="dialog3dVisible"/>
      </el-dialog>

      <!-- 生成直链 -->
      <Link></Link>

      <!-- 上传框 -->
      <ZUpload @close="loadFile"></ZUpload>

      <!-- 音频播放器 -->
      <audio-player></audio-player>

      <!-- 回到顶部 -->
      <back-top v-show="globalConfigStore.zfileConfig.gallery.showBackTop"></back-top>

      <!-- 弹窗文档 -->
      <el-dialog draggable
                 @close="readmeDialogClose"
                 class="zfile-readme-dialog zfile-dialog-mini-close zfile-dialog-hidden-title"
                 v-if="storageConfigStore.globalConfig.showDocument
                 && storageConfigStore.folderConfig.readmeText
                 && storageConfigStore.folderConfig.readmeDisplayMode === 'dialog'
                 && showDialog(storageConfigStore.folderConfig.readmeText)" :model-value="true">
        <v-md-preview :text="storageConfigStore.folderConfig.readmeText"></v-md-preview>
      </el-dialog>

      <!-- 底部文档 -->
      <el-card class="mt-5" v-if="storageConfigStore.globalConfig.showDocument
                  && storageConfigStore.folderConfig.readmeText
                  && storageConfigStore.folderConfig.readmeDisplayMode === 'bottom'">
        <v-md-preview :text="storageConfigStore.folderConfig.readmeText"></v-md-preview>
      </el-card>

      <!-- 悬浮菜单 -->
      <hover-menu></hover-menu>
    </div>
  </div>
</template>

<script setup>
import common from "~/common";

import MarkdownViewerAsyncLoading from "~/components/file/preview/MarkdownViewerAsyncLoading.vue";
import MarkdownViewerDialogAsyncLoading from "~/components/file/preview/MarkdownViewerDialogAsyncLoading.vue";
import VideoPlayerAsyncLoading from "~/components/file/preview/VideoPlayerAsyncLoading.vue";
import TextViewerAsyncLoading from "~/components/file/preview/TextViewerAsyncLoading.vue";
import AudioPlayer from "~/components/file/preview/AudioPlayer.vue";
import BackTop from "~/components/BackTop.vue";
import SvgIcon from "~/components/SvgIcon.vue";
import Link from "~/components/file/Link.vue";
import ZUpload from "~/components/file/ZUpload.vue";

import useFileDataStore from "~/stores/file-data";
import useStorageConfigStore from "~/stores/storage-config";
import useGlobalConfigStore from "~/stores/global-config";
// element 弹窗消息提示相关
// element table 表格加载动画
import "~/assets/table-animation.less";
// element 图标
import { Calendar, Coin, Document } from "@element-plus/icons-vue";

import useFileContextMenu from "~/composables/file/useFileContextMenu";
const { showFileMenu } = useFileContextMenu();

// 文件类别数据相关
import useFileData from "~/composables/file/useFileData";
// 直链相关
import useFileLink from "~/composables/file/useFileLink";
// 表格相关基础操作
import useTableOperator from "~/composables/file/useTableOperator";
// 文件预览相关
import useFilePreview from "~/composables/file/useFilePreview";
// 文件操作相关
import useFileOperator from "~/composables/file/useFileOperator";


import useCommon from "~/composables/useCommon";
import useFileSelect from "~/composables/file/useFileSelect";
// 文件上传相关
import useFileUpload from "~/composables/file/useFileUpload";
import useRouterData from "~/composables/useRouterData";


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
const PdfViewer = defineAsyncComponent({
  loader: () => import("~/components/file/preview/PdfViewer.vue"),
  loadingComponent: MarkdownViewerDialogAsyncLoading
})
const OfficeViewer = defineAsyncComponent({
  loader: () => import("~/components/file/preview/OfficeViewer.vue"),
  loadingComponent: MarkdownViewerDialogAsyncLoading
})
const Three3dPreview = defineAsyncComponent({
  loader: () => import("~/components/file/preview/Three3dPreview.vue"),
  loadingComponent: MarkdownViewerDialogAsyncLoading
})

const FileGallery = defineAsyncComponent(() => import("~/components/file/preview/FileGallery.vue"))

const { isNotMobile } = useCommon();

let route = useRoute();
let router = useRouter();

let fileDataStore = useFileDataStore();
let storageConfigStore = useStorageConfigStore();
let globalConfigStore = useGlobalConfigStore();

const currentInstance = getCurrentInstance();

let { checkSelectable, selectRowsChange, selectRow, selectRows, selectStatistics, tableRowClassName, clearSelection } = useFileSelect(currentInstance);


// 初始化时，加载文件列表
onBeforeMount(() => {
	loadFile();
})

// 切换存储源或路径时，重新加载文件列表
watch(() => [route.params.storageKey, route.params.fullpath], () => {
  loadFile();
})

const {
	openRow, sortChangeMethod,
	basicLoading, skeletonLoading, skeletonData, loadFile,
	loadFileConfig } = useFileData();

// 直链打开
const { openLinkDialog, visible:linkVisible } = useFileLink();

const { tableClickRow, tableDbClickRow, tableHoverRow, tableLeaveRow } = useTableOperator();

const { dialogVideoVisible, dialogTextVisible, dialogPdfVisible, dialogOfficeVisible, dialog3dVisible } = useFilePreview();

const { rename, batchDownloadFile, moveTo, copyTo, newFolder, batchDelete } = useFileOperator();

const { openUploadDialog, openUploadFolderDialog } = useFileUpload();

const reload = () => {
  window.location.reload()
}

import md5 from "md5";
let { storageKey, currentPath } = useRouterData();

const readmeDialogCache = useStorage(`zfile-readme-dialog-cache`, {});

const readmeDialogClose = () => {
  ElMessageBox.confirm('在公告变更前是否不再显示此公告?', '提示', {
    confirmButtonText: '是',
    cancelButtonText: '否',
    draggable: true,
    callback: action => {
      if (action === 'confirm') {
        let key = (storageKey.value + "_" + currentPath.value);
        readmeDialogCache.value[key] = md5(storageConfigStore.folderConfig.readmeText);
      }
    }
  });
}

const showDialog = (readmeText) => {
  for (let key of Object.keys(readmeDialogCache.value)) {
    if (key === (storageKey.value + "_" + currentPath.value)
        && readmeDialogCache.value[key] === md5(readmeText)) {
      return false;
    }
  }

  return true;
}

</script>

<style lang="scss" scoped>

// 最外层边框
.zfile-index-body-wrapper {
  @apply h-full;
}

.zfile-index-body {
  @apply h-full md:px-4;

  // 文件行选中效果
  :deep(.select-row) {
    background-color: var(--el-table-row-hover-bg-color);
  }

  // 空白页样式
  :deep(.el-table__empty-block) {
    @apply -mt-10 mb-10;
  }
  :deep(.el-table__empty-text) {
    @apply w-full;
  }
  :deep(.empty-icon) {
    display: initial;
    @apply h-80 w-80;
  }


  // 公告显示样式
  .zfile-index-announcement {
    margin: 10px 0;

    :deep(.github-markdown-body) {
      padding: unset;
    }
  }
}

// 居中模式
.zfile-index-table-center {
  @apply w-[80%] ml-[10%];
}

// 卡片模式
.zfile-index-table-card {
  @apply w-11/12 max-w-7xl mx-auto;

  &::after {
    content: "";
    @apply top-2 h-2.5 block relative;
  }

  #ListTable {
    @apply my-5 p-5 rounded-lg shadow-lg;
  }
  :deep(.el-scrollbar__bar.is-horizontal) {
    @apply hidden;
  }
}

// 文件列表主体
.el-table {
  // 隐藏横向滚动条
  @apply overflow-y-hidden;

  :deep(.el-checkbox) {
    margin-right: 30px;
  }

  :deep(.el-table__inner-wrapper) {
    height: 100%;
  }
  :deep(.el-table__body-wrapper) {
    height: 100%;
    font-weight: 450;
  }

	/* 表头 -- icon 位置和大小 */
	.el-table__header-wrapper .el-icon {
    @apply mr-4 top-0.5 text-sm;
	}

	/* 表身 -- 文件名列 icon 位置 */
	.el-table__body-wrapper .zfile-table-col-name svg {
		@apply relative align-middle text-xl mr-1.5 inline;
	}

	/* 表身 -- 不支持文字选中 */
	:deep(tr) {
    @apply select-none;
	}
}

// table default 模式样式
.el-table.el-table--default {

  /* 表头 -- icon 位置和大小 */
  .el-table__header-wrapper .el-icon {
    @apply text-base;
  }

	/* 表身 -- 文件名列 icon 位置 */
	.el-table__body-wrapper .zfile-table-col-name svg {
		@apply text-2xl;
	}
}

// table large 模式样式
.el-table.el-table--large {

  /* 表头 -- icon 位置和大小 */
  .el-table__header-wrapper .el-icon {
    @apply text-xl;
  }

	/* 表身 -- 文件名列 icon 位置 */
	.el-table__body-wrapper .zfile-table-col-name svg {
		@apply text-3xl;
	}
}

// dialog 相关
.zfile-index-body {

  // zfile dialog body 高度
  .zfile-dialog-body_height {
    @apply h-[80vh] sm:h-[85vh] overflow-auto;
  }

  // zfile dialog 宽度大屏
  .zfile-dialog-wide-screen {
    @apply w-11/12;
  }

  // 迷你关闭模式
  :deep(.zfile-dialog-mini-close) {
    .el-dialog__header .el-icon {
      @apply text-white;
    }
    .el-dialog__headerbtn {
      @apply mt-0 -right-3 -top-0.5 h-5 w-5
      bg-gray-600 hover:bg-blue-500
      rounded-full box-content border-2 border-solid border-white;

      :deep(svg) {
        @apply text-white font-bold;
      }
    }
  }

  // 隐藏标题模式
  :deep(.zfile-dialog-hidden-title) {
    .el-dialog__header {
      @apply p-0;
    }
    .el-dialog__title {
      @apply hidden #{'!important'};
    }
  }

  /* dialog 高度减少，标题居中 */
	:deep(.el-dialog__header) {
		@apply -mt-3 py-1 text-center ml-2;

    /* 修正去除边框后关闭按钮错位的问题 */
    .el-dialog__headerbtn {
      @apply -mt-3.5;
    }

    // 弹窗标题最多一行
    .el-dialog__title {
      @apply line-clamp-1;
    }
  }

	/* 去除 dialog 打开后默认滚动条 */
	:deep(.el-overlay-dialog) {
    @apply overflow-hidden;
	}

  // dialog 距离顶部的高度
  :deep(.el-dialog) {
    @apply mt-8 sm:mt-10 #{!important};
  }

  // 视频弹窗样式
  :deep(.zfile-video-dialog) {
    @extend .zfile-dialog-wide-screen;
    .el-dialog__body {
      @apply p-0; // 去除所有间距
    }
  }

  // 文本弹窗
  :deep(.zfile-text-dialog) {
    @extend .zfile-dialog-wide-screen;
    .el-dialog__body {
      @apply py-4 px-1; // 左右间距和上下间距
    }
  }

  // pdf 弹窗
  :deep(.zfile-pdf-dialog) {
    .el-dialog__body {
      @extend .zfile-dialog-body_height;
    }
  }

  // readme 弹窗
  :deep(.zfile-readme-dialog) {
    .el-dialog__body {
      @extend .zfile-dialog-body_height;
    }
  }

  // office 弹窗
  :deep(.zfile-office-dialog) {
    @extend .zfile-dialog-wide-screen;
    .el-dialog__body {
      @extend .zfile-dialog-body_height;
      @apply p-0;
    }
  }

}

</style>

<route lang="yaml">
meta:
  layout: file
</route>