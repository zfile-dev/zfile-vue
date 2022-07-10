<template>
	<div ref="zFormItem" :class="parentForm.formError[props.prop] ? 'is-error' : 'is-success'"  class="z-form-item mt-6 sm:mt-5 space-y-6 sm:space-y-5">
		<div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
			<label :for="props.prop"
			       :class="required ? 'required' : 'not-required'"
			       class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2" v-if="label">
				{{ label }}
			</label>
			<div class="mt-1 sm:mt-0 sm:col-span-2">
				<div class="input max-w-2xl flex rounded-md z-form-item-input" @input="changeInput">
					<slot></slot>
				</div>
				<p class="empty:mt-0 mt-2 text-sm max-w-2xl text-gray-400 z-form-item-tips">
					<slot name="tips"></slot>
				</p>
				<p class="empty:mt-0 mt-2 text-sm text-red-500">
					{{parentForm.formError[props.prop]}}
				</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import {computed, getCurrentInstance, onBeforeUnmount, onMounted, ref} from "vue";
import AsyncValidator from 'async-validator';

const {proxy} = getCurrentInstance();

const props = defineProps({
	required: Boolean,
	prop: String,
	label: String
});

let fieldRules = computed(() => {
	// 获取表单校验信息
	let formRules = parentForm.value.rulesArray;
	// 如果有表单校验信息, 则尝试获取当前字段的.
	if (formRules) {
		// 如果有当前字段的校验信息, 获取是否必填
		return formRules[props.prop];
	}
	return [];
})

let required = computed(() => {
	// 如果已经指定了必填, 则校验必填.
	if (props.required) {
		return true;
	}
	if (fieldRules.value) {
		for (let i = 0; i < fieldRules.value.length; i++) {
			let required = fieldRules.value[i].required;
			if (typeof required === 'boolean') {
				return true;
			} else if (typeof required === 'function') {
				return required();
			}
		}
	}
	return false;
})

// 获取父组件元素
let parentForm = computed(() => {
	let parent = proxy.$parent;
	while (parent.$options.name !== 'ZForm') {
		parent = parent.parent
	}
	return parent
});

let fieldError = computed(() => {
	if (!props.prop) {
		return ''
	}
	const formError = parentForm.value.formError
	return formError[props.prop] || ''
});


const dispatchEvent = (eventName, params) => {
	parentForm.value[eventName](params);
}

let zFormItem = ref();
onMounted(() => {
	if (props.prop) {
		dispatchEvent('formAddField', {
			prop: props.prop,
			required: props.required,
			label: props.label,
			el: zFormItem.value,
		})
	}
})

onBeforeUnmount(() => {
	dispatchEvent('formRemoveField', {
		prop: props.prop
	})
})

const changeInput = (event) => {
	// 获取修改后的字段值
	let changeToValue = event.target.value;
	// 校验当前字段
	let formRules = {}, formValues = {};
	if (fieldRules.value) {
		formRules[props.prop] = fieldRules.value;
		formValues[props.prop] = changeToValue;
	}
	const validator = new AsyncValidator(formRules)
	validator.validate(formValues, (errors) => {
		if (errors && errors.length) {
			errors.forEach(({message, field}) => {
				parentForm.value.formError[props.prop] = message
			})
		} else {
			parentForm.value.formError[props.prop] = ''
		}
	})
}

</script>

<style scoped>
.required:before {
	content: "*";
	color: rgb(245,108,108);
	left: -4px;
	position: relative;
	top: 2px;
}


.z-form-item.is-error >>> .el-select-v2__wrapper,
.z-form-item.is-error >>> .el-select-v2__wrapper:focus,
.z-form-item.is-error >>> .el-input__inner,
.z-form-item.is-error >>> .el-input__inner:focus,
.z-form-item.is-error >>> .el-textarea__inner,
.z-form-item.is-error >>> .el-textarea__inner:focus {
	@apply border-red-500
}

.z-form-item-tips >>> .el-link {
	@apply text-gray-400
}
</style>