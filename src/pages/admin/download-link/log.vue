<template>
	<div class="zfile-admin-down-link">
		<admin-form-header hide-bottom-border sub-title="这里只记录用户通过直链/短链下载的记录，不包括文件预览，下载失败(超出访问次数，超出访问时间，无权限等)">
			<template #title>
				<div class="flex justify-between">
					<span>下载日志</span>
					<div v-if="siteSetting" class="flex space-x-1.5 justify-center items-center cursor-pointer">
						<span class="text-gray-400 text-sm font-bold">记录下载日志：</span>
						<el-switch v-model="siteSetting.recordDownloadLog" active-text="是" inactive-text="否" inline-prompt @change="saveData" />
					</div>
				</div>
			</template>
		</admin-form-header>

		<el-form inline
				 class="z-admin-search-from"
				 :size="globalConfigStore.adminSearch.size"
				 label-width="100"
				 ref="searchFormRef"
				 :label-position="globalConfigStore.adminSearch.labelPosition"
				 :model="searchParam">
			<el-row class="z-admin-search-from-row" :gutter="20">
				<el-col :span="globalConfigStore.adminSearch.spanSize">
					<el-form-item label="存储源" prop="storageKey">
						<el-select clearable v-model="searchParam.storageKey" placeholder="请选择存储源">
							<el-option
								v-for="item in storageList"
								:key="item.id"
								:label="item.name"
								:value="item.key">
								<div class="flex justify-between space-x-20">
									<span>{{ item.name }}</span>
									<span class="text-gray-400">{{ item.type.description }}</span>
								</div>
							</el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="globalConfigStore.adminSearch.spanSize">
					<el-form-item label="下载类型" prop="linkType">
						<el-select clearable v-model="searchParam.linkType" placeholder="请选择下载类型">
							<el-option label="直链" value="directLink"></el-option>
							<el-option label="短链" value="shortLink"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="globalConfigStore.adminSearch.spanSize">
					<el-form-item label="短链 Key" prop="shortKey">
						<el-input clearable v-model="searchParam.shortKey"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="globalConfigStore.adminSearch.spanSize">
					<el-form-item label="文件路径" prop="path">
						<el-input clearable v-model="searchParam.path"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="globalConfigStore.adminSearch.spanSize">
					<el-form-item label="请求 IP" prop="ip">
						<el-input clearable v-model="searchParam.ip"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="globalConfigStore.adminSearch.spanSize">
					<el-form-item label="UserAgent" prop="userAgent">
						<el-input clearable v-model="searchParam.userAgent"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="globalConfigStore.adminSearch.spanSize">
					<el-form-item label="Referer" prop="referer">
						<el-input clearable v-model="searchParam.referer"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="globalConfigStore.adminSearch.spanSize">
					<el-form-item label="下载时间" prop="searchDate">
						<el-date-picker-plus
							class="w-full"
							:shortcuts="shortcuts"
							v-model="searchParam.searchDate"
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
					<el-button :icon="ArrowPathIcon" :loading="loading" @click="resetForm">重置</el-button>
				</el-col>
			</el-row>
		</el-form>

		<div class="z-admin-table-tools">
			<el-button :size="globalConfigStore.adminTable.size" @click="batchDeleteLink" :icon="TrashIcon"
					   type="danger">批量删除选中
			</el-button>
			<el-button :size="globalConfigStore.adminTable.size" @click="batchDeleteLinkLogByQuery"
					   :icon="TrashIcon" type="danger">删除全部页
			</el-button>
		</div>

		<el-table border :data="pageData" v-loading="loading" :size="globalConfigStore.adminTable.size" ref="tableRef">
			<el-table-column type="selection" width="55" />
			<el-table-column align="center" :fixed="isNotMobile" width="120" label="存储源名称">
				<template #default="scope">
					<el-tooltip :content="scope.row.storageType?.description" placement="right">
						<span>{{ scope.row.storageName }}</span>
					</el-tooltip>
				</template>
			</el-table-column>
			<el-table-column :fixed="isNotMobile" width="90" align="center" label="下载类型">
				<template #default="scope">
					<el-tag v-if="scope.row.shortKey" type="success">短链</el-tag>
					<el-tag v-else>直链</el-tag>
				</template>
			</el-table-column>
			<el-table-column min-width="400" show-overflow-tooltip prop="shortKey" label="下载链接">
				<template #default="scope">
					<div v-if="scope.row.shortKey">
						<span>{{ scope.row.shortLink }}</span>
						<i-ic-baseline-content-copy @click="copyText(scope.row.shortLink)" class="ml-2 inline cursor-pointer" />
						<i-material-symbols-open-in-new @click="openLink(scope.row.shortLink)" class="ml-1 inline cursor-pointer text-blue-500 text-sm" />
					</div>
					<div v-else>
						<span>{{ scope.row.pathLink }}</span>
						<i-ic-baseline-content-copy @click="copyText(scope.row.pathLink)" class="ml-2 inline cursor-pointer" />
						<i-material-symbols-open-in-new @click="openLink(scope.row.pathLink)" class="ml-1 inline cursor-pointer text-blue-500 text-sm" />
					</div>
				</template>
			</el-table-column>
			<el-table-column width="300" show-overflow-tooltip prop="path" label="文件路径" />
			<el-table-column width="100" show-overflow-tooltip prop="ip" label="请求 IP" />
			<el-table-column width="250" show-overflow-tooltip prop="userAgent" label="UserAgent" />
			<el-table-column width="200" show-overflow-tooltip prop="referer" label="Referer" />
			<el-table-column width="170" prop="createTime" label="下载时间" />
			<el-table-column fixed="right" align="center" width="80" label="操作">
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
	</div>
