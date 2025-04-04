<template>
	<el-table-column v-if="isNotMobile && (props.type === 'selection') " v-bind="props" />
	<el-table-column v-else-if="isNotMobile" v-bind="props">
		<template #default="scope">
			<slot :row="scope.row" :$index="scope.$index" :column="scope.column">
				<div>
					{{ scope.row[props.prop] }}
				</div>
			</slot>
		</template>
    <template #header>
      <slot name="header" :column="props">
        <div>
          {{ props.label }}
        </div>
      </slot>
    </template>
	</el-table-column>
	<div class="w-full" v-else>
		<slot :row="props.scope.row" :$index="props.scope.$index">
			<div>
				{{ props.scope.row[props.prop] }}
			</div>
		</slot>
	</div>
</template>

<script setup>
import { isNotMobile } from "~/utils";
import { ElTableColumn } from "element-plus";
import 'element-plus/es/components/table-column/style/css'

defineOptions({
	inheritAttrs: false
});

const props = defineProps({
	type: {
		type: String,
		default: "default"
	},
	label: String,
	className: String,
	labelClassName: String,
	property: String,
	prop: String,
	width: {
		type: [String, Number],
		default: ""
	},
	minWidth: {
		type: [String, Number],
		default: ""
	},
	renderHeader: Function,
	sortable: {
		type: [Boolean, String],
		default: false
	},
	sortMethod: Function,
	sortBy: [String, Function, Array],
	resizable: {
		type: Boolean,
		default: true
	},
	columnKey: String,
	align: String,
	headerAlign: String,
	showOverflowTooltip: {
		type: [Boolean, Object],
		default: void 0
	},
	fixed: [Boolean, String],
	formatter: Function,
	selectable: Function,
	reserveSelection: Boolean,
	filterMethod: Function,
	filteredValue: Array,
	filters: Array,
	filterPlacement: String,
	filterMultiple: {
		type: Boolean,
		default: true
	},
	filterClassName: String,
	index: [Number, Function],
	sortOrders: {
		type: Array,
		default: () => {
			return ["ascending", "descending", null];
		},
		validator: (val) => {
			return val.every((order) => ["ascending", "descending", null].includes(order));
		}
	},
	scope: {
		type: Object,
		default: {}
	}
});
</script>


<style lang="scss">
.el-input, .el-select, .el-date-editor {
	@apply w-full;
}
</style>