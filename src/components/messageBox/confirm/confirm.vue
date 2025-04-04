<template>
	<TransitionRoot as="template" :show="show" >
		<Dialog as="div" class="relative z-10" @close="handlerClose('clickModal')" :close-on-click-modal="closeOnClickModal">
			<TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
				<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
			</TransitionChild>

			<div class="fixed inset-0 z-10 overflow-y-auto">
				<div class="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
					<TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
						<DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 w-11/12 max-w-sm sm:w-full sm:max-w-md sm:p-6">
							<div v-show="showCloseButton" class="absolute right-0 top-0 pr-4 pt-4 block cursor-pointer">
								<div type="button" class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" @click="handlerClose('close')">
									<span class="sr-only">Close</span>
									<XMarkIcon class="h-7 w-7" aria-hidden="true" />
								</div>
							</div>
							<div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full space-y-3">
								<DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">{{ title }}</DialogTitle>
								<div class="flex flex-row items-center space-x-2">
									<div>
										<InformationCircleIcon v-if="type === 'info'" class="h-7 w-7 text-gray-400" aria-hidden="true" />
										<ExclamationCircleIcon v-else-if="type === 'warning'" class="h-7 w-7 text-yellow-500" aria-hidden="true" />
										<XCircleIcon v-else-if="type === 'error'" class="h-7 w-7 text-red-400" aria-hidden="true" />
										<CheckCircleIcon v-else-if="type === 'success'" class="h-7 w-7 text-green-500" aria-hidden="true" />
									</div>
									<div>
										<p class="text-gray-500 text-sm" v-if="dangerouslyUseHTMLString" v-html="message"></p>
										<p class="text-gray-500 text-sm" v-else>{{ message }}</p>
									</div>
								</div>
							</div>
							<div
								class="mt-5 sm:mt-4 sm:flex sm:justify-end">
								<div class="space-y-4 sm:space-y-0 sm:space-x-2">
									<button type="button"
                          v-show="showCancelButton"
													class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
													@click="handlerClose('cancel')">
										{{ props.cancelButtonText }}
									</button>
									<button type="button"
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
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { InformationCircleIcon, ExclamationCircleIcon, XCircleIcon, CheckCircleIcon} from '@heroicons/vue/24/solid'
import { MessageType } from "./types";

const props = defineProps({
	type: {
    type: String as () => MessageType,
		default: 'info'
	},
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
	onClose: {
		type: Function,
		default: () => {}
	},
	dangerouslyUseHTMLString: {
		type: Boolean,
		default: false,
	},
  showCancelButton: {
    type: Boolean,
    default: true
  },
  showCloseButton: {
    type: Boolean,
    default: true
  },
  closeOnClickModal: {
    type: Boolean,
    default: true
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true
  }
})

import { useMagicKeys } from '@vueuse/core'
const { Escape } = useMagicKeys()

// 响应关闭事件
const emit = defineEmits(['update:show'])
const handlerClose = (type: 'clickModal' | 'pressEscape' | 'cancel' | 'close' | 'confirm') => {
  if (type === 'clickModal' && Escape.value) {
    type = 'pressEscape'
  }
  if (type === 'clickModal' && !props.closeOnClickModal) {
    return
  }
  if (type === 'pressEscape' && !props.closeOnPressEscape) {
    return
  }
	emit('update:show', false)
	props.onClose(type)
}
</script>
