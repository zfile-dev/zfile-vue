<template>
	<div>
		<a v-show="storageConfigStore.globalConfig?.icp" target="_blank" class="text-gray-500" href="https://beian.miit.gov.cn/">
			{{ storageConfigStore.globalConfig?.icp }} |
		</a>
    Powered by <a target="_blank" class="text-gray-500" href="https://github.com/zfile-dev/zfile">ZFile</a>
  </div>
</template>

<script setup>
import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();
</script>

<style scoped>

</style>
