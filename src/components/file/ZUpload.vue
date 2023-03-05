<template>
	<div class="zfile-file-upload-body">
		<el-dialog v-if="visible" v-model="visible" :destroy-on-close="true"
		           @close="closeDialog"
		           :title="uploadMode === 'file' ? '上传文件' : '上传文件夹'"
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
				<div class="flex flex-row w-full relative rounded-lg" v-for="item in uploadProgressInfoSorted" :key="item.index">

					<div class="mr-2 p-1.5">
						<svg-icon class="text-5xl mt-1 py-1.5 sm:py-1" :name="'file-type-' + common.getFileIconName(item)">
						</svg-icon>
					</div>

					<div class="p-1.5 py-2.5 sm:py-3 w-full flex flex-col justify-between">
						<div class="flex justify-between">
              <div class="flex sm:space-x-5 flex-col sm:flex-row">
                <div class="font-medium text-sm max-w-[80%] line-clamp-1">{{ item.name }}</div>
                <div class="text-gray-400 text-xs leading-5 line-clamp-1 active:line-clamp-none">
                  <span class="mr-4 box animate__animated animate__fadeIn"> {{ common.fileSizeFormat(item.size) }} </span>
                  <span v-if="item.status === 'uploading' && !item.msg" class="text-blue-500 box animate__animated animate__fadeIn">{{ item.speed }} / 秒</span>
                  <span v-if="item.status === 'uploading' && item.msg" class="text-blue-500 box animate__animated animate__fadeIn">{{ item.msg }}</span>
                  <svg-icon v-else-if="item.status === 'finished'" name="check" class="inline text-green-500 box animate__animated animate__fadeIn"/>
                  <span v-else-if="item.status === 'waiting'" class="text-yellow-500 box animate__animated animate__fadeIn">{{ item.msg }}</span>
                  <span v-else-if="item.status === 'error'" class="text-red-500 box animate__animated animate__fadeIn">{{ item.msg }}</span>
                </div>
              </div>
              <div>
                <div v-if="item.status === 'uploading'">
                  <span class="text-gray-500 text-xs mr-2">{{ common.fileSizeFormat(item.loaded) }} / {{ common.fileSizeFormat(item.size) }}</span>
                  <svg-icon @click="cancelUpload(item)" name="tool-close2" class="top-0.5 relative inline text-gray-500 mr-1 text-lg cursor-pointer rounded-full hover:bg-gray-200 box animate__animated animate__fadeIn"/>
                </div>
                <div v-else-if="item.status === 'finished'">
                  <svg-icon @click="removeUploadFileByIndex(item.index)" name="delete" class="inline text-red-400 mr-1 text-base cursor-pointer rounded-full hover:bg-gray-200 box animate__animated animate__fadeIn"/>
                </div>
                <div v-else-if="item.status === 'error'">
                  <svg-icon @click="retryUpload(item)" name="refresh" class="inline text-red-500 mr-1 text-base cursor-pointer rounded-full hover:bg-gray-200 box animate__animated animate__fadeIn"/>
                </div>
                <div v-else-if="item.status === 'waiting'">
                  <svg-icon @click="removeUploadFileByIndex(item.index)" name="delete" class="inline text-red-400 mr-1 text-base cursor-pointer rounded-full hover:bg-gray-200 box animate__animated animate__fadeIn"/>
                </div>
              </div>
            </div>
            <div>
              <el-progress v-if="item.status === 'finished'" :show-text="false" :percentage="item.progress" status="success"></el-progress>
              <el-progress v-else-if="item.status === 'uploading'" :show-text="false" :percentage="item.progress"></el-progress>
              <el-progress v-else-if="item.status === 'error'" :show-text="false" :percentage="100" status="exception"></el-progress>
              <el-progress v-else-if="item.status === 'waiting'" :show-text="false" :percentage="0"></el-progress>
            </div>
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
	dropState, listenDropFile,
  clearALlFinishedUploadFile, removeUploadFileByIndex, retryUpload} = useFileUpload();

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

// 如果有上传完成的文件，关闭对话框时调用 close 方法刷新文件列表
const emit = defineEmits()
const closeDialog = () => {
  let deleteCount = clearALlFinishedUploadFile();
	if (deleteCount > 0) {
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

  :deep(.el-upload-dragger) {
    @apply border-dashed border-2;
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