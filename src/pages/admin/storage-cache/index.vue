<template>
	<div>
		<z-form v-model="storageData" v-if="storageData">
			<template #form-sub-title>
				此页面可以管理您的缓存相关设置，包括缓存的管理、缓存的清理、缓存的统计等。
			</template>
			<z-form-item label="开启缓存">
				<el-switch @change="switchCacheEnableStatus(storageData)" v-model="storageData.enableCache" />
			</z-form-item>
			<z-form-item label="开启缓存自动刷新">
				<el-switch @change="switchCacheAutoRefreshStatus(storageData)" v-model="storageData.autoRefreshCache" />
			</z-form-item>
		</z-form>

		<el-table>

		</el-table>
	</div>
</template>

<script setup>
import {loadStorageItemReq} from "~/api/admin-storage";

let router = useRouter();

import useStorageList from "~/composables/admin/storage/storage-list";
const {
	cacheManageVisible, switchCacheEnableStatus, switchCacheAutoRefreshStatus, currentCacheManageId
} = useStorageList(router);

const storageData = ref(null);

const loadData = () => {
	loadStorageItemReq(currentCacheManageId.value).then((res) => {
		storageData.value = res.data;
	});
}

onMounted(() => {
	loadData();
})

</script>

<style scoped lang="scss">

</style>