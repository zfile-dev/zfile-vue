<template>
    <el-form :inline="true" class="demo-form-inline zfile-header" size="mini">
        <el-form-item v-if="$store.getters.searchEnable">
            <el-input v-model="search" placeholder="搜索"/>
        </el-form-item>
        <el-form-item>
            <el-breadcrumb separator="/" separator-class="el-icon-arrow-right">
                <el-breadcrumb-item :to="{path: '/main'}">首页</el-breadcrumb-item>
                <el-breadcrumb-item v-for="item in breadcrumbData"
                                    :to="{path: '/main' + item.fullPath}"
                                    :key="item.path">{{item.name}}</el-breadcrumb-item>
            </el-breadcrumb>
        </el-form-item>
    </el-form>
</template>

<script>
    import path from 'path'
    import store from "@/store";

    export default {
        name: "Header",
        data() {
            return {
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
            },
            '$store.state.currentDirectory': function (val) {
                let config = this.$store.state.config;
                let siteName = '';
                if (config.viewConfig) {
                     siteName = ' | ' + this.$store.state.config.viewConfig.siteName;
                }

                if (val.name === '/' || val.name === '') {
                    document.title = "首页" + siteName;
                } else {
                    document.title = val.name + siteName;
                }
            }
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
</style>