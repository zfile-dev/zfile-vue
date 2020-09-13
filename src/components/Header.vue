<template>
    <el-form :inline="true" class="zfile-header" size="mini">
        <el-form-item>
            <el-breadcrumb separator="/" separator-class="el-icon-arrow-right">
                <el-breadcrumb-item :to="{path: '/' + driveId + '/main'}">{{this.$store.state.common.config.siteName ? this.$store.state.common.config.siteName : '首页'}}</el-breadcrumb-item>
                <el-breadcrumb-item v-for="item in breadcrumbData" class="hidden-xs-only"
                                    :to="{path: '/' + driveId + '/main' + item.fullPath}"
                                    :key="item.path">{{item.name}}</el-breadcrumb-item>
            </el-breadcrumb>
        </el-form-item>
        <div class="zfile-header-drive box animate__animated animate__fadeIn">
            <span class="hidden-xs-only">驱动器</span>
            <el-select v-model="currentDriveId" placeholder="请选择驱动器" @change="changeDrive">
                <el-option v-for="item in driveList"
                           :key="item.id"
                           :label="item.name"
                           :value="item.id">
                </el-option>
            </el-select>
        </div>
    </el-form>
</template>

<script>
    import path from 'path'

    export default {
        name: "Header",
        props: ['driveId'],
        data() {
            return {
                driveList: [],
                currentDriveId: "",
                search: '',
                breadcrumbData: [],
                searching: false
            }
        },
        created() {
            this.buildBreadcrumbData();
        },
        methods: {
            buildBreadcrumbData() {
                this.breadcrumbData = [];
                let fullPath = this.$route.params.pathMatch;
                fullPath = fullPath ? fullPath : '/';

                while (fullPath !== '/') {
                    let name = path.basename(fullPath);
                    this.breadcrumbData.unshift({name, fullPath});
                    fullPath = path.resolve(fullPath, "../");
                }
            },
            changeDrive(driveId) {
                this.$router.push('/' + driveId + '/main');
            }
        },
        watch: {
            '$route.fullPath': function () {
                // 当 URL 变化, 则自动重新 build 面包屑
                this.buildBreadcrumbData();
            },
            'search': function (newVal) {
                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    this.$store.commit('updateSearchParam', newVal);
                }, 150);
            }
        },
        async mounted() {
            await this.$http.get('api/drive/list').then((response) => {
                this.driveList = response.data.data;
                // 如果当前 URL 参数中有驱动器 ID, 则直接用当前的.
                if (this.driveId) {
                    this.currentDriveId = Number(this.driveId);
                } else if (this.driveList.length > 0) {
                    // 否则读取驱动器列表中的第一个, 并跳转到响应的 URL 中.
                    this.currentDriveId = this.driveList[0].id;
                    this.$router.push('/' + this.driveList[0].id + '/main');
                } else if (this.driveList.length === 0) {
                    this.$message.error("无可用驱动器, 请先初始化驱动器.")
                }

                let result = this.driveList.some((item) => {
                    if (item.id === this.currentDriveId) {
                        this.$store.commit('updateCurrentStorageStrategy', item);
                    }
                });
            });
        }
    }
</script>

<style scoped>
    .zfile-header {
        height: 48px;
        line-height: 48px !important;
        background: #fafafa;
        border-bottom: 1px solid rgba(0,0,0,0.05);
        padding-left: 30px;
    }

    .zfile-header .el-breadcrumb {
        line-height: 48px;
    }

    .zfile-header .el-input {
        line-height: 48px;
    }


    @media only screen and (max-width:767px) {
        .zfile-header >>> .el-breadcrumb__separator {
            display: none !important;
        }
    }

    .zfile-header-drive {
        float: right;
        margin-right: 20px;
    }

    .zfile-header-drive span {
        margin-right: 10px;
    }
</style>
