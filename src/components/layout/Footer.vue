<template>
	<div>
		<a target="_blank" class="text-gray-500" href="https://beian.miit.gov.cn/">
			{{ storageConfigStore.config?.icp }}
		</a>
	</div>
</template>

<script setup>
import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();
</script>

<style scoped>

</style>