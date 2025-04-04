<template>
  <div v-loading="loading">
    <admin-form-header title="存储源信息">
      <template #subTitle>
        <div class="flex justify-between items-center flex-wrap">
          <div>
            此页可以维护您的存储源信息，可以拖动交换存储源之间的顺序. 配置示例可参考：
            <a class="link" target="_blank" href="https://docs.zfile.vip/category/%E5%AD%98%E5%82%A8%E6%BA%90%E7%A4%BA%E4%BE%8B%E9%85%8D%E7%BD%AE">ZFile 存储源配置文档</a>
          </div>
          <div>
            <el-input placeholder="请输入搜索内容" v-model="searchKey" :prefix-icon="MagnifyingGlassIcon"></el-input>
          </div>
        </div>
      </template>
    </admin-form-header>

    <ul role="list" class="storage-container grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
      <li v-for="storage in storageListSearchResult" :key="storage.id"
          @dblclick="editStorage(storage)"
          class="storage-item group col-span-1 flex flex-col text-center bg-white rounded-lg border hover:shadow">
        <div class="flex-1 flex flex-col p-8 pb-4 relative">
          <i-material-symbols-open-in-new @click="openStorage(storage.key)" class="absolute left-3 top-3 text-sm cursor-pointer text-blue-500 opacity-0 group-hover:opacity-100" />
          <i-solar-trash-bin-minimalistic-bold @click="deleteStorage(storage)" name="delete" class="absolute right-3 top-3 cursor-pointer group-hover:text-red-500" />

          <div class="rounded-full bg-blue-50 w-fit mx-auto">
            <img class="w-20 h-20 flex-shrink-0 mx-auto p-4" :src="getImg(storage.type.key)"/>
          </div>
          <h3 class="mt-2 text-gray-900 text-sm font-medium">{{ storage.name }}</h3>
          <dl class="mt-1 flex-grow flex flex-col justify-between">
            <dd class="text-gray-500 text-sm line-clamp-1">
              {{ storage.remark }}
            </dd>
            <dd class="mt-2 space-x-1">
              <el-tag type="primary">{{storage.type.description}}</el-tag>
              <el-tag type="success" @click="switchEnableStatus(storage)" v-show="storage.enable">启用</el-tag>
              <el-tag type="danger" @click="switchEnableStatus(storage)" v-show="!storage.enable">停用</el-tag>
              <el-tag type="success" v-show="storage.enableCache">缓存</el-tag>

              <el-popover
                placement="top"
                :width="250"
                trigger="hover">
                <div>
                  <div class="text-sm font-medium">
                    <i-clarity-success-standard-solid class="inline text-green-500" />
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
                    <i-clarity-error-standard-solid class="inline text-red-500" />
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
            <span class="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-2 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500 ml-3">
              <i-mdi-rename-outline class="mr-2" />
              <span>编辑</span>
            </span>
          </div>
          <el-dropdown @command="handleOperator" class="cursor-pointer flex-1">
            <div class="w-0 flex-1 flex cursor-pointer">
              <span class="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-2 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500 ml-3">
                  <span class="text-sm font-medium">
                    <i-material-symbols-more-horiz class="mr-2 inline" />
                    <span>更多</span>
                  </span>
              </span>
            </div>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="PencilIcon" :command="{operator: 'edit', storage}">编辑</el-dropdown-item>
                <el-dropdown-item v-if="!storage.enable" :icon="PlayCircleIcon" :command="{operator: 'enable', storage}">启用</el-dropdown-item>
                <el-dropdown-item v-else :icon="PauseCircleIcon" :command="{operator: 'enable', storage}">停用</el-dropdown-item>
                <div class="divider"></div>
                <el-dropdown-item :icon="LockOpenIcon" :command="{operator: 'permissionManager', storage}">
                  <span class="line-through">权限管理</span>
                </el-dropdown-item>
                <div class="divider"></div>
                <!--<el-dropdown-item :icon="Operation" :command="{operator: 'cacheManager', storage}">缓存管理</el-dropdown-item>-->
                <el-dropdown-item :icon="DocumentTextIcon" :command="{operator: 'readmeManager', storage}">目录文档</el-dropdown-item>
                <el-dropdown-item :icon="EyeSlashIcon" :command="{operator: 'filterManager', storage}">文件过滤</el-dropdown-item>
                <el-dropdown-item :icon="KeyIcon" :command="{operator: 'pwdManager', storage}">密码设置</el-dropdown-item>
                <div class="divider"></div>
                <el-dropdown-item :icon="ClipboardDocumentIcon" :command="{operator: 'copy', storage}">复制存储源</el-dropdown-item>
                <div class="divider"></div>
                <el-dropdown-item :icon="TrashIcon" :command="{operator: 'delete', storage}">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </li>
      <li @click="addStorage" class="add-storage-btn cursor-pointer col-span-1 flex flex-col text-center bg-white rounded-lg border hover:shadow">
        <div class="flex-1 flex flex-col p-8 mx-auto justify-center">
          <PlusIcon class="h-20 text-gray-300" />
        </div>
      </li>
    </ul>
  </div>
  <storage-copy @close="init"></storage-copy>
</template>

<script setup>
import { PencilIcon, MagnifyingGlassIcon, TrashIcon, KeyIcon,
    LockOpenIcon, PauseCircleIcon, PlayCircleIcon, EyeSlashIcon,
    DocumentTextIcon, ClipboardDocumentIcon, PlusIcon } from '@heroicons/vue/24/outline'
import StorageCopy from '~/pages/admin/storage-copy/index.vue'

let router = useRouter();
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
  const path = `/src/assets/icons/storage-${name}.svg`;
  const modules = import.meta.globEager('/src/assets/icons/*');
  if (modules[path]) {
	  return modules[path].default;
  }
}
</script>

<style scoped>
.storage-container li {
	@apply h-72;
}
</style>


<route lang="yaml">
meta:
  layout: admin
  name: 存储源管理
</route>
