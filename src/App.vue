<template>
	<router-view />
</template>

<script setup>
import useRouterData from "~/composables/useRouterData";

let router = useRouter();
let route = useRoute();
useRouterData(router, route);

import uaBrowser from 'ua-browser'
console.log('当前浏览器信息:', uaBrowser());
</script>