<template>
	<div class="zfile-file-upload-body">
		<el-dialog v-if="visible" v-model="visible" :destroy-on-close="true"
		           @close="closeDialog"
		           :title="uploadMode === 'file' ? '上传文件' : '上传文件夹'"
		           custom-class="zfile-file-upload-dialog"
		           draggable
		           top="5vh"
		           width="70%">
			<el-upload
				drag
				:http-request="beforeUpload"
				ref="uploadRef"
				:show-file-list="false"
				multiple>
				<el-icon class="el-icon--upload">
					<SvgIcon name="upload-1"></SvgIcon>
				</el-icon>
				<div class="el-upload__text text-gray-400">
          <span v-show="uploadMode === 'file'">
            拖拽文件到这里或<em> 点击上传</em>, 上传至 <em>{{ currentPath }}</em>
          </span>
          <span v-show="uploadMode === 'folder'">
            点击选择文件夹上传, 上传至 <em>{{ currentPath }}</em>
            <br>
            <span class="text-gray-400">（此处不支持拖拽文件夹，只支持点击选择文件夹）</span>
          </span>
				</div>
			</el-upload>
			<div class="mt-5 space-y-2.5">
				<div class="flex flex-row w-full relative" v-for="item in uploadProgressInfoSorted" :key="item.index">
					<div class="mr-2 p-1.5">
						<svg-icon class="text-5xl" :name="'file-type-' + common.getFileIconName(item)">
						</svg-icon>
					</div>
					<div class="space-y-3 p-1.5">
						<div class="font-medium text-sm">{{ item.name }}</div>
						<div class="text-xs text-gray-400">
							<span>{{ common.fileSizeFormat(item.loaded) }}</span>
							<span>/</span>
							<span>{{ common.fileSizeFormat(item.size) }}</span>
							<span> - </span>
							<span class="text-green-500" v-if="item.status === 'finished'">
								完成
							</span>
							<span v-else class="text-blue-400">{{ item.speed }} / 秒</span>
						</div>
					</div>
					<div v-show="item.status === 'uploading'" class="absolute left-0 border-b-2 border-b-blue-300 h-full"
					     :style="{ width: item.progress + '%' }"
					     style="background: rgba(132, 133, 141, 0.08);">
					</div>
					<div v-show="item.status === 'uploading'"
					     class="absolute w-full h-full hover:opacity-100 opacity-0 transition-opacity duration-300">
						<SvgIcon @click="cancelUpload(item)" class="text-2xl absolute right-5 top-0 bottom-0 my-auto
									cursor-pointer rounded-full hover:bg-gray-200" name="tool-close2"></SvgIcon>
					</div>
				</div>
			</div>
		</el-dialog>

		<!-- 文件拖拽提示框-->
		<div ref="dropBoxRef" id="dropBox" class="drop-view" v-if="storageConfigStore.permission.upload" v-show="dropState">
			<div class="drop-sub">
				<span>上传文件至 {{ currentPath }}</span>
			</div>
		</div>
	</div>
</template>

<script setup>
import common from "~/common";

let router = useRouter();
let route = useRoute();

import useFileSelect from "~/composables/file/useFileSelect";
let { currentPath } = useFileSelect();

import useFileUpload from "~/composables/file/useFileUpload";
const { visible, uploadMode, cancelUpload, beforeUpload, uploadProgressInfoSorted,
	dropState, listenDropFile} = useFileUpload();

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

// 如果有上传完成的文件，关闭对话框时调用 close 方法刷新文件列表
const emit = defineEmits()
const closeDialog = () => {
	let hasFinished = false;
	for (let i = uploadProgressInfoSorted.value.length - 1; i >= 0; i--) {
		if (uploadProgressInfoSorted.value[i].status === 'finished') {
			hasFinished = true;
			uploadProgressInfoSorted.value.splice(i, 1);
		}
	}
	if (hasFinished) {
		emit('close');
	}
}

// 监听拖拽上传
const dropBoxRef = ref();
onMounted(() => {
	listenDropFile();
})

</script>

<style scoped lang="scss">

.zfile-file-upload-body {
	:deep(.el-dialog__header) {
		text-align: center;
	}

	:deep(.el-dialog__body) {
		max-height: 80vh;
		overflow-y: auto;
	}

	.drop-view {
		@apply fixed w-full h-full z-10
		bg-opacity-20 bg-black
		left-0 bottom-0
		flex justify-center items-center flex-row;

		.drop-sub {
			@apply flex justify-center items-center h-5/6 w-5/6
			border-dashed border-2 border-gray-400 rounded-2xl
			text-gray-500 font-bold text-2xl;
		}
	}
}
</style>