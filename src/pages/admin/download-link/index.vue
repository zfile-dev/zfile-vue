<template>
	<div class="zfile-admin-down-link">
		<el-card>
			<div class="flex justify-between">
				<h3 class="text-lg leading-6 font-medium text-gray-900">
					直链管理
				</h3>
				<div class="flex space-x-1.5 justify-center items-center cursor-pointer">
					<span @click="openSettingVisible">
						<i-custom-settings class="text-xl"></i-custom-settings>
					</span>
				</div>
			</div>

			<div class="mt-4">
				<el-form inline v-model="searchParam">
					<el-form-item label="存储源">
						<el-select clearable :teleported="false" v-model="searchParam.storageId">
							<el-option
								v-for="item in storageList"
								:key="item.id"
								:label="item.name"
								:value="item.id">
								<div class="flex justify-between space-x-20">
									<span>{{ item.name }}</span>
									<span class="text-gray-400">{{ item.type.description }}</span>
								</div>
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="文件名">
						<el-input v-model="searchParam.url"></el-input>
					</el-form-item>
					<el-form-item label="短链 Key">
						<el-input v-model="searchParam.key"></el-input>
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
								:content="scope.row.storageType?.description"
								placement="right">
								<span>{{ scope.row.storageName }}</span>
							</el-tooltip>
						</template>
					</el-table-column>
					<el-table-column width="150" prop="shortKey" label="短链 Key">
            <template #default="scope">
              <div class="space-x-2">
                <span>{{scope.row.shortKey}}</span>
                <svg-icon @click="copyText(scope.row.shortKey)" class="inline cursor-pointer" name="copy"></svg-icon>
                <svg-icon @click="openLink(scope.row.shortKey)" class="inline cursor-pointer text-blue-500 text-sm" name="target"></svg-icon>
              </div>
            </template>
					</el-table-column>
					<el-table-column show-tooltip-when-overflow prop="url" label="路径">
					</el-table-column>
					<el-table-column width="180" prop="createDate" label="创建时间">
					</el-table-column>
					<el-table-column width="120" label="操作">
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
			           background
						layout="total, sizes, prev, pager, next, jumper"
						@current-change="handleCurrentChange"
						@size-change="handleSizeChange"
						v-model:current-page="searchParam.page"
						:default-current-page="10"
						           :page-sizes="[10, 50, 100, 200, 1000, 99999999]"
						:total="searchParam.total"/>
				</el-config-provider>
			</div>
		</el-card>

		<el-dialog v-model="settingVisible" :destroy-on-close="true"
		           title="直链设置"
		           custom-class="zfile-admin-down-link-dialog"
		           draggable
		           top="5vh"
		           width="80%">
			<basic-setting></basic-setting>
		</el-dialog>
	</div>
</template>

<script setup>
import BasicSetting from "~/pages/admin/download-link/basic-setting.vue";
import {batchDeleteShortLink, deleteShortLink, getShortLinkList} from "~/api/admin-download-link";
import zhCn from 'element-plus/lib/locale/lang/zh-cn'

import { Search, Delete } from "@element-plus/icons-vue";
import {loadStorageListReq} from "~/api/admin-storage";
import { toClipboard } from "@soerenmartius/vue3-clipboard";
import { loadConfigReq } from "~/api/admin-setting";

const settingVisible = ref(false);
const openSettingVisible = () => {
	settingVisible.value = true;
}

const searchParam = reactive({
	storageId: null,
	page: 1,
	limit: 10,
	key: '',
	url: '',
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
	getShortLinkList(searchParam).then(res => {
		pageData.value = res.data;
		searchParam.total = res.dataCount;
	});
}

onMounted(() => {
	init();
	loadSourceList();
  loadSystemConfig();
})


const storageList = ref();
const loadSourceList = () => {
	loadStorageListReq().then((response) => {
		storageList.value = response.data;
	});
}


const deleteLink = (id) => {
	deleteShortLink(id).then(res => {
		ElMessage.success('删除成功');
		init();
	});
}

const systemConfig = ref();
const loadSystemConfig = () => {
  loadConfigReq().then(res => {
    systemConfig.value = res.data;
  })
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
		batchDeleteShortLink({ids: ids}).then(res => {
			ElMessage.success('删除成功');
			init();
		});
	});
}


/**
 *  复制直链
 */
let copyText = (text) => {
  toClipboard(text).then(() => {
    ElMessage.success('复制成功');
  });
}

/**
 * 打开短链
 */
let openLink = (shortLink) => {
  window.open(`${systemConfig.value.domain}/s/${shortLink}`);
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
  name: 直链管理
</route>