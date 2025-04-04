<template>
	<div class="file-readme-dialog-wrapper">
		<!-- 弹窗文档 -->
		<el-dialog draggable class="zfile-dialog-mini-close" top="5vh"
				   :model-value="true"
				   @close="readmeDialogClose"
				   v-if="storageConfigStore.globalConfig.showDocument
                 && storageConfigStore.folderConfig.readmeText
                 && storageConfigStore.folderConfig.readmeDisplayMode === 'dialog'
                 && showDialog(storageConfigStore.folderConfig.readmeText)">
			<v-md-preview :text="storageConfigStore.folderConfig.readmeText" />
		</el-dialog>
	</div>
</template>

<script setup>
import md5 from "md5";
import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

let { storageKey, currentPath } = useRouterData();
const readmeDialogCache = useStorage(`zfile-readme-dialog-cache`, {});
const readmeDialogClose = () => {
	ElMessageBox.confirm("在内容变更前是否不再显示此弹窗?", "提示", {
		confirmButtonText: "是",
		cancelButtonText: "否",
		draggable: true,
		callback: action => {
			if (action === "confirm") {
				let key = (storageKey.value + "_" + currentPath.value);
				readmeDialogCache.value[key] = md5(storageConfigStore.folderConfig.readmeText);
			}
		}
	});
};
const showDialog = (readmeText) => {
  const contentMd5 = md5(readmeText);
	for (let key of Object.keys(readmeDialogCache.value)) {
    if (key === (storageKey.value + "_" + currentPath.value)
			&& readmeDialogCache.value[key] === contentMd5) {
			return false;
		}
	}

	return true;
};
</script>

<style scoped lang="scss">
.file-readme-dialog-wrapper {
	:deep(.el-dialog__body) {
		height: 85vh;
		overflow-y: auto;
	}
}
</style>