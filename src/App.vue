<template>
  <el-config-provider :locale="zhCn">
    <router-view v-if="isRouterAlive"/>
  </el-config-provider>
</template>

<script setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import useRouterData from "~/composables/useRouterData";

let router = useRouter();
let route = useRoute();
useRouterData(router, route);

import uaBrowser from 'ua-browser'
console.log('当前浏览器信息:', uaBrowser());


const isRouterAlive = ref(true);
const reload = () => {
  isRouterAlive.value = false;
  nextTick(() => {
    isRouterAlive.value = true;
  });
}
provide('reload', reload);
</script>
