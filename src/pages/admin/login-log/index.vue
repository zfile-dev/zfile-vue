<template>
  <div>
    <admin-form-header title="登录日志" hide-bottom-border/>

    <el-form inline
             class="z-admin-search-from"
             :size="globalConfigStore.adminSearch.size"
             label-width="80"
             ref="searchFormRef"
             :label-position="globalConfigStore.adminSearch.labelPosition"
             :model="searchParam">
      <el-row class="z-admin-search-from-row" :gutter="20">
        <el-col :span="globalConfigStore.adminSearch.spanSize">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="searchParam.username" />
          </el-form-item>
        </el-col>
        <el-col :span="globalConfigStore.adminSearch.spanSize">
          <el-form-item label="密码" prop="password">
            <el-input v-model="searchParam.password" />
          </el-form-item>
        </el-col>
        <el-col :span="globalConfigStore.adminSearch.spanSize">
          <el-form-item label="登录结果" prop="result">
            <el-input v-model="searchParam.result" />
          </el-form-item>
        </el-col>
        <el-col :span="globalConfigStore.adminSearch.spanSize">
          <el-form-item label="请求 IP" prop="ip">
            <el-input v-model="searchParam.ip" />
          </el-form-item>
        </el-col>
        <el-col :span="globalConfigStore.adminSearch.spanSize">
          <el-form-item label="UserAgent" prop="userAgent">
            <el-input v-model="searchParam.userAgent" />
          </el-form-item>
        </el-col>
        <el-col :span="globalConfigStore.adminSearch.spanSize">
          <el-form-item label="Referer" prop="referer">
            <el-input v-model="searchParam.referer" />
          </el-form-item>
        </el-col>
        <el-col :span="globalConfigStore.adminSearch.spanSize">
          <el-form-item label="登录时间" prop="searchDate">
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
          <el-button type="primary" :icon="MagnifyingGlassIcon" @click="loadData" :loading="loading">查询</el-button>
          <el-button :icon="ArrowPathIcon" :loading="loading" @click="resetForm">重置</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table border :data="pageData" :size="globalConfigStore.adminTable.size" v-loading="loading">
      <el-table-column label="用户名" prop="username" />
      <el-table-column label="密码" prop="password" />
      <el-table-column width="250" show-overflow-tooltip prop="result" label="登录结果" />
      <el-table-column width="180" prop="createTime" label="登录时间" />
      <el-table-column width="100" show-overflow-tooltip prop="ip" label="请求 IP" />
      <el-table-column show-overflow-tooltip prop="userAgent" label="UserAgent" />
      <el-table-column show-overflow-tooltip prop="referer" label="Referer" />
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
import { MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";

import { dateValueFormat, defaultTime, shortcuts } from "~/utils";

import { getLoginLogListReq } from "~/api/admin/admin-login-log";

import useGlobalConfigStore from "~/stores/global-config";
const globalConfigStore = useGlobalConfigStore();

const searchParam = reactive({
  page: 1,
  limit: 10,
  username: "",
  password: "",
  result: "",
  ip: "",
  userAgent: "",
  referer: "",
  dateFrom: "",
  dateTo: "",
  searchDate: [],
  total: 0
});

const handleSizeChange = (val) => {
  searchParam.limit = val;
  searchParam.page = 1;
  loadData();
};

const handleCurrentChange = (val) => {
  searchParam.page = val;
  loadData();
};

const pageData = ref();
const loading = ref(false);
const loadData = () => {
  loading.value = true;
  getLoginLogListReq(searchParam).then(res => {
    pageData.value = res.data;
    searchParam.total = res.dataCount;
  }).finally(() => {
    loading.value = false;
  });
};

onMounted(() => {
  loadData();
});

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
  name: 下载日志
</route>