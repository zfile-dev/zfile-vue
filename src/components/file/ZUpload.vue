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
        <i-custom-upload class="mx-auto text-7xl" />
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

      <div class="mt-4">
        <div class="">
          <!-- Body -->
          <div class="space-y-7">
            <div v-for="item in uploadProgressInfoSorted" :key="item.index">
              <!-- Uploading File Content -->
              <div class="mb-2 flex justify-between items-start">
                <div class="flex items-center gap-x-3 w-full mr-2">
                  <svg-icon class=" py-0.5 h-9 w-9" :name="'file-type-' + getFileIconName(item)">
                  </svg-icon>
                  <div class="w-full">
                    <p class="text-sm font-medium text-gray-800 line-clamp-1 mr-10" :title="item.name" >{{ item.name }}</p>

                    <div class="flex space-x-2 sm:space-x-4 max-sm:justify-between text-xs">
                      <p class="whitespace-nowrap text-gray-500">{{ fileSizeFormat(item.size) }}</p>

                      <template v-if="item.status === 'uploading'">
                        <p class="line-clamp-1 max-sm:hidden">{{ item.speed }}/秒</p>
                        <p class="line-clamp-1">{{ fileSizeFormat(item.loaded) }}/{{ fileSizeFormat(item.size) }}</p>
                      </template>

                      <p class="line-clamp-1" v-show="item.msg" :class="{'text-red-500': item.status === 'error'}">
                        {{ item.msg }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="inline-flex items-center gap-x-2">
                  <CheckCircleIcon v-if="item.status === 'finished'" class="inline h-[18px] text-green-500 box animate__animated animate__fadeIn"/>
                  <ClockIcon   v-else-if="item.status === 'waiting'" class="inline h-[18px] text-yellow-500 box animate__animated animate__fadeIn"/>

                  <!--<TrashIcon v-if="item.status === 'uploading'" @click="cancelUpload(item)" class="w-6 text-red-500 box animate__animated animate__fadeIn cursor-pointer hover:bg-gray-200 rounded-full"/>-->
                  <XMarkIcon     v-if="item.status === 'uploading'"     @click="cancelUpload(item)" class="w-5 h-5 text-gray-500 box animate__animated animate__fadeIn cursor-pointer hover:bg-gray-200 rounded-full"/>
                  <ArrowPathIcon v-else-if="item.status === 'error'"    @click="retryUpload(item)"  class="h-4 w-4 text-red-500 box animate__animated animate__fadeIn cursor-pointer hover:bg-gray-200 rounded-full"/>
                  <TrashIcon     v-else-if="item.status === 'finished' || item.status === 'waiting'" @click="removeUploadFileByIndex(item.index)" class="h-4 w-4 text-red-500 box animate__animated animate__fadeIn cursor-pointer hover:bg-gray-200 rounded-full"/>

                </div>
              </div>
              <!-- End Uploading File Content -->

              <!-- Progress Bar -->
              <div class="zfile-upload-item__progress">
                <el-progress v-if="item.status === 'finished'" :show-text="false" :percentage="item.progress" status="success"></el-progress>
                <el-progress v-else-if="item.status === 'uploading'" :show-text="false" :percentage="item.progress"></el-progress>
                <el-progress v-else-if="item.status === 'error'" :show-text="false" :percentage="100" status="exception"></el-progress>
                <el-progress v-else-if="item.status === 'waiting'" :show-text="false" :percentage="0"></el-progress>
              </div>
              <!-- End Progress Bar -->
            </div>
          </div>
          <!-- End Body -->
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
import { fileSizeFormat, getFileIconName } from "~/utils";
import { XMarkIcon, CheckCircleIcon, ClockIcon, TrashIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

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
    overflow-x: hidden;
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

  .zfile-upload-body {
    @apply mt-5 space-y-2.5 flex flex-row w-full;

    .zfile-upload-item {
      @apply w-full flex;

      .zfile-upload-item-icon {
        @apply mr-2 p-1.5;
        svg {
          height: 1em;
          width: 1em;
        }
      }

      &__info {
        @apply py-2.5 sm:py-3 w-full flex flex-col justify-between;
      }

      &__left {
        @apply flex w-full justify-center flex-col sm:flex-row;
      }

      &__status-icon {
        @apply flex-shrink-0 truncate inline;
        svg {
          @apply inline cursor-pointer rounded-full hover:bg-gray-200;
        }
      }
    }

  }
}
</style>
