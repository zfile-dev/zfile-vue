<template>
    <el-form :inline="true" class="demo-form-inline zfile-header" size="mini">
        <el-form-item>
            <el-input v-model="search" placeholder="搜索"></el-input>
        </el-form-item>
        <el-form-item>
            <el-breadcrumb separator="/" separator-class="el-icon-arrow-right">
                <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item v-for="item in breadcrumbData" :to="{ path: item.fullPath }" :key="item.path">{{item.name}}</el-breadcrumb-item>
            </el-breadcrumb>
        </el-form-item>
    </el-form>
</template>

<script>
    import path from 'path'

    export default {
        name: "Header",
        data() {
            return {
                search: '',
                breadcrumbData: []
            }
        },
        created() {
            this.buildData();
        },
        methods: {
            buildData() {
                this.breadcrumbData = [];
                let fullPath = this.$route.fullPath;

                while (fullPath !== '/') {
                    let name = path.basename(fullPath);
                    this.breadcrumbData.unshift({name, fullPath});
                    fullPath = path.resolve(fullPath, "../");
                }
            }
        },
        watch: {
            '$route.fullPath': function () {
                this.buildData();
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