<template>
	<div class="zfile-admin-down-link">
		<el-card>
			<div class="flex justify-between">
				<h3 class="text-lg leading-6 font-medium text-gray-900">
					直链日志
				</h3>
				<div v-if="data" class="flex space-x-1.5 justify-center items-center cursor-pointer">
					<span class="text-gray-400 text-sm font-bold">记录下载日志：</span>
					<el-switch @change="saveData"
					           active-text="是"
					           inline-prompt
					           inactive-text="否"
					           v-model="data.recordDownloadLog"></el-switch>
				</div>
			</div>

			<div class="mt-4">
				<el-form inline v-model="searchParam">
					<el-form-item label="存储源">
						<el-select clearable :teleported="false" v-model="searchParam.storageKey">
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
					<el-form-item label="短链 Key">
						<el-input v-model="searchParam.shortKey"></el-input>
					</el-form-item>
					<el-form-item label="文件名">
						<el-input v-model="searchParam.path"></el-input>
					</el-form-item>
					<el-form-item label="请求 IP">
						<el-input v-model="searchParam.ip"></el-input>
					</el-form-item>
					<el-form-item label="UserAgent">
						<el-input v-model="searchParam.userAgent"></el-input>
					</el-form-item>
					<el-form-item label="Referer">
						<el-input v-model="searchParam.referer"></el-input>
					</el-form-item>
					<el-form-item label="创建时间">
						<el-date-picker
							v-model="searchParam.date"
							type="daterange"
							value-format="YYYY-MM-DD HH:mm:ss"
							:default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59),]"
							range-separator="至"
							start-placeholder="开始时间"
							end-placeholder="结束时间"
						/>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" :icon="Search" @click="init">查询</el-button>
					</el-form-item>
				</el-form>

				<div>
					<el-button @click="batchDeleteLink" :icon="Delete" type="danger">批量删除</el-button>
				</div>

				<el-table ref="linkTableRef" size="large" :data="pageData" >
					<el-table-column type="selection" width="55" />
					<el-table-column width="120" label="存储源名称">
						<template #default="scope">
							<el-tooltip
								:content="scope.row.storageType.description"
								placement="right">
								<span>{{ scope.row.storageName }}</span>
							</el-tooltip>
						</template>
					</el-table-column>
					<el-table-column show-tooltip-when-overflow prop="shortKey" label="短链 key">
					</el-table-column>
					<el-table-column show-tooltip-when-overflow prop="path" label="路径">
					</el-table-column>
					<el-table-column width="100" show-tooltip-when-overflow prop="ip" label="请求 ip">
					</el-table-column>
					<el-table-column width="180" show-tooltip-when-overflow prop="userAgent" label="UserAgent">
					</el-table-column>
					<el-table-column width="150" show-tooltip-when-overflow prop="referer" label="Referer">
					</el-table-column>
					<el-table-column width="180" prop="createTime" label="创建时间">
					</el-table-column>
					<el-table-column width="100" label="操作">
						<template #default="scope">
							<el-popconfirm title="是否确认删除?" @confirm="deleteLink(scope.row.id)">
								<template #reference>
									<el-button :icon="Delete" type="danger">删除</el-button>
								</template>
							</el-popconfirm>
						</template>
					</el-table-column>
				</el-table>

				<el-config-provider :locale="zhCn">
					<el-pagination class="mt-3"
						:page-size="searchParam.limit"
						:background="true"
						layout="total, sizes, prev, pager, next"
						@current-change="handleCurrentChange"
						@size-change="handleSizeChange"
						v-model:current-page="searchParam.page"
						:default-current-page="10"
						:page-sizes="[10, 50, 100, 200]"
						:total="searchParam.total"/>
				</el-config-provider>
			</div>
		</el-card>
	</div>
</template>

<script setup>
import useLinkSetting from "~/composables/admin/link/useLinkSetting";
const { data, saveData, saveLoading } = useLinkSetting();

import {batchDeleteDownloadLog, deleteDownloadLog, getDownloadLogList} from "~/api/admin-download-link";
import zhCn from 'element-plus/lib/locale/lang/zh-cn'

import { Search, Delete } from "@element-plus/icons-vue";
import {loadStorageListReq} from "~/api/admin-storage";

const searchParam = reactive({
	shortKey: '',
	storageKey: null,
	page: 1,
	limit: 10,
	path: '',
	ip: '',
	userAgent: '',
	referer: '',
	date: '',
	dateFrom: '',
	dateTo: '',
	total: 0,
});

const handleSizeChange = (val) => {
	searchParam.limit = val;
	searchParam.page = 1;
	init();
};

const handleCurrentChange = (val) => {
	searchParam.page = val;
	init();
};

const pageData = ref();

const init = () => {
	if (searchParam.date instanceof Array) {
		searchParam.dateFrom = searchParam.date[0];
		searchParam.dateTo = searchParam.date[1];
	} else {
		searchParam.dateFrom = '';
		searchParam.dateTo = '';
	}
	getDownloadLogList(searchParam).then(res => {
		pageData.value = res.data;
		searchParam.total = res.dataCount;
	});
}

onMounted(() => {
	init();
	loadSourceList();
})


const storageList = ref();
const loadSourceList = () => {
	loadStorageListReq().then((response) => {
		storageList.value = response.data;
	});
}


const deleteLink = (id) => {
	deleteDownloadLog(id).then(res => {
		ElMessage.success('删除成功');
		init();
	});
}


const linkTableRef = ref();

const batchDeleteLink = () => {
	let selectionRows = linkTableRef.value.getSelectionRows();
	if (selectionRows.length === 0) {
		ElMessage.warning('请至少选择一条数据');
		return;
	}

	ElMessageBox.confirm('是否确认删除？', '提示', {
		type: 'warning'
	}).then(() => {
		let ids = selectionRows.map(item => item.id);
		batchDeleteDownloadLog({id: ids}).then(res => {
			ElMessage.success('删除成功');
			init();
		});
	});
}

</script>

<style scoped lang="scss">
.zfile-admin-down-link {
	:deep(.el-select-dropdown__item) {
		padding-right: 15px;
	}

	:deep(.el-dialog__header) {
		text-align: center;
	}

	:deep(.el-dialog__body) {
		height: 80vh;
		overflow-y: auto;
	}

}
</style>

<route lang="yaml">
meta:
  layout: admin
  name: 直链日志
</route>