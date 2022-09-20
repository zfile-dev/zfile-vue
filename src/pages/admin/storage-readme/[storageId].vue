<template>
	<z-form :model="readmeList"
	        class="zfile-admin-readme-form"
	        v-loading="loading">
		<template #form-title>
			<div class="flex justify-between">
				<div>
					<router-link to="/admin/storage-list">
						<svg-icon class="inline mr-2 cursor-pointer" name="file-type-back"></svg-icon>
					</router-link>
					<span>目录文档（{{storageItem?.name}}）</span>
				</div>
        <el-tooltip placement="top" content="启用后下发的规则设置会失效，仅会为读取目录下的 readme.md 文件来渲染文档, 且固定在底部显示.">
          <div>
            <span class="mr-4 text-sm text-gray-500">兼容为读取 readme.md</span>
            <el-switch @change="changeCompatibilityReadmeStatus"
                       active-text="是"
                       inline-prompt
                       inactive-text="否"
                       v-model="compatibilityReadme"></el-switch>
          </div>
        </el-tooltip>
			</div>
		</template>
		<template #form-sub-title>
			<el-alert :closable="false" type="info">
				<div class="rules-tips">Glob 表达式规则：</div>
				<div class="rules-tips"><b>/</b>: 根目录, 如 <span class="code select-all">/</span> 表示根路径下会加载此文档显示.</div>
        <div class="rules-tips"><b>*</b>：单级路径通配符，如表达式 <span class="code select-all">/*</span> 表示根路径下的直接子文件夹会加载此文档显示.</div>
        <div class="rules-tips"><b>**</b>：多级路径通配符，如表达式 <span class="code select-all">/music/**</span> 表示 /music 文件夹及以下所有文件夹都会加载此文档.</div>
				<div class="rules-tips">注：系统匹配到第一个符合的规则就会取文档进行显示，所以请调整好规则顺序，下方规则可进行拖拽排序。</div>
				<div class="rules-tips-link">
					<a target="_blank" class="link" href="http://www.ruanyifeng.com/blog/2018/09/bash-wildcards.html"><Collection class="inline mr-1"></Collection><span>参考文章 (Wikipedia)</span></a>
					<a target="_blank" class="link" href="http://www.ruanyifeng.com/blog/2018/09/bash-wildcards.html"><Collection class="inline mr-1"></Collection>参考文章 (阮一峰)</a>
					<a target="_blank" class="link" href="https://github.com/whinc/blog/issues/18"><Collection class="inline mr-1"></Collection>参考文章 (Github)</a>
				</div>
			</el-alert>
		</template>

		<z-form-item v-for="(item, index) in readmeList"
		             :required="true"
		             :key="item"
		             class="expression-item">
			<div class="sm:flex sm:space-x-2 sm:border-b-0 sm:pb-0 border-b pb-2">
				<el-tooltip content="此处可填写表达书描述，用于辅助记忆，防止时间过长后不知道表达式含义." placement="top">
					<el-input :prefix-icon="Notebook" placeholder="请输入表达式描述" v-model="item.description"></el-input>
				</el-tooltip>
				<el-input :prefix-icon="FolderIcon" placeholder="请输入表达式" v-model="item.expression"></el-input>
				<el-input class="editor-input" @click="openReadmeEditor(item)" readonly :prefix-icon="Document" placeholder="请点击编辑文档" v-model="item.readmeText"></el-input>
				<el-select class="editor-input" v-model="item.displayMode">
					<el-option label="顶部显示" value="top"></el-option>
					<el-option label="底部显示" value="bottom"></el-option>
					<el-option label="弹窗显示" value="dialog"></el-option>
				</el-select>

				<el-button type="danger" @click="deleteReadmeItem(index)" :icon="Delete"></el-button>
			</div>
		</z-form-item>

		<z-form-item>
			<el-button type="primary" size="default" :icon="Plus" @click="addReadmeItem">添加更多</el-button>
		</z-form-item>

		<template #footer>
			<el-button type="primary" size="default" :icon="BadgeCheckIcon" @click="saveReadmeData">保存设置</el-button>
		</template>

		<readme-editor-dialog
			v-if="editorVisible"
			v-model="currentEditorRow.readmeText"
			v-model:visible="editorVisible"></readme-editor-dialog>
	</z-form>
</template>

<script setup>
import {Plus, Delete, Collection, Notebook, Document} from '@element-plus/icons-vue'
import {BadgeCheckIcon} from '@heroicons/vue/solid'
import {FolderIcon} from '@heroicons/vue/outline'
import ZForm from "/src/components/form/ZForm.vue";
import ZFormItem from "/src/components/form/ZFormItem.vue";

let route = useRoute();
let router = useRouter();
let currentStorageId = route.params.storageId;

import useStorageReadme from "~/composables/admin/storage/storage-readme.js";

import ReadmeEditorDialog from "./readme-editor-dialog.vue";
import { changeCompatibilityReadmeEnableReq, loadStorageItemReq } from "~/api/admin-storage";
const { loading, loadReadmeData, readmeList,
	addReadmeItem, deleteReadmeItem,
	saveReadmeData } = useStorageReadme(router, route);

onMounted(() => {
	loadReadmeData();
  loadStorageItem();
})

const storageItem = ref();
// 加载指定存储源的数据
const loadStorageItem = () => {
  loadStorageItemReq(currentStorageId).then((res) => {
    res.data.type = res.data.type.key;
    storageItem.value = res.data;
  })
}

let compatibilityReadme = ref(false);
loadStorageItemReq(route.params.storageId).then((res) => {
  compatibilityReadme.value = res.data.compatibilityReadme || false;
})

const changeCompatibilityReadmeStatus = () => {
  changeCompatibilityReadmeEnableReq(route.params.storageId, compatibilityReadme.value).then((res) => {
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
.expression-item {
	:deep(.el-input__wrapper) {
		@apply w-full sm:w-24 md:w-36 lg:w-48 xl:w-64
	}
}

.zfile-admin-readme-form {
	:deep(.z-form-sub-title) {
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
</style>


<route lang="yaml">
meta:
  layout: admin
  name: 编辑存储源
</route>