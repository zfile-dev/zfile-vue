<template>
	<form class="z-form">
		<div class="space-y-8 divide-y divide-gray-200">
			<div class="z-form-body">
				<div>
					<h3 class="z-form-title text-lg leading-6 font-medium text-gray-900">
						<slot name="form-title"></slot>
					</h3>
					<p class="z-form-sub-title mt-2 max-w-3xl text-sm text-gray-500">
						<slot name="form-sub-title"></slot>
					</p>
				</div>
				<slot></slot>
			</div>
			<div class="z-form-footer">
				<div class="pt-5">
					<div class="flex justify-end">
						<slot name="footer"></slot>
					</div>
				</div>
			</div>
		</div>
	</form>
</template>

<script>
export default {
	name: 'ZForm',
};
</script>

<script setup>
import {computed, ref, defineExpose} from "vue";
import AsyncValidator from 'async-validator';

// 参数
const props = defineProps({
	model: Object,
	rules: Object
});

// 表单错误信息
let formError = ref({});
// field: {prop, el}，保存 FormItem 的信息。
let fields = ref([]);

let formRules = computed(() => {
	const descriptor = {}
	fields.value.forEach(({prop, required, label}) => {
		if (required) {
			descriptor[prop] = [{required: true, message: `${label}不能为空`}]
		}
		if (props.rules[prop] === undefined) {
			console.debug(`prop 为 ${prop} 的 FormItem 校验规则不存在, 跳过.`)
			return
		}
		if (!Array.isArray(props.rules[prop])) {
			console.warn(`prop 为 ${prop} 的 FormItem 校验规则不存在或者其值不是数组`)
			descriptor[prop] = [{required: true}]
			return
		}
		descriptor[prop] = props.rules[prop]
	})
	return descriptor
})

let formValues = computed(() => {
	return fields.value.reduce((data, {prop}) => {
		let split = prop.split('.');
		if (split.length > 1) {
			let value = props.model;
			while (split.length >= 1) {
				let key = split.shift();
				if (value[key] !== undefined) {
					value = value[key]
				}
			}
			data[prop] = value;
		} else {
			data[prop] = props.model[prop];
		}
		return data
	}, {})
})

// 校验方法
const validate = (callback) => {
	const validator = new AsyncValidator(formRules.value)
	validator.validate(formValues.value, (errors) => {
		let errObj = {}
		if (errors && errors.length) {
			errors.forEach(({message, field}) => {
				errObj[field] = message
			})
		} else {
			errObj = {}
		}
		formError.value = errObj;        // 让错误信息的顺序与表单组件的顺序相同
		callback(Object.keys(errObj).length === 0)
	})
};


// 监听字段添加事件
const formAddField = (field) => {
	if (field) {
		fields.value = [...fields.value, field]
	}
}

// 监听字段添加事件
const formRemoveField = (field) => {
	if (field) {
		fields.value = fields.value.filter(({prop}) => prop !== field.prop)
	}
}

// 规则数组
let rulesArray = computed(() => {
	return props.rules;
});

defineExpose({validate, formAddField, formRemoveField, rulesArray, formError})

</script>

<style lang="scss" scoped>

.z-form {
	@apply divide-y divide-gray-200 p-6;

  :deep(.z-form-item-input) {
    @apply flex-wrap;
  }
}

</style>