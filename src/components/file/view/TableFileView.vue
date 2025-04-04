<template>
	<!-- 文件区 -->
	<el-table
		v-if="!fileDataStore.imgMode"
		id="ListTable"
		ref="fileRef"
		v-loading="basicLoading"
		element-loading-text="拼命加载中"
		element-loading-background="rgba(255, 255, 255, 0.6)"
		@sort-change="sortChangeMethod"
		@row-click="tableClickRow"
		@row-dblclick="tableDbClickRow"
		@cell-mouse-enter="tableHoverRow"
		@cell-mouse-leave="tableLeaveRow"
		:size="storageConfigStore.globalConfig?.tableSize"
		empty-text=""
		@row-contextmenu="showFileMenu"
		:row-class-name="tableRowClassName"
		:class="{'zfile-table-empty': fileDataStore.fileList.length === 0}"
		@selection-change="selectRowsChange"
		:data="skeletonLoading ? skeletonData : fileDataStore.fileList">
		<template #empty>
			<div v-show="!basicLoading">
				<i-custom-empty class="empty-icon" />
				<div class="font-bold text-base">数据为空，请先上传或添加文件</div>
			</div>
		</template>

		<el-table-column width="30px" type="selection" :selectable="checkSelectable" />

		<el-table-column
			prop="name"
			sortable="custom"
			class-name="zfile-table-col-name"
			label-class-name="table-header-left"
			min-width="100%">
			<template #header>
				<DocumentTextIcon />
				<span>文件名</span>
			</template>
			<template #default="scope">
				<div v-show="skeletonLoading">
					<el-skeleton animated>
						<template #template>
							<el-skeleton-item variant="circle"
											  style="vertical-align: middle;width: 18px; height: 18px; margin-right: 20px" />
							<el-skeleton-item variant="text"
											  style="vertical-align: middle;width: 30%;" />
						</template>
					</el-skeleton>
				</div>
				<div v-show="!skeletonLoading">
					<svg-icon :name="'file-type-' + scope.row.icon"></svg-icon>
					{{ scope.row.name }}
				</div>
			</template>
		</el-table-column>

		<el-table-column
			prop="time"
			v-if="isNotMobile"
			sortable="custom"
			class-name="zfile-table-col-time"
			min-width="25%">
			<template #header>
				<CalendarDaysIcon />
				<span>修改时间</span>
			</template>
			<template #default="scope">
				<div v-show="skeletonLoading">
					<el-skeleton animated>
						<template #template>
							<el-skeleton-item variant="text" style="width: 60%" />
						</template>
					</el-skeleton>
				</div>
				<div v-show="!skeletonLoading">
					{{ scope.row.time }}
				</div>
			</template>
		</el-table-column>

		<el-table-column
			prop="size"
			v-if="isNotMobile"
			class-name="zfile-table-col-size"
			sortable="custom"
			min-width="20%">
			<template #header>
				<CircleStackIcon />
				<span>大小</span>
			</template>
			<template #default="scope">
				<div v-show="skeletonLoading">
					<el-skeleton animated>
						<template #template>
							<el-skeleton-item variant="text" style="width: 30%" />
						</template>
					</el-skeleton>
				</div>
				<div v-show="!skeletonLoading">
					{{ fileSizeFilter(scope.row, null, scope.row.size) }}
				</div>
			</template>
		</el-table-column>

		<template #append>
			<load-more-file v-show="skeletonLoading !== true && basicLoading !== true" />
		</template>
	</el-table>
</template>

<script setup>
import "~/assets/table-animation.less";

import { fileSizeFilter, isNotMobile } from "~/utils";
import { CalendarDaysIcon, CircleStackIcon, DocumentTextIcon } from "@heroicons/vue/24/outline";

// 业务代码
import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

// 文件数据相关
import useFileData from "~/composables/file/useFileData";
const { sortChangeMethod, skeletonData } = useFileData();

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

import useFileLoading from "~/composables/file/useFileLoading";
const { basicLoading, skeletonLoading } = useFileLoading();

// 表格选择
import useFileSelect from "~/composables/file/useFileSelect";
let { initSelectFun, checkSelectable, selectRowsChange, tableRowClassName } = useFileSelect();

const fileRef = ref();
onMounted(() => {
  initSelectFun(
    fileRef.value.clearSelection,
    fileRef.value.toggleRowSelection,
    fileRef.value.toggleAllSelection
  );
});

// 文件操作
import useTableOperator from "~/composables/file/useTableOperator";
const { tableClickRow, tableDbClickRow, tableHoverRow, tableLeaveRow } = useTableOperator();

import useFileContextMenu from "~/composables/file/useFileContextMenu";
const { showFileMenu } = useFileContextMenu();
</script>

<style scoped lang="scss">
// 用于页面数据为空时，撑满整个页面
#ListTable {
	// 左右收缩与顶部栏对齐
	@apply md:px-4 h-full;

	// 文件行选中效果
	:deep(.select-row) {
		background-color: var(--el-table-row-hover-bg-color);
	}

	// 空白页样式
	:deep(.el-table__empty-block) {
		@apply -mt-10;
	}
	:deep(.el-table__empty-text) {
		@apply w-full;
	}
	:deep(.empty-icon) {
		display: initial;
		@apply h-80 w-80;
	}

	// 隐藏横向滚动条
	:deep(.el-scrollbar__bar.is-horizontal) {
		@apply hidden #{!important};
	}
}

// 文件列表主体
.el-table {
	// 避免拖拽选中
	@apply select-none;

	:deep(.el-table__body-wrapper) {
		font-weight: 450;
	}

	/* 表头 -- icon 位置和大小 */
	.el-table__header-wrapper svg {
		@apply mr-2 -mt-0.5 w-3 inline;
	}

	/* 表身 -- 文件名列 icon 位置 */
	.el-table__body-wrapper .zfile-table-col-name svg {
		@apply relative align-middle text-xl mr-1.5 inline;
	}
}

// table default 模式样式
.el-table.el-table--default {

	/* 表头 -- icon 大小 */
	.el-table__header-wrapper svg {
		@apply w-4;
	}

	/* 表身 -- 文字大小 */
	.el-table__body-wrapper .zfile-table-col-name svg {
		@apply text-2xl;
	}
}

// table large 模式样式
.el-table.el-table--large {

	/* 表头 -- icon 大小 */
	.el-table__header-wrapper svg {
		@apply w-5;
	}

	/* 表身 -- 文字大小 */
	.el-table__body-wrapper .zfile-table-col-name svg {
		@apply text-3xl;
	}
}

.icon {
	width: 1em;
	height: 1em;
	fill: currentColor;
	overflow: hidden;
}
</style>