<template>
    <el-card>
        <div>
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="addDrive">新增</el-button>
        </div>

        <el-table
            :data="driveList"
            ref="driveTable"
            row-key="id"
            highlight-current-row>
                <el-table-column
                        prop="id"
                        width="80"
                        label="驱动器ID">
                </el-table-column>
                <el-table-column
                        prop="name"
                        :show-overflow-tooltip="true"
                        label="驱动器名称">
                </el-table-column>
                <el-table-column
                        prop="type"
                        :formatter="typeFormatter"
                        :show-overflow-tooltip="true"
                        width="100"
                        label="所属策略">
                </el-table-column>
                <el-table-column
                        prop="enable"
                        width="100"
                        label="是否启用">
                    <template slot-scope="scope">
                        <el-switch @change="switchEnableStatus(scope.row)" v-model="scope.row.enable"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column
                        prop="enableCache"
                        width="100"
                        label="缓存开启">
                    <template slot-scope="scope">
                        <el-switch @change="switchCacheEnableStatus(scope.row)" v-model="scope.row.enableCache"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column
                        prop="autoRefreshCache"
                        width="120"
                        label="缓存自动刷新">
                    <template slot-scope="scope">
                        <el-switch @change="switchAutoRefreshStatus(scope.row)" v-model="scope.row.autoRefreshCache"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column
                        label="操作"
                        width="400">
                    <template slot-scope="scope">
                        <template>
                            <el-button slot="reference" class="el-icon-edit" size="mini" type="primary" @click="editDrive(scope.row)">编辑</el-button>
                            <el-button slot="reference" :disabled="!scope.row.enableCache" class="el-icon-s-operation" size="mini" type="primary" @click="cacheManage(scope.row)">缓存管理</el-button>
                            <el-button class="el-icon-view" size="mini" type="primary" @click="showFilterDialog(scope.row)">文件过滤</el-button>
                            <el-button @click="deleteDrive(scope.row)" class="el-icon-delete" size="mini" type="danger">删除</el-button>
                        </template>
                    </template>
                </el-table-column>
            </el-table>

        <el-dialog width="80%" title="驱动器设置" :modal-append-to-body="false" :visible.sync="driveEditDialogVisible" top="10vh" :destroy-on-close="true">
            <drive-edit :drive-item="driveItem" :close="closeDriveEdit" :support-strategy="supportStrategy"></drive-edit>
        </el-dialog>

        <el-dialog width="40%" title="过滤规则" :modal-append-to-body="false" :visible.sync="filterDialogVisible" top="10vh" :destroy-on-close="true">
            <filter-pattern :drive-id="currentCacheManageId" :close="closeFilterDialog"></filter-pattern>
        </el-dialog>

        <el-dialog width="70%" title="缓存管理" :modal-append-to-body="false" :visible.sync="cacheManageVisible" top="10vh" :destroy-on-close="true" @close="closeCacheManage">
            <cache-manager :current-cache-manage-id="this.currentCacheManageId"></cache-manager>
        </el-dialog>

    </el-card>
</template>

