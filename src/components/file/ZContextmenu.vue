<template>
	<Contextmenu auto-ajust-placement ref="contextmenu" @show="addUnderlineToLastVisibleItem">
		<template v-if="contextMenuTargetFile">
			<div class="contextmenu-group-item">
				<ContextmenuItem v-show="storageConfigStore.permission.open"
								 @click="openRow(selectRow, true)">
					<i-mdi-folder-open-outline class="contextmenu-icon" />
					<label>打开</label>
				</ContextmenuItem>
				<ContextmenuItem v-show="storageConfigStore.permission.open"
								 @click="openNewTab(selectRow)">
					<i-mdi-folder-open-outline class="contextmenu-icon" />
					<label>新标签打开</label>
				</ContextmenuItem>
				<ContextmenuItem v-show="storageConfigStore.permission.preview"
								 @click="openRow(selectRow, true)">
					<i-mdi-eye-outline class="contextmenu-icon" />
					<label>预览</label>
				</ContextmenuItem>
				<ContextmenuItem v-show="storageConfigStore.permission.download && selectStatistics.isSingleSelect"
								 @click="batchDownloadFile">
					<i-mdi-download-outline class="contextmenu-icon" />
					<label>下载</label>
				</ContextmenuItem>
				<ContextmenuItem v-show="selectStatistics.isAllFile && storageConfigStore.permission.copyDownloadLink"
								 @click="copyDownloadLink">
					<i-mdi-link-plus class="contextmenu-icon" />
					<label>复制下载链接</label>
				</ContextmenuItem>
			</div>


			<div class="contextmenu-group-item">
				<ContextmenuItem v-show="selectStatistics.isAllFile && storageConfigStore.permission.pathLink"
								 @click="openGenerateLinkDialog('pathLink')">
					<i-mdi-link-plus class="contextmenu-icon" />
					<label>获取直链</label>
				</ContextmenuItem>
				<ContextmenuItem v-show="selectStatistics.isAllFile && storageConfigStore.permission.shortLink"
								 @click="openGenerateLinkDialog('shortLink')">
					<i-mdi-link-plus class="contextmenu-icon" />
					<label>生成短链</label>
				</ContextmenuItem>
				<ContextmenuItem v-show="storageConfigStore.permission.bothLink"
								 @click="openGenerateLinkDialog('all')">
					<i-mdi-link-plus class="contextmenu-icon" />
					<label>同时获取</label>
				</ContextmenuItem>
			</div>

			<div class="contextmenu-group-item">
				<ContextmenuItem v-show="storageConfigStore.permission.rename" @click="rename">
					<i-mdi-rename-outline class="contextmenu-icon" />
					<label>重命名</label>
				</ContextmenuItem>
				<ContextmenuItem
					v-if="storageConfigStore.permission.move && (selectStatistics.isAllFolder || selectStatistics.isAllFile)"
					@click="moveTo">
					<i-mdi-folder-move-outline class="contextmenu-icon" />
					<label>移动</label>
				</ContextmenuItem>
				<ContextmenuItem
					v-if="storageConfigStore.permission.copy && (selectStatistics.isAllFolder || selectStatistics.isAllFile)"
					@click="copyTo">
					<i-mdi-content-copy class="contextmenu-icon" />
					<label>复制</label>
				</ContextmenuItem>
				<ContextmenuItem v-if="storageConfigStore.permission.delete" @click="batchDelete">
					<i-solar-trash-bin-minimalistic-bold class="contextmenu-icon" />
					<label>删除 {{ selectRows.length > 0 ? ("(" + selectRows.length + ")") : "" }}</label>
				</ContextmenuItem>
			</div>
		</template>

		<div class="contextmenu-group-item">
			<ContextmenuItem v-show="storageConfigStore.permission.newFolder" @click="newFolder">
				<i-lucide-folder-plus class="contextmenu-icon" />
				<label>新建文件夹</label>
			</ContextmenuItem>
			<ContextmenuItem v-show="storageConfigStore.permission.upload" @click="openUploadDialog">
				<i-ci-file-upload class="contextmenu-icon" />
				<label>上传文件</label>
			</ContextmenuItem>
			<ContextmenuItem v-show="storageConfigStore.permission.uploadFolder" @click="openUploadFolderDialog">
				<i-ci-folder-upload class="contextmenu-icon" />
				<label>上传文件夹</label>
			</ContextmenuItem>
		</div>

		<ContextmenuItem @click="reload">
			<i-mdi-reload class="contextmenu-icon" />
			<label>刷新</label>
		</ContextmenuItem>
	</Contextmenu>
</template>

<script setup>
import { Contextmenu, ContextmenuItem } from "v-contextmenu";
import { toClipboard } from "@soerenmartius/vue3-clipboard";
import { removeDuplicateSeparator } from "~/utils";

import useFileContextMenu from "~/composables/file/useFileContextMenu";
import useFileData from "~/composables/file/useFileData";
import useFileSelect from "~/composables/file/useFileSelect";
import useFileOperator from "~/composables/file/useFileOperator";
import useFileLink from "~/composables/file/useFileLink";
import useFileUpload from "~/composables/file/useFileUpload";

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

const { openRow } = useFileData();
const { selectRow, selectRows, selectStatistics } = useFileSelect();
const { rename, batchDownloadFile, moveTo, copyTo, newFolder, batchDelete } = useFileOperator();
const { openGenerateLinkDialog } = useFileLink();
const { openUploadDialog, openUploadFolderDialog } = useFileUpload();

const contextmenu = ref();
const { initContextMenu, contextMenuTargetFile } = useFileContextMenu();

onMounted(() => {
	initContextMenu(contextmenu);
});

const reload = () => {
	window.location.reload();
};

const openNewTab = (row) => {
	let fullPath = removeDuplicateSeparator(window.location.pathname + "/" + row.name);
	window.open(fullPath);
};

const copyDownloadLink = () => {
	let downloadLink = selectRow.value.url;
	toClipboard(downloadLink).then(() => {
		ElMessage.success("下载链接已复制到剪贴板");
	});
};

const addUnderlineToLastVisibleItem = () => {
	const groups = document.querySelectorAll('.contextmenu-group-item');
	groups.forEach(group => {
		const items = group.querySelectorAll('.v-contextmenu-item');
		let lastVisibleItem = null;
		items.forEach(item => {
			if (item.style.display !== 'none') {
				lastVisibleItem = item;
			}
		});
		if (lastVisibleItem) {
			group.classList.add('contextmenu-divider');
		}
	});
};

</script>

<style scoped lang="scss">
// 右键菜单
.v-contextmenu-item {
	:deep(.v-contextmenu-inner) {
		@apply p-0;
	}

	// 文字和图标的距离
	:deep(label) {
		@apply ml-2.5;
	}

	// 图标位置修正为居中
	:deep(.contextmenu-icon) {
		@apply mb-1 inline w-4;
	}
}

.contextmenu-divider {
	@apply border-b border-gray-300 mb-2;
}
</style>