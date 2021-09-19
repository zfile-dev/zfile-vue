<template>
    <div>
        <el-row :gutter="20" class="zfile-cache-statistics">
            <el-col :span="8">
                <el-card shadow="always">
                    <div slot="header" class="clearfix">
                        <span class="card-title">缓存数</span>
                        <el-button size="mini" icon="el-icon-delete" class="zfile-float-right" round type="danger" @click="clearCache">清理缓存</el-button>
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
                <el-button size="small" type="primary" icon="el-icon-refresh" class="zfile-float-right" @click="refreshCacheManageData">刷新统计信息</el-button>
            </el-col>
        </el-row>

        <el-table
            height="50vh"
            :data="driveCacheInfo.cacheKeys.filter(data => !cacheSearch || data.name.toLowerCase().includes(cacheSearch.toLowerCase()))"
            class="zfile-cache-table">
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
    </div>
</template>

<script>
    import qs from 'qs';
    export default {
        name: "CacheManager",
        props: {
            currentCacheManageId: null,
        },
        data() {
            return {
                cacheSearch: '',
                driveCacheInfo: {
                    cacheCount: 0,
                    hitCount: 0,
                    missCount: 0,
                    cacheKeys: []
                },
            }
        },
        methods: {
            refreshCache(row) {
                this.$http.post(`/admin/cache/${this.currentCacheManageId}/refresh`, qs.stringify({key: row.name})).then(() => {
                    this.$message({
                        message: '刷新成功',
                        type: 'success'
                    });
                });
            },
            refreshCacheManageData() {
                this.loadCacheManageData();
                this.$message({
                    message: '刷新成功',
                    type: 'success'
                });
            },
            loadCacheManageData() {
                this.$http.get(`/admin/cache/${this.currentCacheManageId}/info`).then((response) => {
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

                });
            },
            clearCache() {
                this.$http.post(`/admin/cache/${this.currentCacheManageId}/clear`).then(() => {
                    this.loadCacheManageData();
                    this.$message({
                        message: '清理成功',
                        type: 'success'
                    });
                });
            },
        },
        beforeMount() {
            this.loadCacheManageData();
        }
    }
</script>

<style scoped>
    .zfile-cache-statistics {
        margin-bottom: 20px;
    }

    .zfile-cache-table {
        width: 100%;
        overflow-y: auto;
    }
</style>
