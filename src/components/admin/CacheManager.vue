<template>
    <el-row>
        <el-form :inline="true" :model="formData" class="demo-form-inline">
            <el-form-item label="是否已开启缓存">
                <el-switch v-model="formData.enableCache" disabled/>
            </el-form-item>
            <el-form-item label="是否已完成缓存">
                <el-switch v-model="formData.cacheFinish" disabled/>
            </el-form-item>
            <el-form-item label="已缓存条目">
                <span style="font-weight: bold; color: red" v-text="formData.cacheCount"/>
            </el-form-item>
            <el-form-item>
                <el-popover
                        placement="top-start"
                        width="200"
                        trigger="hover"
                        :disabled="formData.enableCache || formData.cacheFinish"
                        content="仅当开启缓存且缓存已完成时, 可以清理缓存">
                    <el-button slot="reference" type="danger" size="small"
                               :disabled="!formData.enableCache || !formData.cacheFinish" @click="clearAllCache" round>清理缓存</el-button>
                </el-popover>

                <el-popover
                        placement="top-start"
                        width="200"
                        trigger="hover"
                        :disabled="formData.cacheFinish"
                        content="仅当开启缓存且缓存已完成时, 可以清理缓存">
                    <el-button slot="reference" type="primary" size="small"
                               :disabled="!formData.cacheFinish" @click="cacheAll" round>缓存所有</el-button>
                </el-popover>
            </el-form-item>
        </el-form>
        <el-table
                :data="tableData.filter(data => !formData.search || data.name.toLowerCase().includes(formData.search.toLowerCase()))"
                style="width: 100%">
            <el-table-column
                    prop="name"
                    label="缓存 Key (文件夹名称)"
                    width="550">
            </el-table-column>
            <el-table-column>
                <template slot="header" slot-scope="scope">
                    <el-input
                            v-model="formData.search"
                            size="mini"
                            placeholder="输入关键字搜索"/>
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
</template>

<script>
    import qs from 'qs';
    export default {
        name: "CacheManager",
        data() {
            return {
                formData: {
                    enableCache: true,
                    cacheFinish: true,
                    cacheCount: 0,
                    search: ''
                },
                tableData: [{
                    name:'xx'
                }]
            }
        },
        methods: {
            cacheAll() {
                this.$http.post('admin/cache/all', qs.stringify(this.form)).then(() => {
                    this.$message({
                        message: '操作成功',
                        type: 'success'
                    });
                });            },
            clearAllCache() {
                this.$http.post('admin/cache/clear', qs.stringify(this.form)).then(() => {
                    this.$message({
                        message: '清理成功',
                        type: 'success'
                    });
                });
            },
            refreshCache(index, row) {
                this.$http.post('admin/cache/refresh', qs.stringify({key: row.name})).then(() => {
                    this.$message({
                        message: '刷新成功',
                        type: 'success'
                    });
                });
            },
        },
        mounted() {
            this.$http.get('admin/cache/config').then((response) => {
                let data = response.data.data;
                this.formData.enableCache = data.enableCache;
                this.formData.cacheFinish = data.cacheFinish;
                this.formData.cacheCount = data.cacheKeys.length;

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
    }
</script>

<style scoped>

    .el-row {
        padding: 20px;
    }

    .el-form-item {
        margin-right: 50px;
    }

    .el-button {
        margin-right: 10px;
    }
</style>