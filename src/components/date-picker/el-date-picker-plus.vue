<template>
	<el-date-picker v-bind="$attrs"
					v-model="dataRange"
					@update:modelValue="onInput"
					v-if="isNotMobile"
					type="daterange"
					:defaultTime="defaultTime"
					:value-format="valueFormat"
					:range-separator="rangeSeparator"
					:start-placeholder="startPlaceholder"
					:end-placeholder="endPlaceholder" />
	<div class="el-date-editor" v-else>
		<el-date-picker class="el-range-input-plus is-left"
						v-model="props.modelValue[0]"
						:value-format="valueFormat"
						:defaultTime="defaultTime[0]"
						:editable="false"
						:disabled-date="disableStartDate"
						:placeholder="props.startPlaceholder" />
		<span class="el-range-separator-plus">{{ props.rangeSeparator }}</span>
		<el-date-picker class="el-range-input-plus is-right"
						v-model="props.modelValue[1]"
						:value-format="valueFormat"
						:defaultTime="defaultTime[1]"
						:editable="false"
						:disabled-date="disableEndDate"
						:placeholder="props.endPlaceholder" />
	</div>
</template>

<script setup>
import { defaultTime, isNotMobile } from "~/utils";

defineOptions({
	inheritAttrs: false
});

const props = defineProps({
	modelValue: {
		type: Object,
		default: () => []
	},
	type: {
		type: String,
		default: 'date'
	},
	rangeSeparator: {
		type: String,
		default: '-'
	},
	startPlaceholder: {
		type: String,
		default: '开始日期'
	},
	endPlaceholder: {
		type: String,
		default: '结束日期'
	},
	valueFormat: {
		type: String,
		default: 'YYYY-MM-DD HH:mm:ss'
	},
	defaultTime: {
		type: Array,
		default: () => defaultTime
	}
});

const dataRange = ref(props.modelValue);

const emit = defineEmits(['update:modelValue']);
const onInput = (value) => {
	emit("update:modelValue", value);
};

const disableStartDate = (time) => {
	let endDate = props.modelValue[1];
	if (typeof endDate === 'string') {
		endDate = new Date(endDate);
	}
	return endDate ? time.getTime() > endDate.getTime() : false;
}

const disableEndDate = (time) => {
	let startDate = props.modelValue[0];
	if (typeof startDate === 'string') {
		startDate = new Date(startDate);
	}
	return startDate ? time.getTime() < startDate.getTime() : false;
}

</script>

<style lang="scss" scoped>
.el-date-editor {
	width: var(--el-date-editor-daterange-width);
	border-radius: var(--el-border-radius-base);
	@apply inline-flex border-[1.5px] border-gray-200 hover:border-gray-300;

	// 隐藏原始的输入框边框
	:deep(.el-input__wrapper) {
		box-shadow: none;
	}

	// 隐藏右侧的默认日期图标
	:deep(.el-range-input-plus.is-right .el-input__prefix) {
		display: none;
	}

	// 输入框居中
	:deep(.el-input__inner) {
		@apply text-center ml-3;
	}

	// 清理图标固定宽度，避免抖动
	:deep(.el-input__suffix-inner) {
		@apply w-3;
	}
}

// 分隔符样式
.el-range-separator-plus {
	@apply text-xs text-gray-700 my-auto;
}
</style>
