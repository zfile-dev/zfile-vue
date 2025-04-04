<template>
	<div class="zfile-admin-down-link">
		<admin-form-header hide-bottom-border>
			<template #title>
				<div class="flex justify-between">
					<span>短链管理</span>
					<span @click="openSettingVisible">
						<AdjustmentsHorizontalIcon class="h-5 w-5 text-blue-500 cursor-pointer" />
					</span>
				</div>
			</template>
		</admin-form-header>

		<el-form inline
				 class="z-admin-search-from"
				 :size="globalConfigStore.adminSearch.size"
				 label-width="80"
				 ref="searchFormRef"
				 :label-position="globalConfigStore.adminSearch.labelPosition"
				 :model="searchParam">
			<el-row class="z-admin-search-from-row" :gutter="20">
				<el-col :span="globalConfigStore.adminSearch.spanSize">
					<el-form-item label="存储源" prop="storageId">
						<el-select v-model="searchParam.storageId" placeholder="请选择存储源" clearable>
							<el-option v-for="item in storageList" :key="item.id" :label="item.name" :value="item.id">
								<div class="flex justify-between space-x-20">
									<span>{{ item.name }}</span>
									<span class="text-gray-400">{{ item.type.description }}</span>
								</div>
							</el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="globalConfigStore.adminSearch.spanSize">
					<el-form-item label="文件名" prop="url">
						<el-input v-model="searchParam.url" clearable />
					</el-form-item>
				</el-col>
				<el-col :span="globalConfigStore.adminSearch.spanSize">
					<el-form-item label="短链 Key" prop="key">
						<el-input v-model="searchParam.key" clearable />
					</el-form-item>
				</el-col>
				<el-col :span="globalConfigStore.adminSearch.spanSize">
					<el-form-item label="创建时间" prop="searchDate">
						<el-date-picker-plus
							v-model="searchParam.searchDate"
							:shortcuts="shortcuts"
							type="daterange"
							:value-format="dateValueFormat"
							:default-time="defaultTime"
							range-separator="至"
							start-placeholder="开始时间"
							end-placeholder="结束时间"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="globalConfigStore.adminSearch.spanSize">
					<el-button type="primary" :icon="MagnifyingGlassIcon" :loading="loading" @click="loadData">
						查询
					</el-button>
					<el-button :icon="ArrowPathIcon" @click="resetForm">重置</el-button>
				</el-col>
			</el-row>
		</el-form>

		<div class="z-admin-table-tools">
			<el-button :size="globalConfigStore.adminTable.size" @click="batchDeleteLink" :icon="TrashIcon" type="danger">
				批量删除
			</el-button>
			<el-button :size="globalConfigStore.adminTable.size" @click="deleteExpireLink" :icon="TrashIcon" type="danger">
				批量删除过期短链
			</el-button>
			<el-button :size="globalConfigStore.adminTable.size" @click="batchExportLink" :icon="DocumentArrowDownIcon" type="primary">
				导出短链
			</el-button>
		</div>

		<el-table border :data="pageData" v-loading="loading" :size="globalConfigStore.adminTable.size" ref="tableRef">
			<el-table-column type="selection" width="55" />
			<el-table-column width="120" label="存储源名称">
				<template #default="scope">
					<el-tooltip :content="scope.row.storageType?.description" placement="right">
						<span>{{ scope.row.storageName }}</span>
					</el-tooltip>
				</template>
			</el-table-column>
			<el-table-column width="150" prop="shortKey" label="短链 Key">
				<template #default="scope">
					<div class="space-x-2">
						<span>{{ scope.row.shortKey }}</span>
						<i-ic-baseline-content-copy @click="copyText(scope.row.shortKey)" class="inline cursor-pointer" />
						<i-material-symbols-open-in-new @click="openLink(scope.row.shortKey)" class="inline cursor-pointer text-blue-500 text-sm" />
					</div>
				</template>
			</el-table-column>
			<el-table-column show-overflow-tooltip prop="url" label="路径" />
			<el-table-column width="180" prop="createDate" label="创建时间" />
			<el-table-column width="180" prop="expireDate" label="过期时间">
				<template #default="scope">
					<div :class="dayjs(scope.row.expireDate).isBefore(dayjs().format('YYYY-MM-DD HH:mm')) ? 'text-red-500' : ''">
						<span>{{ scope.row.expireDate }}</span>
					</div>
				</template>
			</el-table-column>
			<el-table-column width="60" label="操作">
				<template #default="scope">
					<el-popconfirm title="是否确认删除?" @confirm="deleteLink(scope.row.id)">
						<template #reference>
							<TrashIcon class="z-btn-danger" />
						</template>
					</el-popconfirm>
				</template>
			</el-table-column>
		</el-table>

		<el-pagination class="mt-3"
					   :page-size="searchParam.limit" background
					   :layout="globalConfigStore.adminTable.pager.layout"
					   :size="globalConfigStore.adminTable.pager.size"
					   :pager-count="globalConfigStore.adminTable.pager.pagerCount"
					   @current-change="handleCurrentChange"
					   @size-change="handleSizeChange"
					   v-model:current-page="searchParam.page"
					   :default-current-page="10"
					   :page-sizes="[10, 50, 100, 200, 1000, 99999999]"
					   :total="searchParam.total" />

		<el-dialog v-model="settingVisible" :destroy-on-close="true"
				   title="直链设置"
				   class="zfile-admin-down-link-dialog"
				   draggable
				   top="5vh"
				   width="80%">
			<basic-setting />
		</el-dialog>
	</div>