<script>
    import Sortable from "sortablejs";
    import qs from 'qs';
    import DriveEdit from "@/components/admin/DriveEdit";
    import CacheManager from "@/components/admin/CacheManager";
    import FilterPattern from "@/components/admin/FilterPattern";

    export default {
        name: "DriveList",
        components: {FilterPattern, CacheManager, DriveEdit},
        data() {
            return {
                loading: false,
                driveList: [],
                supportStrategy: [],
                driveItem: {
                    orderNum: null,
                    name: '',
                    type: null,
                    searchEnable: false,
                    searchIgnoreCase: false,
                    searchContainEncryptedFile: false,
                    enableCache: false,
                    autoRefreshCache: false,
                    storageStrategyConfig: {
                        endPoint: '',
                        pathStyle: '',
                        isPrivate: false,
                        accessKey: null,
                        secretKey: null,
                        bucketName: null,
                        host: null,
                        port: null,
                        filePath: null,
                        accessToken: null,
                        refreshToken: null,
                        secretId: null,
                        username: null,
                        password: null,
                        basePath: "",
                        domain: ""
                    },
                },
                sortable: null,
                driveEditDialogVisible: false,
                filterDialogVisible: false,
                cacheManageVisible: false,
                currentCacheManageId: null
            }
        },
        methods: {
            setSort() {
                const tbody = document.querySelector('.el-table__body-wrapper tbody')
                Sortable.create(tbody, {
                    onEnd: e => {
                        if (this.driveList.length < 2) {
                            return;
                        }
                        const currRow = this.driveList.splice(e.oldIndex, 1)[0];
                        this.driveList.splice(e.newIndex, 0, currRow)

                        this.$http.post('admin/drive/drag', this.driveList).then(() => {
                            this.$message({
                                message: '调整排序成功',
                                type: 'success'
                            });
                        });
                    }
                })
            },
            clearCache() {
                this.$http.post(`admin/cache/${this.currentCacheManageId}/clear`).then(() => {
                    this.loadCacheManageData();
                    this.$message({
                        message: '清理成功',
                        type: 'success'
                    });
                });
            },
            closeCacheManage() {
                this.cacheSearch = "";
            },
            cacheManage(row) {
                this.currentCacheManageId = row.id;
                this.cacheManageVisible = true;
            },
            showFilterDialog(row) {
                this.currentCacheManageId = row.id;
                this.filterDialogVisible = true;
            },
            switchEnableStatus(row) {
                let action = row.enable ? 'enable' : 'disable';
                this.$http.post('admin/drive/' + row.id + "/" + action).then(() => {
                    this.$message.success('修改成功');
                })
            },
            switchCacheEnableStatus(row) {
                let action = row.enableCache ? 'enable' : 'disable';
                this.$http.post('admin/cache/' + row.id + "/" + action).then(() => {
                    this.$message.success('修改成功');
                })
            },
            switchAutoRefreshStatus(row) {
                let action = row.autoRefreshCache ? 'start' : 'stop';
                this.$http.post('admin/cache/' + row.id + "/auto-refresh/" + action).then(() => {
                    this.$message.success('修改成功');
                })
            },
            typeFormatter(row, column, val) {
                for (let index in this.supportStrategy) {
                    if (this.supportStrategy[index].key === val) {
                        return this.supportStrategy[index].description;
                    }
                }
            },
            editDrive(row) {
                this.$http.get('admin/drive/' + row.id).then((response) => {
                    let data = response.data.data;
                    data.type = data.type.key;
                    this.driveItem = data;
                    this.driveEditDialogVisible = true;
                });
            },
            deleteDrive(row) {
                this.$confirm('是否确认删除？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    callback: action => {
                        if (action === 'confirm') {
                            this.$http.delete('admin/drive/' + row.id).then((response) => {
                                if (response.data.code === 0) {
                                    this.$message.success('删除成功');
                                    this.init();
                                } else {
                                    this.$message.success('删除失败');
                                }
                            });
                        }
                    }
                });
            },
            closeDriveEdit() {
                this.driveEditDialogVisible = false;
                this.init();
            },
            closeFilterDialog() {
                this.filterDialogVisible = false;
            },
            addDrive() {
                Object.assign(this.driveItem, this.$options.data().driveItem);
                this.driveItem.id = null;
                this.driveEditDialogVisible = true;
                console.log(this.supportStrategy)
            },
            init() {
                this.$http.get('admin/support-strategy').then((response) => {
                    this.supportStrategy = response.data.data;
                });

                this.$http.get('admin/drives').then((response) => {
                    let data = response.data.data;

                    for (let index in data) {
                        data[index].type = data[index].type.key;
                    }

                    this.driveList = response.data.data;
                });
            }
        },
        mounted() {
            this.init();
            this.setSort();
        }
    }
</script>

<style scoped>
    .el-row {
        padding: 20px;
    }

    .el-form-item {
        margin-right: 50px;
    }

    .card-title {
        color: rgba(0,0,0,.45);
        font-size: 14px;
    }

    .card-content {
        color: rgba(0,0,0,.85);
        font-size: 25px;
        line-height: 30px;
    }

    .card-title-button {
        float: right;
        padding: 3px 0;
    }

    .table-search-input {
        width: 300px;
        float: right;
    }

    #filterForm .el-row {
        padding: 0;
    }
</style>
