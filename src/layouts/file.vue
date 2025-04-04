<template>
	<el-container v-if="loadedConfig">
		<el-header>
			<Suspense>
				<template #default>
					<Header></Header>
				</template>
			</Suspense>
		</el-header>
		<el-main :class="'el-main-' + storageConfigStore.globalConfig?.layout">
			<router-view />
		</el-main>
		<el-footer>
			<Footer></Footer>
		</el-footer>
	</el-container>
</template>

<script setup>
import Header from "~/components/layout/Header.vue";
import Footer from "~/components/layout/Footer.vue";
import { loadGlobalSiteConfigReq } from "~/api/home/home";

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();

// 初始化时，加载全局设置
onBeforeMount(() => {
	loadGlobalSiteSetting()
})

let router = useRouter();

let loadedConfig = ref(false);

const loadGlobalSiteSetting = () => {
	loadGlobalSiteConfigReq().then((res) => {
		// 如果未安装, 则跳转到安装页
		if (!res.data.installed) {
			router.push('/install');
			return;
		}
		storageConfigStore.updateGlobalConfig(res.data);

    if (res.data.guest) {
      window.location.href = globalConfigStore.zfileConfig.baseUrl + '/guest';
      return;
    }

		if (res.data.customAudioSuffix) {
			constant.fileTypeMap.audio = res.data.customAudioSuffix.split(',');
		}
		if (res.data.customImageSuffix) {
			constant.fileTypeMap.image = res.data.customImageSuffix.split(',');
		}
		if (res.data.customTextSuffix) {
			constant.fileTypeMap.text = res.data.customTextSuffix.split(',');
		}
		if (res.data.customVideoSuffix) {
			constant.fileTypeMap.video = res.data.customVideoSuffix.split(',');
		}
    if (res.data.customOfficeSuffix) {
      constant.fileTypeMap.office = res.data.customOfficeSuffix.split(',');
    }
		loadedConfig.value = true;
	}).catch((err) => {
		if (err.message === 'Network Error') {
			ElMessage.error('加载失败，无法连接到服务端，请联系管理员.');
		}
	})
}
</script>

<style lang="scss" scoped>
.el-container {
	height: 100%;
	width: 100%;

	.el-header,
	.el-footer {
		color: var(--el-text-color-primary);
		padding: 0;
		text-align: center;
	}

	.el-header {
		--el-header-height: unset;
		height: 48px;
		line-height: 48px !important;
	}

	// 去除文件区 padding
	.el-main {
		padding: 0;
		overflow-x: hidden;
	}

  .el-main-card {
    @apply bg-gray-100;
  }

	// 定义脚部高度，边框
	.el-footer {
		border-top: var(--zfile-header-footer-border-top);
		height: 40px;
		line-height: 40px;
		font-size: 14px;
	}
}
</style>