</template>

<script setup>
import { MagnifyingGlassIcon, ArrowPathIcon, TrashIcon, DocumentArrowDownIcon, AdjustmentsHorizontalIcon } from "@heroicons/vue/24/outline";
import dayjs from "dayjs";
import { toClipboard } from "@soerenmartius/vue3-clipboard";
import { concatPath, dateValueFormat, defaultTime, shortcuts } from "~/utils";

import BasicSetting from "~/pages/admin/download-link/basic-setting.vue";

import { loadStorageListReq } from "~/api/admin/admin-storage";
import { batchDeleteShortLinkReq, deleteExpireLinkReq, deleteShortLinkReq, exportShortLinkListReq, getShortLinkListReq } from "~/api/admin/admin-short-link";

import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();

const settingVisible = ref(false);
const openSettingVisible = () => {
	settingVisible.value = true;
};

const searchParam = ref({
	storageId: null,
	page: 1,
	limit: 10,
	key: "",
	url: "",
	searchDate: [],
	total: 0
});

const searchFormRef = ref();
const resetForm = () => {
	searchFormRef.value.resetFields();
};

const storageList = ref();
const loadSourceList = () => {
	loadStorageListReq().then((response) => {
		storageList.value = response.data;
	});
};

const pageData = ref();
const loading = ref(false);
const loadData = () => {
	loading.value = true;
	getShortLinkListReq(searchParam.value).then(res => {
		pageData.value = res.data;
		searchParam.value.total = res.dataCount;
	}).finally(() => {
		loading.value = false;
	});
};

onMounted(() => {
	loadData();
	loadSourceList();
});

const handleSizeChange = (val) => {
	searchParam.value.limit = val;
	searchParam.value.page = 1;
	loadData();
};

const handleCurrentChange = (val) => {
	searchParam.value.page = val;
	loadData();
};

const deleteLink = (id) => {
	deleteShortLinkReq(id).then(res => {
		ElMessage.success("删除成功");
		loadData();
	});
};

const tableRef = ref();
const batchDeleteLink = () => {
	let selectionRows = tableRef.value.getSelectionRows();
	if (selectionRows.length === 0) {
		ElMessage.warning("请至少选择一条数据");
		return;
	}

	ElMessageBox.confirm("是否确认删除？", "提示", {
		type: "warning"
	}).then(() => {
		let ids = selectionRows.map(item => item.id);
		batchDeleteShortLinkReq({ ids: ids }).then(res => {
			ElMessage.success("删除成功");
			loadData();
		});
	});
};

const deleteExpireLink = () => {
	ElMessageBox.confirm("是否确认删除过期短链并级联删除其下载日志？", "提示", {
		type: "warning"
	}).then(() => {
		deleteExpireLinkReq().then(res => {
			ElMessage.success(`成功删除 ${res.data} 条.`);
			loadData();
		});
	});
};

const batchExportLink = () => {
	const loading = ElLoading.service({
		fullscreen: true,
		lock: true,
		text: "下载中...",
		background: "rgba(0, 0, 0, 0.5)"
	});
	exportShortLinkListReq(searchParam.value).then((res) => {
		const { data, headers } = res;
		const fileName = `ZFile 短链导出 - ${dayjs().format("YYYY-MM-DD HH:mm:ss")}.xlsx`;
		// 此处当返回json文件时需要先对data进行JSON.stringify处理，其他类型文件不用做处理
		//const blob = new Blob([JSON.stringify(data)], ...)
		const blob = new Blob([data], { type: headers["content-type"] });
		let dom = document.createElement("a");
		let url = window.URL.createObjectURL(blob);
		dom.href = url;
		dom.download = decodeURI(fileName);
		dom.style.display = "none";
		document.body.appendChild(dom);
		dom.click();
		dom.parentNode.removeChild(dom);
		window.URL.revokeObjectURL(url);
	}).catch(() => {
		ElMessage.error("下载失败.");
	}).finally(() => {
		loading.close();
	});
};

/**
 *  复制直链
 */
let copyText = (text) => {
	toClipboard(concatPath(globalConfigStore.serverAddress, "s", text)).then(() => {
		ElMessage.success("复制成功");
	});
};

/**
 * 打开短链
 */
let openLink = (shortLink) => {
	window.open(concatPath(globalConfigStore.serverAddress, "s", shortLink));
};


// 比较直链是否过期, 输入时间格式为 2023-05-01 18:33
let isExpiredDate = (date) => {
	let now = dayjs().format('YYYY-MM-DD HH:mm');
	return dayjs(date).isBefore(now);
};
</script>

<style scoped lang="scss">
.zfile-admin-down-link {
	:deep(.el-dialog__header) {
		text-align: center;
	}

	:deep(.el-dialog__body) {
		padding: 20px;
		height: 80vh;
		overflow-y: auto;
	}
}
</style>

<route lang="yaml">
meta:
  layout: admin
  name: 短链管理
</route>