<template>
	<div>
		<el-card v-loading="loading">
			<div>
				<div class="flex justify-between">
					<h3 class="text-lg leading-6 font-medium text-gray-900">
						存储源信息
					</h3>
					<div class="hidden flex space-x-1.5 justify-center items-center cursor-pointer">
						<span :class="layout === 'card' ? 'current-layout' : ''" @click="changeLayout('card')"><i-custom-card-layout></i-custom-card-layout></span>
						<span :class="layout === 'table' ? 'current-layout' : ''" @click="changeLayout('table')"><i-custom-table-layout></i-custom-table-layout></span>
					</div>
				</div>
				<div class="my-2 text-sm text-gray-500 flex justify-between flex-wrap">
					<div>
						此页可以维护您的存储源信息，可以拖动交换存储源之间的顺序. 配置示例可参考：
						<a class="link" target="_blank" href="https://docs.zfile.vip/#/example">ZFile 存储源配置文档</a>
					</div>
					<div>
						<el-input placeholder="请输入搜索内容" v-model="searchKey" :prefix-icon="Search"></el-input>
					</div>
				</div>
			</div>
			<ul v-if="layout === 'card'" role="list" class="storage-container grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				<li v-for="storage in storageListSearchResult" :key="storage.id"
				    @dblclick="editStorage(storage)"
				    class="storage-item col-span-1 flex flex-col text-center bg-white rounded-lg border hover:shadow">
					<div class="flex-1 flex flex-col p-8 pb-4 relative">
						<svg-icon @click="deleteStorage(storage)" name="delete" class="absolute right-3 top-3 cursor-pointer"></svg-icon>
						<img class="w-20 h-20 flex-shrink-0 mx-auto" :src="getImg(storage.type.key)"/>
						<h3 class="mt-2 text-gray-900 text-sm font-medium">{{ storage.name }}</h3>
						<dl class="mt-1 flex-grow flex flex-col justify-between">
							<dd class="text-gray-500 text-sm line-clamp-1">
								{{ storage.remark }}
							</dd>
							<dd class="mt-2 space-x-1">
								<el-tag type="">{{storage.type.description}}</el-tag>
								<el-tag type="success" @click="switchEnableStatus(storage)" v-show="storage.enable">启用</el-tag>
								<el-tag type="danger" @click="switchEnableStatus(storage)" v-show="!storage.enable">停用</el-tag>
								<el-tag type="success" v-show="storage.enableCache">缓存</el-tag>

								<el-popover
									placement="top"
									title="刷新令牌成功"
									:width="200"
									trigger="hover"
								>
									<div>
										<div>上次刷新时间: {{storage?.refreshTokenInfo?.lastRefreshTime}}</div>
									</div>
									<template #reference>
										<el-tag type="success" v-show="storage?.refreshTokenInfo?.success">刷新令牌成功</el-tag>
									</template>
								</el-popover>
								<el-popover
									placement="top"
									title="刷新令牌失败"
									:width="200"
									trigger="hover"
								>
									<div>
										<div>上次刷新时间: {{storage?.refreshTokenInfo?.lastRefreshTime}}</div>
										<div>失败信息: {{storage?.refreshTokenInfo?.msg}}</div>
									</div>
									<template #reference>
										<el-tag type="danger" v-show="storage?.refreshTokenInfo?.success === false">刷新令牌失败</el-tag>
									</template>
								</el-popover>

							</dd>
						</dl>
					</div>
					<div class="mr-3 mb-3 flex  justify-end">
						<el-dropdown @command="handleOperator" class="cursor-pointer">
							<span class="text-sm font-medium text-blue-500">
								操作
						      <el-icon class="top-[2px] el-icon--right">
	                            <arrow-down />
						      </el-icon>
						    </span>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item :icon="Edit" :command="{operator: 'edit', storage}">编辑</el-dropdown-item>
									<el-dropdown-item v-if="!storage.enable" :icon="VideoPlay" :command="{operator: 'enable', storage}">启用</el-dropdown-item>
									<el-dropdown-item v-else :icon="VideoPause" :command="{operator: 'enable', storage}">停用</el-dropdown-item>
									<div class="divider"></div>
									<el-dropdown-item :icon="Document" :command="{operator: 'readmeManager', storage}">目录文档</el-dropdown-item>
									<el-dropdown-item :icon="View" :command="{operator: 'filterManager', storage}">文件过滤</el-dropdown-item>
									<el-dropdown-item :icon="Key" :command="{operator: 'pwdManager', storage}">密码设置</el-dropdown-item>
									<div class="divider"></div>
									<el-dropdown-item :icon="Delete" :command="{operator: 'delete', storage}">删除</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
					</div>
				</li>
				<el-popover
					placement="right"
					:width="200"
					trigger="hover"
					content="点击添加存储源">
					<template #reference>
						<li @click="addStorage" class="add-storage-btn cursor-pointer col-span-1 flex flex-col text-center bg-white rounded-lg border hover:shadow">
							<div class="flex-1 flex flex-col p-8 mx-auto justify-center">
								<el-icon size="150">
									<i-ep-plus class="text-gray-300"></i-ep-plus>
								</el-icon>
							</div>
						</li>
					</template>
				</el-popover>
			</ul>

			<el-table v-if="layout === 'table'" :data="storageListSearchResult">
				<el-table-column type="index" width="50"/>
				<el-table-column prop="name" label="名称"/>
				<el-table-column prop="key" label="别名"/>
				<el-table-column label="类型">
					<template #default="scope">
						{{ scope.row.type.description }}
					</template>
				</el-table-column>
				<el-table-column label="状态">
					<template #default="scope">
						<el-tag type="success" @click="switchEnableStatus(scope.row)" v-show="scope.row.enable">启用</el-tag>
						<el-tag type="danger" @click="switchEnableStatus(scope.row)" v-show="!scope.row.enable">停用</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="操作">
					<template #default="scope">
						<el-dropdown @command="handleOperator" class="cursor-pointer">
							<el-button size="small" type="primary">
								操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
							</el-button>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item :icon="Edit" :command="{operator: 'edit', storage: scope.row}">编辑</el-dropdown-item>
									<el-dropdown-item v-if="!scope.row.enable" :icon="VideoPlay" :command="{operator: 'enable', storage: scope.row}">启用</el-dropdown-item>
									<el-dropdown-item v-else :icon="VideoPause" :command="{operator: 'enable', storage: scope.row}">停用</el-dropdown-item>
									<div class="divider"></div>
									<el-dropdown-item :icon="Document" :command="{operator: 'readmeManager', storage: scope.row}">目录文档</el-dropdown-item>
									<el-dropdown-item :icon="View" :command="{operator: 'filterManager', storage: scope.row}">文件过滤</el-dropdown-item>
									<el-dropdown-item :icon="Key" :command="{operator: 'pwdManager', storage: scope.row}">密码设置</el-dropdown-item>
									<div class="divider"></div>
									<el-dropdown-item :icon="Delete" :command="{operator: 'delete', storage: scope.row}">删除</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

	</div>
