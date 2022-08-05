<template>
	<router-view />
</template>

<script setup>
import useRouterData from "~/composables/useRouterData";

let router = useRouter();
let route = useRoute();
useRouterData(router, route);
</script>