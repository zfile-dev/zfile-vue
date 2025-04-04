<template>
	<div>

		<admin-form-header hide-bottom-border title="用户管理" />

		<el-form inline
				 class="z-admin-search-from"
				 :size="globalConfigStore.adminSearch.size"
				 label-width="80"
				 :label-position="globalConfigStore.adminSearch.labelPosition"
				 ref="searchFormRef"
				 :model="searchParam">
			<el-row class="z-admin-search-from-row" :gutter="20">
				<el-col :span="globalConfigStore.adminSearch.spanSize">
					<el-form-item label="用户名" prop="username">
						<el-input v-model="searchParam.username" placeholder="请输入" />
					</el-form-item>
				</el-col>
				<el-col :span="globalConfigStore.adminSearch.spanSize">
					<el-form-item label="昵称" prop="nickname">
						<el-input v-model="searchParam.nickname" placeholder="请输入" />
					</el-form-item>
				</el-col>
				<el-col :span="globalConfigStore.adminSearch.spanSize">
					<el-form-item label="启用状态" prop="enable">
						<el-select v-model="searchParam.enable" clearable placeholder="请选择">
							<el-option label="启用" :value="true" />
							<el-option label="禁用" :value="false" />
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="globalConfigStore.adminSearch.spanSize">
					<el-form-item label="创建时间" prop="searchDate">
						<el-date-picker-plus
							:editable="false"
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
					<el-button :icon="ArrowPathIcon" @click="resetForm">重置</el-button>
				</el-col>
			</el-row>
		</el-form>

		<div class="z-admin-table-tools">
			<el-button @click="addUserAction" :size="globalConfigStore.adminTable.size" :icon="PlusIcon" type="primary" />
		</div>

		<el-table-plus border :size="globalConfigStore.adminTable.size" :data="userListData" v-loading="loading"
					   @sort-change="sortChange" :default-sort="{ prop: 'id', order: 'ascending' }">
			<el-table-column-plus sortable="custom" align="center" type="selection"/>
			<el-table-column-plus sortable="custom" align="center" width="75" prop="id" label="ID" />
			<el-table-column-plus sortable="custom" min-width="200px" prop="username" label="用户名">
				<template #default="scope">
					<div class="flex justify-between space-x-2">
						<span>{{ scope.row.username }}</span>
						<span>
						  <el-tag v-if="scope.row.id === adminId" effect="dark">管理员</el-tag>
						  <el-tag v-else-if="scope.row.id === guestId" effect="dark" type="success">匿名用户</el-tag>
						  <el-tag v-else>普通用户</el-tag>
						</span>
					</div>
				</template>
			</el-table-column-plus>
			<el-table-column-plus width="120" prop="nickname" label="昵称" />
			<el-table-column-plus width="120" show-overflow-tooltip align="center" label="存储源列表">
				<template #default="scope">
					<el-popover :disabled="scope.row.userStorageSourceList.length === 0" placement="left"
								:width="300">
						<template #reference>
							<el-tag effect="dark">{{ scope.row.userStorageSourceList.length }} 个</el-tag>
						</template>
						<div class="space-y-2">
							<div class="space-x-2" v-for="item in scope.row.userStorageSourceList"
								 :key="item.id">
								<span class="font-bold">{{ item.storageSourceName }}</span>
								<el-tag>{{ item.storageSourceType.description }}</el-tag>
								<el-tag>{{ item.rootPath }}</el-tag>
							</div>
						</div>
					</el-popover>
				</template>
			</el-table-column-plus>
			<el-table-column-plus sortable="custom" align="center" header-align="center" width="115" prop="enable" label="启用状态">
				<template #default="scope">
					<el-switch
						v-model="scope.row.enable"
						:disabled="scope.row.id === adminId"
						@change="changeEnable(scope.row)"
					/>
				</template>
			</el-table-column-plus>
			<el-table-column-plus sortable="custom" width="175" align="center" prop="createTime" label="创建时间" />
			<el-table-column-plus width="90" align="center" label="操作">
				<template #default="scope">
					<div class="space-x-2">
						<router-link :to="`/admin/user-edit/${scope.row.id}`">
							<i-mdi-rename-outline class="z-btn-primary" />
						</router-link>
						<el-tooltip content="复制">
							<ClipboardDocumentIcon @click="openCopyUserDialog(scope.row)" class="z-btn-primary" />
						</el-tooltip>
						<el-popconfirm title="是否确认删除?" confirm-button-text="是" cancel-button-text="否" @confirm="deleteUser(scope.row.id)">
							<template #reference>
								<TrashIcon class="z-btn-danger" />
							</template>
						</el-popconfirm>
					</div>
				</template>
			</el-table-column-plus>
		</el-table-plus>

		<user-copy @close="loadData" />
	</div>
</template>

<script setup>
import { MagnifyingGlassIcon, ArrowPathIcon, TrashIcon, PlusIcon, ClipboardDocumentIcon } from "@heroicons/vue/24/outline";
import { dateValueFormat, defaultTime, shortcuts } from "~/utils";

import { getUserListReq, deleteUserReq, updateUserEnableReq } from "~/api/admin/admin-user";
import UserCopy from '~/pages/admin/user-copy/index.vue';

import useGlobalConfigStore from "~/stores/global-config";
const globalConfigStore = useGlobalConfigStore();

import useUserCopy from '~/composables/admin/user/user-copy'
const { openDialog: openCopyUserDialog } = useUserCopy();

let router = useRouter();

const adminId = 1;
const guestId = 2;

const searchParam = reactive({
  username: '',
  nickname: '',
  enable: null,
  dateFrom: '',
  dateTo: '',
  sortField: 'id',
  sortAsc: true,
  hideDisabledStorage: true
});

const loading = ref(false);
const userListData = ref([]);
const loadData = () => {
  loading.value = true;
  getUserListReq(searchParam).then(res => {
    userListData.value = res.data;
  }).finally(() => {
    loading.value = false;
  });
}

const sortChange = (sort) => {
  searchParam.sortField = sort.prop;
  searchParam.sortAsc = sort.order === 'ascending';
  loadData();
}

onMounted(() => {
  loadData();
})

const addUserAction = () => {
  router.push('/admin/user-edit');
}

const deleteUser = (id) => {
  deleteUserReq(id).then(res => {
    ElMessage.success('删除成功');
    loadData();
  });
}

const changeEnable = (row) => {
  if (row.id === adminId) {
    ElMessage.warning('管理员账号不允许禁用');
    row.enable = true;
    return;
  }
  updateUserEnableReq(row.id, row.enable).then(res => {
    ElMessage.success('修改成功');
  });
}

const searchFormRef = ref();
const resetForm = () => {
  searchFormRef.value.resetFields()
}
</script>

<style scoped lang="scss">
</style>

<route lang="yaml">
meta:
  layout: admin
  name: 用户管理
</route>
