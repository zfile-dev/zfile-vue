<template>
	<z-form :model="filterList"
	        class="zfile-admin-filter-form"
	        v-loading="loading">
		<template #form-title>
			<div class="flex justify-items-center">
				<router-link to="/admin/storage-list">
					<svg-icon class="inline mr-2 cursor-pointer" name="file-type-back"></svg-icon>
				</router-link>
				<span>过滤文件（{{storageItem?.name}}）</span>
			</div>
		</template>
		<template #form-sub-title>
			<el-alert :closable="false" type="info">
				<div class="rules-tips">Glob 表达式规则：</div>
				<div class="rules-tips"><b>*</b>：单级路径通配符，如表达式 <span class="select-all code">/*.jpg</span> 可以匹配根路径下所有的 jpg 后缀的文件</div>
				<div class="rules-tips"><b>**</b>：多级路径通配符，如表达式 <span class="select-all code">/**.jpg</span> 可以匹配所有路径下的 jpg 后缀的文件</div>
				<div class="rules-tips-link">
					<a target="_blank" class="link" href="http://www.ruanyifeng.com/blog/2018/09/bash-wildcards.html"><Collection class="inline mr-1"></Collection><span>参考文章 (Wikipedia)</span></a>
					<a target="_blank" class="link" href="http://www.ruanyifeng.com/blog/2018/09/bash-wildcards.html"><Collection class="inline mr-1"></Collection>参考文章 (阮一峰)</a>
					<a target="_blank" class="link" href="https://github.com/whinc/blog/issues/18"><Collection class="inline mr-1"></Collection>参考文章 (Github)</a>
				</div>
			</el-alert>
		</template>

		<z-form-item v-for="(item, index) in filterList"
		             :required="true"
		             :key="index"
		             class="expression-item">
			<div class="sm:flex sm:space-x-2 sm:border-b-0 sm:pb-0 border-b pb-2">
				<el-tooltip content="此处可填写表达书描述，用于辅助记忆，防止时间过长后不知道表达式含义." placement="top">
					<el-input :prefix-icon="Notebook" placeholder="请输入表达式描述" v-model="item.description"></el-input>
				</el-tooltip>
				<el-input :prefix-icon="FolderIcon" placeholder="请输入表达式" v-model.trim="item.expression"></el-input>
				<el-select class="editor-input" v-model="item.mode">
					<el-option label="仅隐藏" value="hidden"></el-option>
					<el-option label="隐藏并不可访问(针对目录)" value="inaccessible"></el-option>
					<el-option label="隐藏并不可访问不可下载(针对文件)" value="disable_download"></el-option>
				</el-select>
				<el-button type="danger" @click="deleteFilterItem(index)" :icon="Delete"></el-button>
			</div>
		</z-form-item>

		<z-form-item>
			<el-button type="primary" size="default" :icon="Plus" @click="addFilterItem">添加更多</el-button>
		</z-form-item>

		<template #footer>
			<el-button type="primary" size="default" :icon="CheckBadgeIcon" @click="saveFilterData">保存设置</el-button>
		</template>
	</z-form>
</template>

<script setup>
import {Plus, Delete, Collection, Notebook} from '@element-plus/icons-vue'
import {CheckBadgeIcon} from '@heroicons/vue/24/solid'
import {FolderIcon} from '@heroicons/vue/24/outline'

import ZForm from "/src/components/form/ZForm.vue";
import ZFormItem from "/src/components/form/ZFormItem.vue";

let route = useRoute();
let router = useRouter();
let currentStorageId = route.params.storageId;

import useStorageFilter from "~/composables/admin/storage/storage-filter.js";
import { loadStorageItemReq } from "~/api/admin-storage";
const { loading, loadFilterData, filterList,
		addFilterItem, deleteFilterItem,
		saveFilterData } = useStorageFilter(router, route);

onMounted(() => {
	loadFilterData();
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

</script>

<style lang="scss" scoped>
.expression-item {
	:deep(.el-input__wrapper) {
		@apply w-full sm:w-36 md:w-48 lg:w-64 xl:w-96
	}
}

.zfile-admin-filter-form {
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