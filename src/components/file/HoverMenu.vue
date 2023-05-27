<template>
  <!-- 悬浮菜单 -->
  <transition enter-active-class="animate__animated animate__fadeInUp animate__faster"
              leave-active-class="animate__animated animate__fadeOutDown animate__faster">
    <!-- 已经处于某个存储源，且不是画廊模式，且选中了多个文件，且没有打开直链弹窗时显示悬浮菜单 -->
    <div v-show="route.params.storageKey && !fileDataStore.imgMode && selectRows.length > 0 && generateLinkDialogVisible === false"
         class="zfile-index-hover-tools">
      <div class="zfile-index-hover-body">
        <template>
          <el-tooltip
            :show-arrow="false"
            :offset="15"
            effect="dark"
            content="预览"
            placement="top">
            <svg-icon @click="openRow(selectRow)" name="tool-preview"></svg-icon>
          </el-tooltip>
        </template>

        <template v-if="storageConfigStore.permission.download && selectStatistics.isSingleSelect">
          <el-tooltip
            :show-arrow="false"
            :offset="15"
            effect="dark"
            content="下载"
            placement="top">
            <svg-icon @click="batchDownloadFile" name="tool-download"></svg-icon>
          </el-tooltip>
        </template>

        <template v-if="storageConfigStore.permission.download && selectStatistics.isMultiSelect && storageConfigStore.permission.batchDownload">
          <el-tooltip
            :show-arrow="false"
            :offset="15"
            effect="dark"
            content="批量下载"
            placement="top">
            <svg-icon @click="batchDownloadFile" name="tool-download-mult"></svg-icon>
          </el-tooltip>
        </template>

        <template v-if="storageConfigStore.permission.download && selectStatistics.isMultiSelect && storageConfigStore.permission.packageDownload">
          <el-tooltip
            :show-arrow="false"
            :offset="15"
            effect="dark"
            content="打包下载"
            placement="top">
            <svg-icon @click="batchDownloadFile(null, 'package')" name="tool-download-package"></svg-icon>
          </el-tooltip>
        </template>

        <template v-if="storageConfigStore.permission.link">
          <el-tooltip
            :show-arrow="false"
            :offset="15"
            effect="dark"
            content="生成直链"
            placement="top">
            <svg-icon @click="openGenerateLinkDialog" name="tool-link"></svg-icon>
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
</template>

<script setup>
import useFileDataStore from "~/stores/file-data";
import useGlobalConfigStore from "~/stores/global-config";
import useStorageConfigStore from "~/stores/storage-config";

let fileDataStore = useFileDataStore();
let storageConfigStore = useStorageConfigStore();
let globalConfigStore = useGlobalConfigStore();

import useFileData from "~/composables/file/useFileData";
import useFileLink from "~/composables/file/useFileLink";
import useFileSelect from "~/composables/file/useFileSelect";
import useFileOperator from "~/composables/file/useFileOperator";

const { openRow } = useFileData();
const { openGenerateLinkDialog, generateLinkDialogVisible } = useFileLink();
const { selectRow, selectRows, selectStatistics, clearSelection } = useFileSelect();
const { rename, batchDownloadFile, moveTo, copyTo, newFolder, batchDelete } = useFileOperator();

let route = useRoute();

</script>


<style scoped lang="scss">

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

</style>
