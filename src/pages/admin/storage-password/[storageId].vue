<template>
	<z-form :model="passwordList"
	        class="zfile-admin-password-form"
	        v-loading="loading">
		<template #form-title>
			<div class="flex justify-items-center">
				<router-link to="/admin/storage-list">
					<svg-icon class="inline mr-2 cursor-pointer" name="file-type-back"></svg-icon>
				</router-link>
				<span>密码文件夹</span>
			</div>
		</template>
		<template #form-sub-title>
			<el-alert :closable="false" type="info">
				<div class="rules-tips">Glob 表达式规则：</div>
				<div class="rules-tips"><b>/</b>: 单层根目录加密, 如 /, 表示根路径下需要密码访问.</div>
        <div class="rules-tips"><b>/music*</b>: 单层子目录加密, 如 /music*, 表示根目录下的 music 文件夹需要密码访问, 子文件夹不加密.</div>
        <div class="rules-tips"><b>/music**</b>: 嵌套子目录加密, 如 /music**, 表示根目录下的 music 文件夹及其所有子文件夹都需要密码访问.</div>
				<div class="rules-tips">注：系统匹配到第一个符合的规则就会取密码进行校验，并返回结果，所以请调整好规则顺序，下方规则可进行拖拽排序。</div>
				<div class="rules-tips-link">
					<a target="_blank" class="link" href="http://www.ruanyifeng.com/blog/2018/09/bash-wildcards.html"><Collection class="inline mr-1"></Collection><span>参考文章 (Wikipedia)</span></a>
					<a target="_blank" class="link" href="http://www.ruanyifeng.com/blog/2018/09/bash-wildcards.html"><Collection class="inline mr-1"></Collection>参考文章 (阮一峰)</a>
					<a target="_blank" class="link" href="https://github.com/whinc/blog/issues/18"><Collection class="inline mr-1"></Collection>参考文章 (Github)</a>
				</div>
			</el-alert>
		</template>

		<z-form-item v-for="(item, index) in passwordList"
		             :required="true"
		             :key="item"
		             class="expression-item">
			<div class="sm:flex sm:space-x-2 sm:border-b-0 sm:pb-0 border-b pb-2">
				<el-tooltip content="此处可填写表达书描述，用于辅助记忆，防止时间过长后不知道表达式含义." placement="top">
					<el-input :prefix-icon="Notebook" placeholder="请输入表达式描述" v-model="item.description"></el-input>
				</el-tooltip>
				<el-input :prefix-icon="FolderIcon" placeholder="请输入表达式" v-model="item.expression"></el-input>
				<el-input :prefix-icon="KeyIcon" placeholder="请输入密码" type="password" show-password v-model="item.password"></el-input>
				<el-button type="danger" @click="deletePasswordItem(index)" :icon="Delete"></el-button>
			</div>
		</z-form-item>

		<z-form-item>
			<el-button type="primary" size="default" :icon="Plus" @click="addPasswordItem">添加更多</el-button>
		</z-form-item>

		<template #footer>
			<el-button type="primary" size="default" :icon="BadgeCheckIcon" @click="savePasswordData">保存设置</el-button>
		</template>
	</z-form>
</template>

<script setup>
import {Plus, Delete, Collection, Notebook} from '@element-plus/icons-vue'
import {BadgeCheckIcon} from '@heroicons/vue/solid'
import {KeyIcon, FolderIcon} from '@heroicons/vue/outline'
import ZForm from "/src/components/form/ZForm.vue";
import ZFormItem from "/src/components/form/ZFormItem.vue";

let route = useRoute();
let router = useRouter();

import useStoragePassword from "~/composables/admin/storage/storage-password.js";
const { loading, loadPasswordData, passwordList,
		addPasswordItem, deletePasswordItem,
		savePasswordData } = useStoragePassword(router, route);

onMounted(() => {
	loadPasswordData();
})
</script>

<style lang="scss" scoped>
.expression-item {
	:deep(.el-input__wrapper) {
		@apply w-full sm:w-36 md:w-48 lg:w-64 xl:w-80
	}
}

.zfile-admin-password-form {
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