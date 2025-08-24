<template>
  <div class="zfile-admin-readme-body">
    <admin-form-header v-if="storageItem">
      <template #title>
        <div class="flex justify-between justify-items-center">
          <div class="flex justify-items-center cursor-pointer my-auto">
            <router-link to="/admin/storage-list">
              <i-mdi-arrow-left class="my-auto h-full mr-2" />
            </router-link>
            <span>目录文档（{{storageItem.name}}）</span>
          </div>
          <el-tooltip placement="top" content="启用后下发的规则设置会失效，仅会为读取目录下的 readme.md 文件来渲染文档, 且固定在底部显示.">
            <div>
              <span class="mr-4 text-sm text-gray-500">兼容为读取 readme.md</span>
              <el-switch @change="changeCompatibilityReadmeStatus"
                         active-text="是"
                         inline-prompt
                         inactive-text="否"
                         v-model="storageItem.compatibilityReadme"></el-switch>
            </div>
          </el-tooltip>
        </div>
      </template>
      <template #subTitle>
        <el-alert :closable="false" type="info">
          <div class="rules-tips">Glob 表达式规则：</div>
          <div class="rules-tips"><b>/</b>: 根目录, 如 <span class="code select-all">/</span> 表示根路径下会加载此文档显示.</div>
          <div class="rules-tips"><b>*</b>：单级路径通配符，如表达式 <span class="code select-all">/*</span> 表示根路径下的直接子文件夹会加载此文档显示.</div>
          <div class="rules-tips"><b>**</b>：多级路径通配符，如表达式 <span class="code select-all">/music/**</span> 表示 /music 文件夹及以下所有文件夹都会加载此文档.</div>
          <div class="rules-tips">注：系统匹配到第一个符合的规则就会取文档进行显示，所以请调整好规则顺序，下方规则可进行拖拽排序。</div>

          <div class="rules-tips mt-4">路径模式：针对在 <span class="code select-all">用户管理</span> -> <span class="code select-all">编辑用户</span> -> <span class="code select-all">授予根目录</span> 为不同用户配置了不同根路径的场景.</div>
          <div class="rules-tips">如：为 admin 配置某存储源根目录为 <span class="code select-all">/</span>，为 guest 配置某存储源根目录为 <span class="code select-all">/music</span></div>
          <div class="rules-tips">- 相对路径：目录文档表达式填写 / 时，admin 和 guest 访问各自的 / 目录都能看到该目录文档。</div>
          <div class="rules-tips">- 绝对路径：目录文档表达式填写 / 时，admin 访问 / 目录能看到该目录文档，而 guest 访问 / 目录时看不到。</div>
          <div class="rules-tips">- 绝对路径：目录文档表达式填写 /music 时，admin 访问 /music 目录与 guest 访问 / 目录时都能看到该目录文档。</div>
          <div class="rules-tips-link">
            <a target="_blank" class="link" href="http://www.ruanyifeng.com/blog/2018/09/bash-wildcards.html"><DocumentMagnifyingGlassIcon class="inline mr-1"></DocumentMagnifyingGlassIcon><span>参考文章 (Wikipedia)</span></a>
            <a target="_blank" class="link" href="http://www.ruanyifeng.com/blog/2018/09/bash-wildcards.html"><DocumentMagnifyingGlassIcon class="inline mr-1"></DocumentMagnifyingGlassIcon>参考文章 (阮一峰)</a>
            <a target="_blank" class="link" href="https://github.com/whinc/blog/issues/18"><DocumentMagnifyingGlassIcon class="inline mr-1"></DocumentMagnifyingGlassIcon>参考文章 (Github)</a>
          </div>
        </el-alert>
      </template>
    </admin-form-header>

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
      <el-table-column-plus label="目录文档" prop="readmeText">
        <template #default="scope">
          <el-input @click="openReadmeEditor(scope.row)" readonly :prefix-icon="DocumentTextIcon" placeholder="请点击编辑文档" v-model="scope.row.readmeText" />
        </template>
      </el-table-column-plus>
      <el-table-column-plus label="路径模式" width="120" prop="pathMode">
	      <template #default="scope">
		      <el-select v-model="scope.row.pathMode">
			      <el-option label="相对路径" value="relative" />
			      <el-option label="绝对路径" value="absolute" />
		      </el-select>
	      </template>
      </el-table-column-plus>
      <el-table-column-plus label="显示位置" width="120" prop="displayMode">
        <template #default="scope">
          <el-select v-model="scope.row.displayMode">
            <el-option label="顶部显示" value="top" />
            <el-option label="底部显示" value="bottom" />
            <el-option label="弹窗显示" value="dialog" />
          </el-select>
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

  <readme-editor-dialog
    v-if="editorVisible"
    v-model="currentEditorRow.readmeText"
    v-model:visible="editorVisible" />
</template>

<script setup>
import {CheckBadgeIcon, ArrowUpIcon, ArrowDownIcon} from '@heroicons/vue/24/solid'
import {FolderIcon, PlusIcon, TrashIcon, DocumentMinusIcon, DocumentTextIcon, DocumentMagnifyingGlassIcon } from '@heroicons/vue/24/outline'

import { changeCompatibilityReadmeEnableReq, loadStorageItemReq } from "~/api/admin/admin-storage";

import { isMobile } from "~/utils";

import ReadmeEditorDialog from "./readme-editor-dialog.vue";

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

onMounted(() => {
  loadData();
  loadStorageItem();
})

import useStorageReadme from "~/composables/admin/storage/storage-readme.js";
const { loading, loadData, list,
	addItem, deleteItem, moveUp, moveDown,
	saveData } = useStorageReadme(router, route);

const storageItem = ref();
// 加载指定存储源的数据
const loadStorageItem = () => {
  loadStorageItemReq(route.params.storageId).then((res) => {
    res.data.type = res.data.type.key;
    storageItem.value = res.data;
  })
}

const changeCompatibilityReadmeStatus = () => {
  changeCompatibilityReadmeEnableReq(route.params.storageId, storageItem.value.compatibilityReadme).then((res) => {
    ElMessage.success("保存成功");
  })
}

let currentEditorRow = ref({});
let editorVisible = ref(false);

const openReadmeEditor = (row) => {
  editorVisible.value = true;
  currentEditorRow.value = row;
}
</script>

<style lang="scss" scoped>
.zfile-admin-readme-body {

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