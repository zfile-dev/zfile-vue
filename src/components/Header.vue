<template>
    <el-form :inline="true" class="demo-form-inline zfile-header" size="mini">
        <el-form-item>
            <el-breadcrumb separator="/" separator-class="el-icon-arrow-right">
                <el-breadcrumb-item :to="{path: '/' + driveId + '/main'}">首页</el-breadcrumb-item>
                <el-breadcrumb-item v-for="item in breadcrumbData" class="hidden-xs-only"
                                    :to="{path: '/' + driveId + '/main' + item.fullPath}"
                                    :key="item.path">{{item.name}}</el-breadcrumb-item>
            </el-breadcrumb>
        </el-form-item>
        <div style="float: right; margin-right: 20px">
            <span style="margin-right: 10px" class="hidden-xs-only">驱动器</span>
            <el-select v-model="currentDrive" placeholder="请选择驱动器" @change="changeDrive">
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
                currentDrive: "",
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
                if (this.driveId) {
                    this.currentDrive = Number(this.driveId);
                } else if (this.driveList.length > 0) {
                    this.currentDrive = this.driveList[0].id;
                    this.$router.push('/' + this.driveList[0].id + '/main');
                }
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
</style>
