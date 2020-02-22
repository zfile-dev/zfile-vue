<template>
    <div class="monitor-body">
        <h1>
            <span>系统监控</span>
            <el-button style="float: right" type="primary" @click="downloadLog" icon="el-icon-download" size="medium">诊断日志下载</el-button>
        </h1>
        <el-table
                :data="tableData">
            <el-table-column
                    prop="key"
                    label="属性"
                    width="300">
            </el-table-column>
            <el-table-column
                    prop="value"
                    label="值">
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    export default {
        name: "Monitor",
        data() {
            return {
                info: {},
                tableData: [],
                timer: null,
            };
        },
        methods: {
            downloadLog() {
                window.location.href = this.common.removeDuplicateSeparator(this.$http.defaults.baseURL + "/admin/log");
            },
            loadData() {
                this.$http.get('admin/monitor').then((response) => {
                    this.info = response.data.data;
                    this.tableData = [];
                    this.tableData.push({key: "操作系统", value: this.info.sys.osName});
                    this.tableData.push({key: "系统版本", value: this.info.sys.osVersion});
                    this.tableData.push({key: "系统架构", value: this.info.sys.osArch});
                    this.tableData.push({key: "程序路径", value: this.info.sys.projectDir});
                    this.tableData.push({key: "系统启动时间", value: this.info.sys.upTime});
                    this.tableData.push({key: "系统总内存", value: this.common.fileSizeFilter('', '', this.info.mem.total)});
                    this.tableData.push({key: "系统已使用内存", value: this.common.fileSizeFilter('', '', this.info.mem.used)});
                    this.tableData.push({key: "系统空闲内存", value: this.common.fileSizeFilter('', '', this.info.mem.free)});
                    this.tableData.push({key: "JVM 可占用内存", value: this.common.fileSizeFilter('', '', this.info.jvm.max)});
                    this.tableData.push({key: "JVM 已占用内存", value: this.common.fileSizeFilter('', '', this.info.jvm.total)});
                    this.tableData.push({key: "JVM 空闲内存", value: this.common.fileSizeFilter('', '', this.info.jvm.free)});
                    this.tableData.push({key: "JVM 版本", value: this.info.jvm.version});
                });
            }
        },
        mounted() {
            this.loadData();
            if (this.timer) {
                clearInterval(this.timer);
            } else {
                this.timer = setInterval(() => {
                    this.loadData();
                }, 1000);
            }
        },
        destroyed() {
            clearInterval(this.timer);
        },
    }
</script>

<style scoped>

    .monitor-body {
        margin: 20px;
    }

</style>