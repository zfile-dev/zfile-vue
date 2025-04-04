<template>
  <div class="zfile-admin-password-body">
    <cancel to="/admin/storage-list" :title="'密码文件夹（' + storageItem?.name + '）'">
      <template #default>
        <el-alert :closable="false" type="info">
          <div class="rules-tips">Glob 表达式规则：</div>
          <div class="rules-tips"><b>单层根目录加密</b>: 如 <span class="select-all code">/</span> 表示根路径下需要密码访问.</div>
          <div class="rules-tips"><b>单层子目录加密</b>: 如 <span class="select-all code">/music/*</span> 表示根目录下的 music 文件夹需要密码访问, 子文件夹不加密.</div>
          <div class="rules-tips"><b>嵌套子目录加密</b>: 如 <span class="select-all code">/music/**</span> 表示根目录下的 music 文件夹及其所有子文件夹都需要密码访问.</div>
          <div class="rules-tips">注：系统匹配到第一个符合的规则就会取密码进行校验，并返回结果，所以请调整好规则顺序，下方规则可进行拖拽排序。</div>
          <div class="rules-tips-link">
            <a target="_blank" class="link" href="http://www.ruanyifeng.com/blog/2018/09/bash-wildcards.html"><DocumentMagnifyingGlassIcon class="inline mr-1"></DocumentMagnifyingGlassIcon><span>参考文章 (Wikipedia)</span></a>
            <a target="_blank" class="link" href="http://www.ruanyifeng.com/blog/2018/09/bash-wildcards.html"><DocumentMagnifyingGlassIcon class="inline mr-1"></DocumentMagnifyingGlassIcon>参考文章 (阮一峰)</a>
            <a target="_blank" class="link" href="https://github.com/whinc/blog/issues/18"><DocumentMagnifyingGlassIcon class="inline mr-1"></DocumentMagnifyingGlassIcon>参考文章 (Github)</a>
          </div>
        </el-alert>
      </template>
    </cancel>

    <el-table-plus :size="globalConfigStore.adminTable.size"
                   row-key="id"
                   v-loading="loading" :data="list">
      <el-table-column-plus label="ID" prop="id" v-if="isMobile" />
      <el-table-column-plus label="描述" prop="description">
        <template #default="scope">
          <el-input :prefix-icon="DocumentMinusIcon" placeholder="请输入表达式描述" v-model="scope.row.description" />
        </template>
      </el-table-column-plus>
      <el-table-column-plus label="表达式" prop="expression">
        <template #default="scope">
          <el-input :prefix-icon="FolderIcon" placeholder="请输入表达式" v-model.trim="scope.row.expression" />
        </template>
      </el-table-column-plus>
      <el-table-column-plus label="密码" width="200" prop="password">
        <template #default="scope">
          <el-input :prefix-icon="KeyIcon" placeholder="请输入密码" type="password" show-password v-model="scope.row.password" />
        </template>
      </el-table-column-plus>
      <el-table-column-plus align="center" label="操作" width="60px">
        <template #default="scope">
          <el-button type="primary" v-if="isMobile && scope.$index !== 0" @click="moveUp(scope.$index)" :icon="ArrowUpIcon" />
          <el-button type="primary" v-if="isMobile && scope.$index !== list.length - 1" @click="moveDown(scope.$index)" :icon="ArrowDownIcon" />
          <el-button type="danger" @click="deleteItem(scope.$index)" :icon="TrashIcon" />
        </template>
      </el-table-column-plus>
    </el-table-plus>

    <el-button class="add-more-btn" size="default" :icon="PlusIcon" @click="addItem">添加更多</el-button>

    <div class="save-btn">
      <el-button type="primary" size="default" :icon="CheckBadgeIcon" @click="saveData">保存设置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ArrowDownIcon, ArrowUpIcon, CheckBadgeIcon } from "@heroicons/vue/24/solid";
import {FolderIcon, KeyIcon, PlusIcon, TrashIcon, DocumentMinusIcon, DocumentMagnifyingGlassIcon } from '@heroicons/vue/24/outline'

import { loadStorageItemReq } from "~/api/admin/admin-storage";

import { isMobile } from "~/utils";

import useGlobalConfigStore from "~/stores/global-config";
const globalConfigStore = useGlobalConfigStore();

let route = useRoute();
let router = useRouter();

defineProps({
  storageId: {
    type: Number,
    required: false
  }
})

import useStoragePassword from "~/composables/admin/storage/storage-password.js";
const { loading, loadData, list,
		addItem, deleteItem, moveDown, moveUp,
		saveData } = useStoragePassword(router, route);

onMounted(() => {
	loadData();
  loadStorageItem();
})

const storageItem = ref();
// 加载指定存储源的数据
const loadStorageItem = () => {
  loadStorageItemReq(route.params.storageId).then((res) => {
    res.data.type = res.data.type.key;
    storageItem.value = res.data;
  })
}
</script>

<style lang="scss" scoped>
.zfile-admin-password-body {

  :deep(.el-form-sub-title) {
    max-width: 100%;
  }

  .rules-tips {
    @apply text-sm font-bold p-1;
  }

  .rules-tips-link {
    @apply space-x-5 mt-2;
    svg {
      height: 1rem;
      line-height: 1.25rem;
      vertical-align: text-bottom;
    }
  }
}

.el-table {
  // 去除每个单元格的左边距, 减少右边距
  :deep(.cell) {
    @apply pr-2 pl-0;
  }

  // 指定表格行高
  :deep(.el-table__row) {
    @apply h-16;
  }

  // 去除最后一行的底部边框
  :deep(.el-table__row:last-child .el-table__cell) {
    @apply border-b-0;
  }

  // 去除整个表格的底部边框
  :deep(.el-table__inner-wrapper::before) {
    content: none;
  }
}

// 添加更多按钮全宽度, 带边框
.add-more-btn {
  @apply mb-2 w-full border-dashed max-md:mt-2;
}

// 保存按钮居右显示
.save-btn {
  @apply flex;
  .el-button {
    @apply ml-auto;
  }
}
</style>


<route lang="yaml">
meta:
  layout: admin
  name: 编辑存储源
</route>