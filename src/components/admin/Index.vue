<template>
    <el-row>
        <el-col :span="3">
            <el-menu
                    :default-active="this.$route.path !== '/admin' ? this.$route.path : '/admin/site'"
                    class="el-menu-vertical-demo"
                    :router="true">
                <el-menu-item index="/admin/site">
                    <i class="el-icon-setting"/>
                    <span slot="title">基本设置</span>
                </el-menu-item>
                <el-menu-item index="/admin/view">
                    <i class="el-icon-view"/>
                    <span slot="title">显示设置</span>
                </el-menu-item>
                <el-menu-item index="/admin/storage">
                    <i class="el-icon-s-operation"/>
                    <span slot="title">存储策略</span>
                </el-menu-item>
                <el-menu-item index="/admin/password">
                    <i class="el-icon-key"/>
                    <span slot="title">修改密码</span>
                </el-menu-item>
                <el-menu-item index="/admin/cache">
                    <i class="el-icon-collection"/>
                    <span slot="title">缓存管理</span>
                </el-menu-item>
                <el-menu-item index="/admin/api">
                    <i class="el-icon-document"/>
                    <span slot="title">API 文档</span>
                </el-menu-item>
                <el-menu-item index="/admin/monitor">
                    <i class="el-icon-monitor"/>
                    <span slot="title">系统监控</span>
                </el-menu-item>
                <el-menu-item @click="click">
                    <i class="el-icon-s-home"/>
                    <span slot="title">前往首页</span>
                </el-menu-item>
            </el-menu>
        </el-col>
        <el-col :span="16">
            <keep-alive exclude="CacheManager,SiteSetting">
                <router-view/>
            </keep-alive>
        </el-col>
    </el-row>
</template>

<script>
    export default {
        name: "Index",
        data() {
            return {
                active: '/admin/storage'
            }
        },
        methods: {
            click() {
                window.open('/', '_blank');
            }
        }
    }
</script>

<style scoped>
    .el-row {
        height: 100vh;
    }
    .el-menu {
        height: 100vh;
    }
</style>