<template>
  <!--
    This example requires updating your template:

    ```
    <html class="h-full bg-white">
    <body class="h-full">
    ```
  -->
  <div class="h-full">
    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog as="div" class="relative z-50 lg:hidden" @close="sidebarOpen = false">
        <TransitionChild as="template" enter="transition-opacity ease-linear duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="transition-opacity ease-linear duration-300" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-gray-900/80" />
        </TransitionChild>

        <div class="fixed inset-0 flex">
          <TransitionChild as="template" enter="transition ease-in-out duration-300 transform" enter-from="-translate-x-full" enter-to="translate-x-0" leave="transition ease-in-out duration-300 transform" leave-from="translate-x-0" leave-to="-translate-x-full">
            <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
              <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0">
                <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
                    <span class="sr-only">Close sidebar</span>
                    <XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </TransitionChild>
              <!-- Sidebar component, swap this element with another sidebar if you like -->
              <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                <div class="flex h-16 shrink-0 items-center">
                  <img class="h-8 w-auto" src="../assets/icons/zfile-horizontal.svg" alt="Your Company" />
                </div>
                <nav class="flex flex-1 flex-col">
                  <ul role="list" class="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" class="-mx-2 space-y-1">
                        <li v-for="item in navigation" :key="item.id">
                          <router-link :to="item.href" :class="[item.href === route.path ? 'bg-gray-50 text-indigo-600' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
                            <component :is="item.icon" :class="[item.href === route.path ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600', 'h-6 w-6 shrink-0']" aria-hidden="true" />
                            {{ item.name }}
                          </router-link>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <div class="text-xs font-semibold leading-6 text-gray-400">链接管理</div>
                      <ul role="list" class="-mx-2 mt-2 space-y-1">
                        <li v-for="item in links" :key="item.id">
                          <router-link :to="item.href" :class="[item.href === route.path ? 'bg-gray-50 text-indigo-600' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
                            <component :is="item.icon" :class="[item.href === route.path ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600', 'h-6 w-6 shrink-0']" aria-hidden="true" />
                            <span class="truncate">{{ item.name }}</span>
                          </router-link>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <div class="text-xs font-semibold leading-6 text-gray-400">系统设置</div>
                      <ul role="list" class="-mx-2 mt-2 space-y-1">
                        <li v-for="item in settings" :key="item.id" @click="item.onClick">
                          <router-link :to="item.href" :class="[item.href === route.path ? 'bg-gray-50 text-indigo-600' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
                            <component :is="item.icon" :class="[item.href === route.path ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600', 'h-6 w-6 shrink-0']" aria-hidden="true" />
                            <span class="truncate">{{ item.name }}</span>
                          </router-link>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Static sidebar for desktop -->
    <div class="hidden lg:fixed lg:inset-y-0 lg:z-auto lg:flex lg:w-72 lg:flex-col">
      <!-- Sidebar component, swap this element with another sidebar if you like -->
      <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
        <div class="flex h-16 shrink-0 items-center">
          <div @click="openHomePage" class="cursor-pointer flex-shrink-0 flex items-center">
            <img class="h-8 w-auto" src="../assets/icons/zfile-horizontal.svg" alt="ZFile" />
          </div>
          <div @click="openChangeLog" class="cursor-pointer flex-shrink-0 flex items-center">
            <el-badge class="hidden lg:block text-sm font-bold word ml-1 tracking-wider">
              {{constant.version}}
            </el-badge>
          </div>
        </div>
        <nav class="flex flex-1 flex-col">
          <ul role="list" class="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" class="-mx-2 space-y-1">
                <li v-for="item in navigation" :key="item.id">
                  <router-link :to="item.href" :class="[item.href === route.path ? 'bg-gray-50 text-indigo-600' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
                    <component :is="item.icon" :class="[item.href === route.path ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600', 'h-6 w-6 shrink-0']" aria-hidden="true" />
                    {{ item.name }}
                  </router-link>
                </li>
              </ul>
            </li>
            <li>
              <div class="text-xs font-semibold leading-6 text-gray-400">链接管理</div>
              <ul role="list" class="-mx-2 mt-2 space-y-1">
                <li v-for="item in links" :key="item.id">
                  <router-link :to="item.href" :class="[item.href === route.path ? 'bg-gray-50 text-indigo-600' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
                    <component :is="item.icon" :class="[item.href === route.path ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600', 'h-6 w-6 shrink-0']" aria-hidden="true" />
                    <span class="truncate">{{ item.name }}</span>
                  </router-link>
                </li>
              </ul>
            </li>
            <li>
              <div class="text-xs font-semibold leading-6 text-gray-400">系统设置</div>
              <ul role="list" class="-mx-2 mt-2 space-y-1">
                <li v-for="item in settings" :key="item.id" @click="item.onClick">
                  <router-link :to="item.href" :class="[item.href === route.path ? 'bg-gray-50 text-indigo-600' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
                    <component :is="item.icon" :class="[item.href === route.path ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600', 'h-6 w-6 shrink-0']" aria-hidden="true" />
                    <span class="truncate">{{ item.name }}</span>
                  </router-link>
                </li>
              </ul>
            </li>
            <li class="mt-auto flex justify-center space-x-5 px-6 mb-5">
              <a class="cursor-pointer" title="Github" target="_blank" href="https://github.com/zfile-dev/zfile">
                <img class="w-8 h-8" src="../assets/icons/github.svg" />
              </a>
              <a class="cursor-pointer" title="ZFile 文档" target="_blank" href="https://github.com/zfile-dev/zfile">
                <BookOpenIcon class="w-8 h-8" />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <div class="sticky top-0 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
      <button type="button" class="-m-2.5 p-2.5 text-gray-700 lg:hidden" @click="sidebarOpen = true">
        <span class="sr-only">Open sidebar</span>
        <Bars3Icon class="h-6 w-6" aria-hidden="true" />
      </button>
      <div class="mx-auto flex space-x-2">
        <div @click="openHomePage" class="cursor-pointer flex-shrink-0 flex items-center">
          <img class="h-8 w-auto" src="../assets/icons/zfile-basic.svg" alt="ZFile" />
        </div>
        <div @click="openChangeLog" class="cursor-pointer flex-shrink-0 flex items-center">
          <el-badge class="hidden lg:block text-sm font-bold word tracking-wider">
            {{constant.version}}
          </el-badge>
        </div>
      </div>
    </div>

    <main class="admin-main-content pb-16 sm:pt-10 sm:pb-26 lg:py-10 lg:pl-72 bg-gray-50 h-full overflow-y-auto">
      <div class="bg-white shadow h-full min-h-full sm:mx-10 sm:h-auto sm:rounded-lg sm:px-6 lg:px-8 ">
        <div class="box animate__animated animate__fadeIn z-admin-body-wrapper">
          <router-view />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { openPage } from "~/utils";
