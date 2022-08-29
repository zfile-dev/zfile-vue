<template>
  <div class="zfile-index-body-wrapper" @contextmenu="showFileMenu">
    <div class="zfile-index-body"
         :class="storageConfigStore.globalConfig?.layout === 'center' ? 'zfile-index-table-center' : ''">

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
      <Contextmenu auto-ajust-placement ref="contextmenu">
        <template v-if="contextMenuTargetFile">
          <ContextmenuItem v-show="storageConfigStore.permission.open"
                           @click="openRow(selectRow)">
            <el-icon class="contextmenu-icon">
              <FolderOpened/>
            </el-icon>
            <label>打开</label>
          </ContextmenuItem>
          <ContextmenuItem v-show="storageConfigStore.permission.preview"
                           @click="openRow(selectRow)">
            <el-icon class="contextmenu-icon">
              <i-custom-preview/>
            </el-icon>
            <label>预览</label>
          </ContextmenuItem>
          <ContextmenuItem v-show="storageConfigStore.permission.download"
                           @click="batchDownloadFile">
            <el-icon class="contextmenu-icon">
              <i-custom-download class="font-bold" v-if="selectStatistics.isSingleSelect"/>
              <i-custom-download-mult v-else/>
            </el-icon>
            <label>
              {{ selectStatistics.isSingleSelect ? '下载' : '批量下载' }}
            </label>
          </ContextmenuItem>
          <ContextmenuItem v-show="storageConfigStore.permission.link"
                           @click="openLinkDialog">
            <el-icon class="contextmenu-icon">
              <svg-icon class="inline" name="link"></svg-icon>
            </el-icon>
            <label>生成直链</label>
          </ContextmenuItem>
          <ContextmenuDivider v-show="storageConfigStore.permission.rename || storageConfigStore.permission.delete"></ContextmenuDivider>
          <ContextmenuItem v-show="storageConfigStore.permission.rename"
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
          <ContextmenuItem v-if="storageConfigStore.permission.delete" @click="batchDelete">
            <el-icon class="contextmenu-icon">
              <svg-icon class="inline" name="delete"></svg-icon>
            </el-icon>
            <label>删除 {{selectRows.length > 0 ? ('(' + selectRows.length + ')') : ''}}</label>
          </ContextmenuItem>
          <ContextmenuDivider v-show="storageConfigStore.permission.newFolder || storageConfigStore.permission.upload"></ContextmenuDivider>
        </template>
        <ContextmenuItem v-show="storageConfigStore.permission.newFolder" @click="newFolder">
          <el-icon class="contextmenu-icon">
            <FolderOpened/>
          </el-icon>
          <label>新建文件夹</label>
        </ContextmenuItem>
        <ContextmenuItem v-show="storageConfigStore.permission.upload" @click="openUploadDialog">
          <el-icon class="contextmenu-icon">
            <i-custom-upload/>
          </el-icon>
          <label>上传文件</label>
        </ContextmenuItem>
        <ContextmenuItem v-show="storageConfigStore.permission.upload" @click="openUploadFolderDialog">
          <el-icon class="contextmenu-icon">
            <i-custom-upload-folder/>
          </el-icon>
          <label>上传文件夹</label>
        </ContextmenuItem>

        <ContextmenuDivider v-show="storageConfigStore.permission.newFolder || storageConfigStore.permission.upload"></ContextmenuDivider>
        <ContextmenuItem @click="reload">
          <el-icon class="contextmenu-icon">
            <i-custom-refresh/>
          </el-icon>
          <label>刷新</label>
        </ContextmenuItem>


      </Contextmenu>

      <!-- 视频播放器 -->
      <el-dialog draggable custom-class="zfile-video-dialog" :destroy-on-close="true"
                 v-model="dialogVideoVisible">
        <video-player v-if="dialogVideoVisible" ref="videoPlayer"/>
      </el-dialog>

      <!-- 文本编辑器 -->
      <el-dialog draggable custom-class="zfile-text-dialog" :destroy-on-close="true"
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
      <el-dialog draggable custom-class="zfile-pdf-dialog"
                 :title="fileDataStore.currentClickRow.name"
                 v-model="dialogPdfVisible">
        <PdfViewer :file-name="fileDataStore.currentClickRow.name"
                   :file-url="fileDataStore.currentClickRow.url"
                   v-if="dialogPdfVisible"/>
      </el-dialog>

      <!-- 生成直链 -->
      <Link></Link>

      <!-- 上传框 -->
      <ZUpload @close="loadFileAndConfig"></ZUpload>

      <!-- 音频播放器 -->
      <audio-player></audio-player>

      <!-- 回到顶部 -->
      <back-top v-show="globalConfigStore.zfileConfig.gallery.showBackTop"></back-top>

      <!-- 弹窗文档 -->
      <el-dialog draggable
                 custom-class="zfile-readme-dialog"
                 v-if="storageConfigStore.globalConfig.showDocument
                 && storageConfigStore.folderConfig.readmeText
                 && storageConfigStore.folderConfig.readmeDisplayMode === 'dialog'" :model-value="true">
        <v-md-preview :text="storageConfigStore.folderConfig.readmeText"></v-md-preview>
      </el-dialog>

      <!-- 底部文档 -->
      <el-card class="mt-5" v-if="storageConfigStore.globalConfig.showDocument
                  && storageConfigStore.folderConfig.readmeText
                  && storageConfigStore.folderConfig.readmeDisplayMode === 'bottom'">
        <v-md-preview :text="storageConfigStore.folderConfig.readmeText"></v-md-preview>
      </el-card>

      <!-- 悬浮菜单 -->
      <transition enter-active-class="animate__animated animate__fadeInUp animate__faster"
                  leave-active-class="animate__animated animate__fadeOutDown animate__faster">
        <div v-show="selectRows.length > 0 && route.params.storageKey && !fileDataStore.imgMode && linkVisible === false"
             class="zfile-index-hover-tools">
          <div class="zfile-index-hover-body">
            <template v-if="storageConfigStore.permission.preview">
              <el-tooltip
                :show-arrow="false"
                :offset="15"
                effect="dark"
                content="预览"
                placement="top">
                <svg-icon @click="openRow(selectRow)" name="tool-preview"></svg-icon>
              </el-tooltip>
            </template>

            <template v-if="storageConfigStore.permission.download">
              <el-tooltip
                :show-arrow="false"
                :offset="15"
                effect="dark"
                content="下载"
                placement="top">
                <svg-icon @click="batchDownloadFile" name="tool-download"></svg-icon>
              </el-tooltip>
            </template>

            <template v-if="storageConfigStore.permission.link">
              <el-tooltip
                :show-arrow="false"
                :offset="15"
                effect="dark"
                content="生成直链"
                placement="top">
                <svg-icon @click="openLinkDialog" name="tool-link"></svg-icon>
              </el-tooltip>
            </template>

            <template v-if="storageConfigStore.permission.rename">
              <el-tooltip
                :show-arrow="false"
                :offset="15"
                effect="dark"
                content="重命名"
                placement="top">
                <svg-icon @click="rename" name="tool-edit"></svg-icon>
              </el-tooltip>
            </template>
            <!--<el-tooltip-->
            <!--	:show-arrow="false"-->
            <!--	:offset="15"-->
            <!--	effect="dark"-->
            <!--	content="移动"-->
            <!--	placement="top">-->
            <!--	<svg-icon @click="moveTo" name="tool-move"></svg-icon>-->
            <!--</el-tooltip>-->
            <template v-if="storageConfigStore.permission.delete">
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
const PdfViewer = defineAsyncComponent({
  loader: () => import("~/components/file/preview/PdfViewer.vue"),
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


import useCommon from "~/composables/useCommon";
const { isNotMobile } = useCommon();

let route = useRoute();
let router = useRouter();

let fileDataStore = useFileDataStore();
let storageConfigStore = useStorageConfigStore();
let globalConfigStore = useGlobalConfigStore();

const currentInstance = getCurrentInstance();
const { showFileMenu, contextMenuTargetFile } = useFileContextMenu(currentInstance);

import useFileSelect from "~/composables/file/useFileSelect";
let { checkSelectable, selectRowsChange, selectRow, selectRows, selectStatistics, tableRowClassName, clearSelection } = useFileSelect(currentInstance);


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

const {
  openRow, sortChangeMethod,
  basicLoading, skeletonLoading, skeletonData, loadFile,
  loadFileConfig } = useFileData();

// 直链打开
const { openLinkDialog, visible:linkVisible } = useFileLink();

const { tableClickRow, tableDbClickRow, tableHoverRow, tableLeaveRow } = useTableOperator();

const { dialogVideoVisible, dialogTextVisible, dialogPdfVisible, dialogOfficeVisible } = useFilePreview();

const { rename, batchDownloadFile, moveTo, copyTo, newFolder, batchDelete } = useFileOperator();

// 文件上传相关
import useFileUpload from "~/composables/file/useFileUpload";
const { openUploadDialog, openUploadFolderDialog } = useFileUpload();


const reload = () => {
  window.location.reload()
}
</script>

<style lang="scss" scoped>

// 最外层边框
.zfile-index-body-wrapper {
  @apply h-full;
}

.zfile-index-body {
  @apply h-full md:px-4;
}

// 居中模式
.zfile-index-table-center {
  @apply w-[80%] ml-[10%];
}

// 文件列表主体
.el-table {
  // 隐藏横向滚动条
  @apply overflow-y-hidden;


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
    @apply relative -top-[1.5px] align-middle text-xl mr-1.5 inline;
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

  // 空白页
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

	/* 所有弹窗 -- 标题居中, 高度减少, 最高 */
  :deep(.el-dialog__header) {
		@apply -mt-3 py-1 text-center ml-2;
	}

  // 弹窗标题最多一行
  :deep(.el-dialog__title) {
    @apply line-clamp-1;
  }

  /* 修正去除边框后关闭按钮错位的问题 */
  :deep(.el-dialog__header .el-dialog__headerbtn) {
    @apply -mt-3;
  }

	/* 去除 dialog 打开后滚动条 */
  :deep(.el-overlay-dialog) {
    @apply overflow-hidden;
  }

  // dialog 距离顶部的高度
  :deep(.el-dialog) {
    @apply mt-6 sm:mt-8 #{!important};
  }

  // 视频弹窗样式
    :deep(.zfile-video-dialog) {
    @apply w-11/12;
    .el-dialog__body {
      @apply p-0 sm:pt-2;
    }
    }

  // 文本弹窗
  :deep(.zfile-text-dialog) {
    @apply w-11/12;
    .el-dialog__body {
      @apply py-4 px-1;
    }
  }

  // pdf 弹窗
  :deep(.zfile-pdf-dialog) {
    .el-dialog__body {
      @apply h-[80vh] sm:h-[85vh] overflow-auto;
    }
  }


  // 文件选中效果
  :deep(.select-row) {
    background-color: var(--el-table-row-hover-bg-color);
  }

}

// 右键菜单
.v-contextmenu-item {
  // 文字和图标的距离
  :deep(label) {
    @apply ml-2.5;
  }

  // 图标位置修正为居中
  :deep(.contextmenu-icon) {
    @apply top-[1px] pt-[1px];
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
  // 工具条
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


</style>

<route lang="yaml">
meta:
layout: file
</route>