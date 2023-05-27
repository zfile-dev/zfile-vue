<template>
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
      <ContextmenuItem v-show="storageConfigStore.permission.download && selectStatistics.isSingleSelect"
                       @click="batchDownloadFile">
        <el-icon class="contextmenu-icon">
          <i-custom-download class="font-bold"/>
        </el-icon>
        <label>下载</label>
      </ContextmenuItem>
      <ContextmenuItem v-show="storageConfigStore.permission.download && selectStatistics.isMultiSelect && storageConfigStore.permission.batchDownload"
                       @click="batchDownloadFile">
        <el-icon class="contextmenu-icon">
          <i-custom-download-mult />
        </el-icon>
        <label>批量下载</label>
      </ContextmenuItem>
      <ContextmenuItem v-show="storageConfigStore.permission.download && selectStatistics.isMultiSelect && storageConfigStore.permission.packageDownload"
                       @click="batchDownloadFile(null,'package')">
        <el-icon class="contextmenu-icon">
          <i-custom-download-package/>
        </el-icon>
        <label>打包下载</label>
      </ContextmenuItem>
      <ContextmenuItem v-show="storageConfigStore.permission.link"
                       @click="openGenerateLinkDialog">
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

</template>

<script setup>
import { FolderOpened } from "@element-plus/icons-vue";

import { Contextmenu, ContextmenuDivider, ContextmenuItem } from "v-contextmenu";
import useFileContextMenu from "~/composables/file/useFileContextMenu";
import useFileDataStore from "~/stores/file-data";
import useStorageConfigStore from "~/stores/storage-config";
import useGlobalConfigStore from "~/stores/global-config";
import useFileData from "~/composables/file/useFileData";
import useFileSelect from "~/composables/file/useFileSelect";
import useFileOperator from "~/composables/file/useFileOperator";
import useFileLink from "~/composables/file/useFileLink";
import useFileUpload from "~/composables/file/useFileUpload";

let fileDataStore = useFileDataStore();
let storageConfigStore = useStorageConfigStore();
let globalConfigStore = useGlobalConfigStore();

const { openRow } = useFileData();
const { selectRow, selectRows, selectStatistics, clearSelection } = useFileSelect();
const { rename, batchDownloadFile, moveTo, copyTo, newFolder, batchDelete } = useFileOperator();
const { openGenerateLinkDialog } = useFileLink();
const { openUploadDialog, openUploadFolderDialog } = useFileUpload();

const contextmenu = ref();
const { initContextMenu, contextMenuTargetFile } = useFileContextMenu();

onMounted(() => {
  initContextMenu(contextmenu);
})

const reload = () => {
  window.location.reload()
}

</script>

<style scoped lang="scss">

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

</style>
