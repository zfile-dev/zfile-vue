<template>
	<div>
		<el-card v-loading="loading">
			<div>
				<div class="flex justify-between">
					<h3 class="text-lg leading-6 font-medium text-gray-900">
						存储源信息
					</h3>
				</div>
				<div class="my-2 text-sm text-gray-500 flex justify-between flex-wrap">
					<div>
						此页可以维护您的存储源信息，可以拖动交换存储源之间的顺序. 配置示例可参考：
						<a class="link" target="_blank" href="https://docs.zfile.vip/example">ZFile 存储源配置文档</a>
					</div>
					<div>
						<el-input placeholder="请输入搜索内容" v-model="searchKey" :prefix-icon="Search"></el-input>
					</div>
				</div>
			</div>
			<ul role="list" class="storage-container grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				<li v-for="storage in storageListSearchResult" :key="storage.id"
				    @dblclick="editStorage(storage)"
				    class="storage-item group col-span-1 flex flex-col text-center bg-white rounded-lg border hover:shadow">
					<div class="flex-1 flex flex-col p-8 pb-4 relative">
            <svg-icon @click="openStorage(storage.key)" name="target" class="absolute left-3 top-3 text-sm cursor-pointer text-blue-500 opacity-0 group-hover:opacity-100"></svg-icon>
						<svg-icon @click="deleteStorage(storage)" name="delete" class="absolute right-3 top-3 cursor-pointer group-hover:text-red-500"></svg-icon>
            <div class="rounded-full bg-blue-50 w-fit mx-auto">
						  <img class="w-20 h-20 flex-shrink-0 mx-auto p-4" :src="getImg(storage.type.key)"/>
            </div>
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
									:width="250"
									trigger="hover">
									<div>
                    <div class="text-sm font-medium">
                      <svg-icon name="check" class="inline text-green-500"/>
                      刷新令牌成功
                    </div>
										<div class="text-xs text-gray-500">上次刷新时间: {{storage?.refreshTokenInfo?.lastRefreshTime}}</div>
									</div>
									<template #reference>
										<el-tag type="success" v-show="storage?.refreshTokenInfo?.success">刷新令牌成功</el-tag>
									</template>
								</el-popover>
                <el-popover
                  placement="top"
                  :width="250"
                  trigger="hover">
                  <div>
                    <div class="text-sm font-medium">
                      <svg-icon name="error" class="inline text-red-500"/>
                      刷新令牌失败
                    </div>
                    <div class="text-xs text-gray-500">上次刷新时间: {{storage?.refreshTokenInfo?.lastRefreshTime}}</div>
                    <div class="text-xs text-red-500">失败信息: {{storage?.refreshTokenInfo?.msg}}</div>
                  </div>
                  <template #reference>
										<el-tag type="danger" v-show="storage?.refreshTokenInfo?.success === false">刷新令牌失败</el-tag>
                  </template>
                </el-popover>
							</dd>
						</dl>
					</div>
          <div class="-mt-px border-t flex divide-x divide-gray-200">
            <div @click="editStorage(storage)" class="w-0 flex-1 flex cursor-pointer">
              <span class="hover:text-blue-500 relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-2 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500 ml-3">
                <el-icon class="mr-2">
                  <Edit/>
                </el-icon>
                编辑
              </span>
            </div>
            <el-dropdown @command="handleOperator" class="cursor-pointer flex-1">
              <div class="w-0 flex-1 flex cursor-pointer">
                <span class="hover:text-blue-500 relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-2 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500 ml-3">
                    <span class="text-sm font-medium">
                      <el-icon class="mr-2">
                        <MoreFilled/>
                      </el-icon>
                      <span>更多</span>
                    </span>
                </span>
              </div>

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
                  <el-dropdown-item :icon="CopyDocument" :command="{operator: 'copy', storage}">复制存储源</el-dropdown-item>
									<div class="divider"></div>
									<el-dropdown-item :icon="Delete" :command="{operator: 'delete', storage}">删除</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
					</div>
				</li>
        <li @click="addStorage" class="add-storage-btn cursor-pointer col-span-1 flex flex-col text-center bg-white rounded-lg border hover:shadow">
          <div class="flex-1 flex flex-col p-8 mx-auto justify-center">
            <Plus class="h-20 text-gray-300" />
          </div>
        </li>
			</ul>
		</el-card>
    <storage-copy @close="init"></storage-copy>
	</div>
</template>

<script setup>
import {Search, Delete, Edit, Key, Lock, VideoPause, VideoPlay, View, Document, Plus, MoreFilled, CopyDocument} from '@element-plus/icons-vue'
let router = useRouter();

import StorageCopy from '~/pages/admin/storage-copy/index.vue'

import useStorageList from "~/composables/admin/storage/storage-list";
const {
	init, loading,
	searchKey, storageListSearchResult,
	handleOperator, editStorage,
	addStorage, deleteStorage,
	switchEnableStatus
} = useStorageList(router);

onMounted(() => {
	init();
})

const openStorage = (key) => {
  window.open(`/${key}`);
}

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
