<template>
    <el-row>
        <el-col>
            <el-row :gutter="20">
                <el-col :span="6">
                    <el-card shadow="always">
                        <div slot="header" class="clearfix">
                            <span class="card-title">是否已开启缓存</span>
                        </div>
                        <div class="card-content">
                            <el-switch v-model="enableCache" @change="switchCache"/>
                        </div>
                    </el-card>
                </el-col>

                <el-col :span="6">
                    <el-card shadow="always">
                        <div slot="header" class="clearfix">
                            <span class="card-title">是否已完成缓存</span>
                        </div>
                        <div class="card-content" v-text="cacheFinish ?  'YES' : 'NO'">
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card shadow="always">
                        <div slot="header" class="clearfix">
                            <span class="card-title">已缓存文件夹</span>
                        </div>
                        <div class="card-content" v-text="animatedCacheDirectoryCount">
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card shadow="always">
                        <div slot="header" class="clearfix">
                            <span class="card-title">缓存上次刷新时间</span>
                        </div>
                        <div class="card-content" v-text="lastCacheAutoRefreshDate ? lastCacheAutoRefreshDate : '暂未开始'">
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <el-row>
                <el-table
                        height="70vh"
                        :data="tableData.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"
                        :empty-text="emptyText"
                        style="width: 100%;overflow-y: auto">
                    <el-table-column
                            prop="name"
                            label="缓存 Key (文件夹名称)"
                            width="550">
                    </el-table-column>
                    <el-table-column>
                        <template slot="header" slot-scope="scope">
                            <div class="table-search-input">
                                <el-input
                                        class="table-search-input"
                                        v-model="search"
                                        size="mini"
                                        placeholder="输入关键字搜索"/>
                            </div>
                        </template>
                        <template slot-scope="scope">
                            <el-button
                                    size="mini"
                                    type="primary"
                                    round
                                    @click="refreshCache(scope.$index, scope.row)">刷新缓存</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
        </el-col>
    </el-row>
</template>

<script>
    import qs from 'qs';
    import { TweenLite } from 'gsap/gsap-core'
    export default {
        name: "CacheManager",
        data() {
            return {
                enableCache: true,
                cacheFinish: true,
                refreshSeconds: 0,
                cacheDirectoryCount: 0,
                tweenedCacheDirectoryCount: 0,
                search: '',
                timer: null,
                tableData: [],
                lastCacheAutoRefreshDate: null
            }
        },
        methods: {
            switchCache() {
                if (this.enableCache) {
                    this.openCache();
                } else {
                    this.closeCache();
                }
            },
            openCache() {
                this.$http.post('admin/cache/enable').then((response) => {
                    if (response.data.code === 0) {
                        this.$message({
                            message: '开启成功, 正在缓存所有文件',
                            type: 'success'
                        });
                    }
                })
            },
            closeCache() {
                this.$http.post('admin/cache/disable').then((response) => {
                    if (response.data.code === 0) {
                        this.$message({
                            message: '关闭成功, 已清理所有缓存',
                            type: 'success'
                        });
                    }
                })
            },
            refreshCache(index, row) {
                this.$http.post('admin/cache/refresh', qs.stringify({key: row.name})).then(() => {
                    this.$message({
                        message: '刷新成功',
                        type: 'success'
                    });
                });
            },
            loadConfig() {
                this.$http.get('admin/cache/config').then((response) => {
                    let data = response.data.data;
                    this.enableCache = data.enableCache;
                    this.cacheFinish = data.cacheFinish;
                    this.cacheDirectoryCount = data.cacheDirectoryCount;
                    this.lastCacheAutoRefreshDate = data.lastCacheAutoRefreshDate;

                    let cacheKeys = data.cacheKeys;
                    cacheKeys.sort(function (a, b) {
                        return a.length - b.length;
                    });
                    let tempData = [];
                    for (let i = 0; i < cacheKeys.length; i++) {
                        tempData[i] = {"name": cacheKeys[i]};
                    }
                    this.tableData = tempData;
                })
            }
        },
        mounted() {
            this.loadConfig();
            if (this.timer) {
                clearInterval(this.timer);
            } else {
                this.timer = setInterval(() => {
                    this.loadConfig();
                }, 1000);
            }
        },
        destroyed() {
            clearInterval(this.timer);
        },
        computed: {
            emptyText: function () {
                if (this.enableCache === false) {
                    return "未开启缓存";
                }

                if (this.cacheFinish === false) {
                    return "尚未完成全部缓存";
                }
                return "暂无数据";
            },
            animatedCacheDirectoryCount: function () {
                return this.tweenedCacheDirectoryCount.toFixed(0);
            },
        },
        watch: {
            cacheDirectoryCount: function(newValue) {
                TweenLite.to(this.$data, 0.5, { tweenedCacheDirectoryCount: newValue });
            }
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
</style>