</template>

<script setup>
import {Search, ArrowDown, Delete, Edit, Key, Lock, Operation, VideoPause, VideoPlay, View, Document} from '@element-plus/icons-vue'
let router = useRouter();

import useStorageList from "~/composables/admin/storage/storage-list";
const {
	init, loading, layout, changeLayout,
	searchKey, storageListSearchResult,
	handleOperator, editStorage,
	addStorage, deleteStorage,
	switchEnableStatus
} = useStorageList(router);

onMounted(() => {
	init();
})

const getImg = (name) => {
  const path = `/src/assets/icons/${name}.svg`;
  const modules = import.meta.globEager('/src/assets/icons/*');
  if (modules[path]) {
	  return modules[path].default;
  }
}
</script>

<style scoped>
.el-row {
	padding: 20px;
}

.el-form-item {
	margin-right: 50px;
}

.card-title {
	color: rgba(0, 0, 0, .45);
	font-size: 14px;
}

.card-content {
	color: rgba(0, 0, 0, .85);
	font-size: 25px;
	line-height: 30px;
}

.card-title-button {
	float: right;
	padding: 3px 0;
}

.table-search-input {
	width: 300px;
	float: right;
}

#filterForm .el-row {
	padding: 0;
}

#cacheDialog >>> .el-dialog__body {
	padding: 20px;
}

.table-edit-icon {
	margin-left: 5px;
	color: #409EFF;
	cursor: pointer;
}

.current-layout {
	color: #409EFF;
}

.storage-container li {
	@apply h-[17rem]
}

</style>


<route lang="yaml">
meta:
  layout: admin
  name: 存储源管理
</route>