</template>

<script setup>
import { MagnifyingGlassIcon, TrashIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";

import { toClipboard } from "@soerenmartius/vue3-clipboard";
import { dateValueFormat, defaultTime, isNotMobile, shortcuts } from "~/utils";

import { loadStorageListReq } from "~/api/admin/admin-storage";
import { updateLinkSettingReq } from "~/api/admin/admin-setting";
import { batchDeleteDownloadLogReq, batchDeleteDownloadLogReqByQueryReq, deleteDownloadLogReq, getDownloadLogListReq } from "~/api/admin/admin-download-log";

import useAdminSetting from "~/composables/admin/useAdminSetting";
const { siteSetting, saveData } = useAdminSetting(updateLinkSettingReq);

import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();

const searchParam = ref({
	shortKey: "",
	linkType: "",
	storageKey: null,
	page: 1,
	limit: 10,
	path: "",
	ip: "",
	userAgent: "",
	referer: "",
	searchDate: [],
	total: 0
});

const searchFormRef = ref();
const resetForm = () => {
	searchFormRef.value.resetFields();
};

const pageData = ref();
const loading = ref(false);
const loadData = () => {
	loading.value = true;
	getDownloadLogListReq(searchParam.value).then(res => {
		pageData.value = res.data;
		searchParam.value.total = res.dataCount;
	}).finally(() => {
		loading.value = false;
	});
};

const storageList = ref();
const loadSourceList = () => {
	loadStorageListReq().then((response) => {
		storageList.value = response.data;
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
	deleteDownloadLogReq(id).then(res => {
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

	ElMessageBox.confirm(`是否确认删除选中的 ${selectionRows.length} 条直链下载日志？`, "提示", {
		type: "warning"
	}).then(() => {
		let ids = selectionRows.map(item => item.id);
		batchDeleteDownloadLogReq({ ids: ids }).then(res => {
			ElMessage.success("删除成功");
			loadData();
		});
	});
};

const batchDeleteLinkLogByQuery = () => {
	ElMessageBox.confirm(`是否确认删除当前查询条件下的 ${searchParam.value.total} 条直链下载日志？(如数量不对，请先点击查询后再用该功能按条件删除)`, "提示", {
		type: "warning"
	}).then(() => {
		batchDeleteDownloadLogReqByQueryReq(getSearchParam().value).then(res => {
			ElMessage.success("清空成功");
			loadData();
		});
	});
};

/**
 *  复制直链
 */
let copyText = (text) => {
	toClipboard(text).then(() => {
		ElMessage.success("复制成功");
	});
};

let openLink = (url) => {
	window.open(url);
};
</script>

<style scoped lang="scss">
</style>

<route lang="yaml">
meta:
  layout: admin
  name: 下载日志
</route>