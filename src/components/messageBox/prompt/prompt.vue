<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="zfile-prompt-dialog" @close="handlerClose('close')">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 w-11/12 max-w-sm sm:w-full sm:max-w-md sm:p-6">
              <div class="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                <div type="button" class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" @click="handlerClose('close')">
                  <span class="sr-only">Close</span>
                  <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <PencilIcon class="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full space-y-1">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">{{ title }}</DialogTitle>
                  <div>
                    <p class="text-gray-500 text-sm" v-if="dangerouslyUseHTMLString" v-html="message"></p>
                    <p class="text-gray-500 text-sm" v-else>{{ message }}</p>
                  </div>
                  <el-input :placeholder="inputPlaceholder"
                            v-model="form.inputModel"
                            :type="inputType"
                            @keyup.enter="handlerClose('confirm')"
                            :autofocus="true"
                            :show-password="inputType === 'password' && showPassword"
                            class="h-10"></el-input>
                  <div class="text-red-500 text-sm text-left" v-if="errorFields?.inputModel?.length">{{ errorFields.inputModel[0].message }}</div>
                </div>
              </div>
              <div
                :class="checkbox ? 'sm:justify-between' : 'sm:justify-end'"
                class="mt-5 sm:mt-4 sm:flex">
                <div class="sm:ml-14" v-if="checkbox">
                  <el-checkbox v-model="form.checkboxModel">{{ checkboxLabel }}</el-checkbox>
                </div>
                <div class="space-y-4 sm:space-y-0 sm:space-x-2">
                  <button type="button"
                          class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          @click="handlerClose('cancel')">
                    {{ props.cancelButtonText }}
                  </button>
                  <button :disabled="!pass" type="button"
                          :class="pass ? '' : 'cursor-not-allowed opacity-50'"
                          class="inline-flex w-full justify-center rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 sm:ml-3 sm:w-auto" @click="handlerClose('confirm')">
                    {{ confirmButtonText }}
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts" setup>
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot
} from "@headlessui/vue";
import { XMarkIcon, PencilIcon } from '@heroicons/vue/24/outline'
import { useAsyncValidator } from '@vueuse/integrations/useAsyncValidator'
import { Rules } from "async-validator";
import { ConfirmResult } from "./types";
import { ElCheckbox, ElInput }  from "element-plus";

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  confirmButtonText: {
    type: String,
    default: 'Confirm',
  },
  cancelButtonText: {
    type: String,
    default: 'Cancel',
  },
  checkbox: {
    type: Boolean,
    default: false,
  },
  checkboxLabel: {
    type: String,
    default: 'Remember me',
  },
  defaultChecked: {
    type: Boolean,
    default: false,
  },
  inputType: {
    type: String,
    default: 'text',
  },
  inputDefault: {
    type: String,
    default: ''
  },
  inputPlaceholder: {
    type: String,
    default: '请输入',
  },
  showPassword: {
    type: Boolean,
    default: true,
  },
  inputValidator: {
    type: Function,
    default: () => true,
  },
  inputErrorMessage: {
    type: String,
    default: 'input error',
  },
  onClose: {
    type: Function,
    default: () => {}
  },
  dangerouslyUseHTMLString: {
    type: Boolean,
    default: false,
  }
})


// 表单数据和校验规则
const form = ref({ inputModel: props.inputDefault!, checkboxModel: props.defaultChecked! })
const rules:Rules = {
  inputModel: {
    type: 'string',
    required: true,
    message: props.inputErrorMessage
  }
}

const { pass, errorFields } = useAsyncValidator(form, rules)

// 响应关闭事件
const emit = defineEmits(['update:show'])
const handlerClose = (type: 'cancel' | 'close' | 'confirm') => {
  const result:ConfirmResult = {
    checkbox: form.value.checkboxModel,
    value: form.value.inputModel,
    type
  }

  emit('update:show', false)
  props.onClose!(result)
}
</script>

<style lang="scss">
.zfile-prompt-dialog {
  position: relative;
  z-index: 3000;
}
</style>