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
            <drive-edit :drive-item="driveItem" :dialog-visible="driveEditDialogVisible" :support-strategy="supportStrategy"></drive-edit>
        </el-dialog>

        <el-dialog width="40%" title="过滤规则" :visible.sync="filterDialogVisible" top="10vh" :destroy-on-close="true">
                <el-form id="filterForm" ref="filterForm" :model="filterForm" label-width="120px" style="margin-left: 60px">
                    <div v-for="(item, index) in filterForm.filterList" :key="index">
                        <el-row>
                            <el-col :span="20">
                                <el-form-item :prop="'filterList.' + index + '.expression'"
                                              :rules="{required: true, message: '此项不能为空', trigger: 'blur'}"
                                              :label="'表达式 ' + (index + 1)">
                                    <el-input v-model="item.expression"></el-input>
                                </el-form-item>
                            </el-col>

                            <el-col :span="4">
                                <el-button type="danger" size="small"  @click="deleteFilterItem(index)"
                                           icon="el-icon-delete">删除
                                </el-button>
                            </el-col>
                        </el-row>
                    </div>
                    <el-form-item>
                        <el-button type="primary" size="mini"
                                   icon="el-icon-plus" @click="addFilterItem">添加更多
                        </el-button>
                    </el-form-item>
                    <el-form-item>
                        <span class="zfile-word-aux" style="margin-left: 0;">
                            表达式规则:
                            <br>
                            *: 单级路径通配符，如表达式 /*.jpg，可以匹配根路径下所有的 jpg 后缀的文件
                            <br>
                            **: 多级路径通配符，如表达式 **.jpg，可以匹配所有路径下的 jpg 后缀的文件
                            <br>
                            注意：<b>/a.png</b> 表示根路径下的 a.png。 <b>/a/b/c.png</b>，表示 /a/b/ 路径下的 c.png。 <b>a.png</b>，什么都不表示，因为未标注路径。
                        </span>
                    </el-form-item>
                </el-form>


                <div slot="footer" class="dialog-footer" style="text-align: right; margin-top: 15px">
                    <el-button type="primary" size="mini" icon="el-icon-check" @click="saveFilterForm">保存</el-button>
                </div>
            </el-dialog>

        <el-dialog width="70%" title="缓存管理" :visible.sync="cacheManageVisible" top="10vh" :destroy-on-close="true" @close="closeCacheManage">

                <el-row :gutter="20" style="margin-bottom: 20px">
                    <el-col :span="8">
                        <el-card shadow="always">
                            <div slot="header" class="clearfix">
                                <span class="card-title">缓存数</span>
                                <el-button size="mini" round style="float: right" type="danger" @click="clearCache">清理缓存</el-button>
                            </div>
                            <div class="card-content" v-text="driveCacheInfo.cacheCount">
                            </div>
                        </el-card>
                    </el-col>

                    <el-col :span="8">
                        <el-card shadow="always">
                            <div slot="header" class="clearfix">
                                <span class="card-title">命中数</span>
                            </div>
                            <div class="card-content" v-text="driveCacheInfo.hitCount">
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="8">
                        <el-card shadow="always">
                            <div slot="header" class="clearfix">
                                <span class="card-title">未命中数</span>
                            </div>
                            <div class="card-content" v-text="driveCacheInfo.missCount">
                            </div>
                        </el-card>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="20">
                        <el-input placeholder="输入关键字搜索" v-model="cacheSearch"></el-input>
                    </el-col>
                    <el-col :span="4">
                        <el-button size="small" type="primary" style="float: right" @click="refreshCacheManageData">刷新统计信息</el-button>
                    </el-col>
                </el-row>

                <el-table
                        height="50vh"
                        :data="driveCacheInfo.cacheKeys.filter(data => !cacheSearch || data.name.toLowerCase().includes(cacheSearch.toLowerCase()))"
                        style="width: 100%; overflow-y: auto">
                    <el-table-column
                            prop="name"
                            label="缓存 Key (文件夹名称)"
                            min-width="75%">
                    </el-table-column>
                    <el-table-column min-width="25%"
                                     label="操作">
                        <template slot-scope="scope">
                            <el-button
                                    size="mini"
                                    type="primary"
                                    round
                                    @click="refreshCache(scope.row)">刷新缓存</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-dialog>
    </el-card>
</template>

<script>
    import Sortable from "sortablejs";
    import qs from 'qs';
    import DriveEdit from "@/components/admin/DriveEdit";

    export default {
        name: "DriveList",
        components: {DriveEdit},
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
                driveCacheInfo: {
                    cacheCount: 0,
                    hitCount: 0,
                    missCount: 0,
                    cacheKeys: []
                },
                sortable: null,
                filterForm: {
                    filterList: []
                },
                driveEditDialogVisible: false,
                filterDialogVisible: false,
                cacheManageVisible: false,
                currentCacheManageId: null,
                cacheSearch: '',
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
            refreshCache(row) {
                this.$http.post('admin/cache/' + this.currentCacheManageId +'/refresh', qs.stringify({key: row.name})).then(() => {
                    this.$message({
                        message: '刷新成功',
                        type: 'success'
                    });
                });
            },
            saveFilterForm() {
                this.$http.post(`admin/drive/${this.currentCacheManageId}/filters`, this.filterForm.filterList).then(() => {
                    this.$message({
                        message: '保存成功',
                        type: 'success'
                    });
                    this.filterDialogVisible = false;
                });
            },
            showFilterDialog(row) {
                this.currentCacheManageId = row.id;
                this.$http.get(`admin/drive/${this.currentCacheManageId}/filters`).then((response) => {
                    this.filterForm.filterList = response.data.data;
                    this.filterDialogVisible = true;
                });
            },
            addFilterItem() {
                this.filterForm.filterList.push({expression: '', driveId: this.currentCacheManageId});
            },
            deleteFilterItem(index) {
                this.filterForm.filterList.splice(index, 1);
            },
            cacheManage(row) {
                this.currentCacheManageId = row.id;
                this.loadCacheManageData();
            },
            refreshCacheManageData() {
                this.loadCacheManageData();
                this.$message({
                    message: '刷新成功',
                    type: 'success'
                });
            },
            loadCacheManageData() {
                this.$http.get('admin/cache/' + this.currentCacheManageId + '/info').then((response) => {
                    let data = response.data.data;

                    let cacheKeys = data.cacheKeys;
                    cacheKeys.sort(function (a, b) {
                        return a.length - b.length;
                    });
                    let tempData = [];
                    for (let i = 0; i < cacheKeys.length; i++) {
                        tempData[i] = {"name": cacheKeys[i]};
                    }
                    data.cacheKeys = tempData;
                    this.driveCacheInfo = data;

                    this.cacheManageVisible = true;
                });
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