import useAdminLayout from "~/composables/admin/layout/admin-layout";
import {
  Dialog, DialogPanel, TransitionChild, TransitionRoot
} from "@headlessui/vue";

import useAdminSetting from "~/composables/admin/useAdminSetting";
const { siteSetting } = useAdminSetting();

import {
  DocumentTextIcon, Cog8ToothIcon, XMarkIcon,
  Bars3Icon, CircleStackIcon, EyeIcon,
  BookOpenIcon, UsersIcon, ShieldCheckIcon, ArrowRightOnRectangleIcon,
  DocumentArrowDownIcon, TableCellsIcon,
  PresentationChartBarIcon, ComputerDesktopIcon, ArrowLeftOnRectangleIcon
} from "@heroicons/vue/24/outline";
import { logoutReq } from "~/api/home/user";

let router = useRouter();
let route = useRoute();

const sidebarOpen = ref(false)

/**
 * 记录当前切换到的路由, 并修改标题
 */
const { rebuildTitle, logDownload } = useAdminLayout(router, route);

watch(() => route.path, () => {
  rebuildTitle();
}, {
  immediate: true
})

const navigation = ref([
  { id: 1, name: '站点设置', href: '/admin/site-setting', icon: Cog8ToothIcon },
  { id: 2, name: '存储源设置', href: '/admin/storage-list', icon: CircleStackIcon },
  { id: 3, name: '显示设置', href: '/admin/view-setting', icon: EyeIcon },
])
const links = ref([
  { id: 1, name: '直/短链设置', href: '/admin/download-link/setting', icon: Cog8ToothIcon },
  { id: 2, name: '短链管理', href: '/admin/download-link', icon: TableCellsIcon },
  { id: 3, name: '下载日志', href: '/admin/download-link/log', icon: DocumentTextIcon },
])

const settings = ref([
  { id: 1, name: '用户管理', href: '/admin/user-list', icon: UsersIcon },
  { id: 2, name: '安全设置', href: '/admin/security-setting', icon: ArrowRightOnRectangleIcon },
  { id: 3, name: '访问控制', href: '/admin/access', icon: ShieldCheckIcon },
  { id: 2, name: '登录日志', href: '/admin/login-log', icon: DocumentTextIcon },
  { id: 4, name: '系统日志下载', href: '#', icon: DocumentArrowDownIcon, onClick: logDownload },
  { id: 5, name: '注销登录', href: '#', icon: ArrowLeftOnRectangleIcon, onClick: () => {
      logoutReq().then(res => {
        router.push('/login');
      })
    }
  }
])


const openHomePage = () => {
  if (siteSetting.value.siteAdminLogoTargetMode === '_self') {
    window.location.href = '/';
  } else {
    openPage('/');
  }
}

const openChangeLog = () => {
  if (siteSetting.value.siteAdminVersionOpenChangeLog) {
    openPage('https://docs.zfile.vip/changelog/pro/');
  }
}

</script>

<style lang="scss" scoped>
</style>