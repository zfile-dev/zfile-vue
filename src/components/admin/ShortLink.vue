<template>
    <el-card class="zfile-admin-short-card">
        <el-form :inline="true"  class="zfile-admin-short-form" :model="searchParam">
            <el-form-item label="直链 Key">
                <el-input size="small" v-model="searchParam.key"></el-input>
            </el-form-item>
            <el-form-item label="路径/文件名">
                <el-input size="small" v-model="searchParam.url"></el-input>
            </el-form-item>
            <el-form-item label="创建日期">
                <el-date-picker
                    v-model="date"
                    type="daterange"
                    align="right"
                    unlink-panels
                    value-format="yyyy-MM-dd"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    @change="dateChange"
                    :picker-options="pickerOptions">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="init" size="small" icon="el-icon-search">查询</el-button>
            </el-form-item>
        </el-form>

        <el-table
            :data="linkLog"
            @sort-change="sortMethod"
            :default-sort = "{prop: 'createDate', order: 'descending'}"
            ref="operatorTable">
            <el-table-column
                type='index'
                label="序号">
            </el-table-column>
            <el-table-column
                prop="key"
                :show-overflow-tooltip="true"
                width="100"
                sortable="custom"
                :sort-orders="['ascending', 'descending']"
                label="Key">
            </el-table-column>
            <el-table-column
                prop="url"
                :show-overflow-tooltip="true"
                sortable="custom"
                :sort-orders="['ascending', 'descending']"
                label="路径">
            </el-table-column>
            <el-table-column
                prop="createDate"
                width="150"
                sortable="custom"
                :sort-orders="['ascending', 'descending']"
                label="创建日期">
            </el-table-column>
            <el-table-column
                width="120"
                label="操作">
                <template slot-scope="scope">
                    <el-popconfirm
                        @confirm="deleteLink(scope.row.id)"
                        confirmButtonText='确定'
                        cancelButtonText='取消'
                        icon="el-icon-info"
                        iconColor="red"
                        title="确定删除此直链">
                        <el-button slot="reference" class="el-icon-delete" size="mini" type="danger">删除</el-button>
                    </el-popconfirm>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination background
                       @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"
                       :current-page="searchParam.page"
                       :page-sizes="[10, 50, 100, 200]"
                       layout="total, sizes, prev, pager, next, jumper"
                       :page-size="searchParam.limit"
                       :total="searchParam.total">
        </el-pagination>
    </el-card>
</template>

<script>
export default {
    name: "ShortLink",
    data() {
        return {
            linkUrl: '',
            linkLog: [],
            searchParam: {
                page: 1,
                limit: 10,
                total: 0,
                url: '',
                key: "",
                orderBy: '',
                orderDirection: '',
            },
            pickerOptions: {
                shortcuts: [{
                    text: '最近一周',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近一个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近三个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                        picker.$emit('pick', [start, end]);
                    }
                }]
            },
            date: ['', '']
        }
    },
    methods: {
        dateChange() {
            if (this.date) {
                this.searchParam.dateFrom = this.date[0];
                this.searchParam.dateTo = this.date[1];
            } else {
                this.searchParam.dateFrom = "";
                this.searchParam.dateTo = "";
            }
        },
        sortMethod({prop, order}) {
            this.searchParam.orderBy = prop;
            this.searchParam.orderDirection = order === "descending" ? "desc" : "asc";
            this.init();
        },
        handleSizeChange(val) {
            this.searchParam.limit = val;
            this.searchParam.page = 1;
            this.init();
        },
        handleCurrentChange(val) {
            this.searchParam.page = val;
            this.init();
        },
        deleteLink(id) {
            this.$http.get(`admin/link/delete/${id}`).then((response) => {
                if (response.data.code === this.common.responseCode.SUCCESS) {
                    this.$message.success('删除成功');
                    this.init();
                } else {
                    this.$message.error(response.data.msg);
                }
            });
        },
        init() {
            this.$http.get('admin/link/list', {params: this.searchParam}).then((response) => {
                this.linkLog = response.data.data.content;
                this.searchParam.total = response.data.data.totalElements;
                this.searchParam.limit = response.data.data.size;
            });
        },
    },
    mounted() {
        this.init();
    }
}
</script>

<style scoped>
    .zfile-admin-short-form >>> .el-form-item:first-child {
        margin-left: 10px;
    }

    .zfile-admin-short-form >>> .el-form-item:not(:first-child) {
        margin-left: 20px;
    }

    .el-pagination {
        margin-top: 15px;
    }

    .table-edit-icon {
        margin-left: 10px;
        cursor: pointer;
    }
</style>
