<template>
  <Disclosure as="nav" class="bg-white shadow" v-slot="{ open }">
    <div class="max-w-7xl mx-auto px-4 xl:px-0">
      <div class="relative flex justify-between h-16">
        <div class="absolute inset-y-0 left-0 flex items-center md:hidden">
          <!-- Mobile menu button -->
          <DisclosureButton
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
            <span class="sr-only">Open main menu</span>
            <MenuIcon v-if="!open" class="block h-6 w-6" aria-hidden="true"/>
            <XIcon v-else class="block h-6 w-6" aria-hidden="true"/>
          </DisclosureButton>
        </div>
        <div class="flex-1 flex items-center justify-center md:items-stretch md:justify-start">
          <el-popover
            placement="bottom"
            width="200"
            :disabled="githubLatestLoading"
            trigger="hover">
            <div v-if="githubLatestInfo?.data" class="zfile-admin-index-version-info text-center">
              <div v-html="`当前版本：v${common.version}`"></div>
              <div v-html="`最新版：v${githubLatestInfo.data.tag_name}`"></div>
              <div v-html="`发布时间: ${common.dateFormat(githubLatestInfo.data.published_at)}`"></div>
              <br>
              文档地址：
              <el-link href="http://docs.zhaojun.im/zfile" target="_blank"
                       class="zfile-word-aux zfile-margin-left-unset">点击进入
              </el-link>
              <br>
              后端源码地址：
              <el-link href="https://github.com/zhaojun1998/zfile" target="_blank"
                       class="zfile-word-aux zfile-margin-left-unset">点击进入
              </el-link>
              <br>
              前端源码地址：
              <el-link href="https://github.com/zhaojun1998/zfile-vue" target="_blank"
                       class="zfile-word-aux zfile-margin-left-unset">点击进入
              </el-link>
            </div>

            <template #reference>
              <div @click="common.openPage('/')" class="cursor-pointer flex-shrink-0 flex items-center">
                <img class="block lg:hidden h-8 w-auto" src="../assets/icons/zfile-basic.svg"
                     alt="Workflow"/>
                <img class="hidden lg:block h-8 w-auto" src="../assets/icons/zfile-horizontal.svg"
                     alt="Workflow"/>
                <el-badge :is-dot="githubLatestInfo?.data?.tag_name && common.version !== githubLatestInfo?.data?.tag_name" class="hidden lg:block text-sm font-bold word ml-1 tracking-wider">
                  {{common.version}}
                </el-badge>
              </div>
            </template>
          </el-popover>

          <div class="hidden lg:ml-6 md:flex md:space-x-4 justify-center flex-1 lg:flex-none">
            <!-- Current: "border-indigo-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" -->
            <router-link to="/admin/site-setting"
                         :class="currentActive === '/admin/site-setting' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
                         class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              <el-icon size="18px">
                <i-ep-setting class="mr-1"/>
              </el-icon>
              基本设置
            </router-link>
            <router-link to="/admin/storage-list"
                         :class="currentActive.startsWith('/admin/storage') ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
                         class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              <el-icon size="18px">
                <i-ep-folder class="mr-1"/>
              </el-icon>
              存储源设置
            </router-link>
            <router-link to="/admin/view-setting"
                         :class="currentActive === '/admin/view-setting' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
                         class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              <el-icon size="18px">
                <i-ep-view class="mr-1"/>
              </el-icon>
              显示设置
            </router-link>

            <el-dropdown>
              <router-link to="/admin/download-link"
                           :class="currentActive.includes('/admin/download-link') ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
                           class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <el-icon size="18px">
                  <i-ep-link class="mr-1"/>
                </el-icon>
                直链管理
                <el-icon class="el-icon--right">
                  <i-ep-arrow-down />
                </el-icon>
              </router-link>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :icon="MenuAlt1Icon">
                    <router-link to="/admin/download-link">直链列表</router-link>
                  </el-dropdown-item>
                  <el-dropdown-item :icon="Tickets">
                    <router-link to="/admin/download-link/log">直链日志</router-link>
                  </el-dropdown-item>
                  <el-dropdown-item :icon="Setting">
                    <router-link to="/admin/download-link/setting">直链设置</router-link>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>


            <div @click="logDownload"
                 class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              <el-icon size="18px">
                <i-ep-download class="mr-1"/>
              </el-icon>
              日志下载
            </div>
          </div>
        </div>
        <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
          <!-- Profile dropdown -->
          <Menu as="div" class="ml-3 relative">
            <div>
              <MenuButton
                class="border-2 bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span class="sr-only">Open user menu</span>
                <img v-if="siteSetting?.data?.avatar" class="h-8 w-8 rounded-full"
                     :src="siteSetting.data.avatar"
                     alt=""/>
                <img v-else class="h-8 w-8 rounded-full"
                     src="../assets/image/avator.png"
                     alt=""/>
              </MenuButton>
            </div>
            <transition enter-active-class="transition ease-out duration-200"
                        enter-from-class="transform opacity-0 scale-95"
                        enter-to-class="transform opacity-100 scale-100"
                        leave-active-class="transition ease-in duration-75"
                        leave-from-class="transform opacity-100 scale-100"
                        leave-to-class="transform opacity-0 scale-95">
              <MenuItems
                class="z-10 origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div class="cursor-pointer border-b">
                  <MenuItem @click="common.openPage('https://docs.zfile.vip')" v-slot="{ active }">
                    <div
                      :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                      ZFile Docs
                    </div>
                  </MenuItem>
                  <MenuItem @click="common.openPage('https://github.com/zhaojun1998/zfile')" v-slot="{ active }">
                    <div
                      :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                      ZFile Github
                    </div>
                  </MenuItem>
                </div>
                <MenuItem v-slot="{ active }">
                  <router-link to="/admin/security-setting"
                               :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                    安全设置
                  </router-link>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <router-link to="/admin/update-password"
                               :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                    修改密码
                  </router-link>
                </MenuItem>
                <MenuItem @click="logout" v-slot="{ active }">
                  <a href="#"
                     :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">注销</a>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>
        </div>
      </div>
    </div>

    <DisclosurePanel class="md:hidden">
      <div class="pt-2 pb-4 space-y-1">
        <!-- Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" -->
        <DisclosureButton
          :class="currentActive === '/admin/site-setting' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'"
          as="a" class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
          <router-link to="/admin/site-setting">基本设置</router-link>
        </DisclosureButton>
        <DisclosureButton
          :class="currentActive.startsWith('/admin/storage') ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'"
          as="a" class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
          <router-link to="/admin/storage-list">存储源设置</router-link>
        </DisclosureButton>
        <DisclosureButton
          :class="currentActive === '/admin/view-setting' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'"
          as="a" class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
          <router-link to="/admin/view-setting">显示设置</router-link>
        </DisclosureButton>
        <DisclosureButton
          :class="currentActive === '/admin/download-link' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'"
          as="a" class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
          <router-link to="/admin/download-link">直链列表</router-link>
        </DisclosureButton>
        <DisclosureButton
          :class="currentActive === '/admin/download-link/log' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'"
          as="a" class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
          <router-link to="/admin/download-link/log">直链日志</router-link>
        </DisclosureButton>
        <DisclosureButton
          :class="currentActive === '/admin/download-link/setting' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'"
          as="a" class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
          <router-link to="/admin/download-link/setting">直链设置</router-link>
        </DisclosureButton>
        <DisclosureButton
          @click="logDownload"
          as="span" class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700">
          日志下载
        </DisclosureButton>
      </div>
    </DisclosurePanel>
  </Disclosure>

  <div class="p-0 sm:p-10 pb-16 sm:pb-26 bg-gray-100 h-full overflow-y-auto border-t-2">
    <div class="max-w-7xl mx-auto bg-white shadow overflow-hidden sm:rounded-lg">
      <router-view class="box animate__animated animate__fadeIn"/>
    </div>
  </div>
</template>

<script setup>
import useAdminLayout from "~/composables/admin/layout/admin-layout";

import {
  Disclosure, DisclosureButton, DisclosurePanel,
  Menu, MenuButton, MenuItem, MenuItems
} from '@headlessui/vue';

import { MenuAlt1Icon, XIcon, ArrowSmUpIcon, MenuIcon } from '@heroicons/vue/outline'

import { Setting, Tickets } from '@element-plus/icons-vue';

import common from "~/common";
let router = useRouter();
let route = useRoute();

const { siteSetting,
  githubLatestInfo, githubLatestLoading,
  logDownload,
  logout, rebuildTitle } = useAdminLayout(router, route);

/**
 * 记录当前切换到的路由, 并修改标题
 */
let currentActive = computed(() => route.path);

watch(() => route.path, () => {
  rebuildTitle();
}, {
  immediate: true
})

</script>

<style lang="scss" scoped>
</style>