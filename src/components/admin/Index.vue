<template>
    <el-row>
        <el-col :span="3">
            <el-menu
                    :default-active="this.$route.path !== '/admin' ? this.$route.path : '/admin/site'"
                    class="el-menu-vertical-demo"
                    @select="rebuildTitle"
                    :router="true">
                <el-menu-item index="/admin/site">
                    <i class="el-icon-setting"/>
                    <span slot="title" id="/admin/site">基本设置</span>
                </el-menu-item>
                <el-menu-item index="/admin/drive-list">
                    <i class="el-icon-folder-opened"/>
                    <span slot="title" id="/admin/drive-list">驱动器列表</span>
                </el-menu-item>
                <el-menu-item index="/admin/view">
                    <i class="el-icon-view"/>
                    <span slot="title" id="/admin/view">显示设置</span>
                </el-menu-item>
                <el-menu-item index="/admin/password">
                    <i class="el-icon-key"/>
                    <span slot="title" id="/admin/password">修改密码</span>
                </el-menu-item>
                <el-menu-item index="/admin/api">
                    <i class="el-icon-document"/>
                    <span slot="title" id="/admin/api">API 文档</span>
                </el-menu-item>
                <el-menu-item index="/admin/monitor">
                    <i class="el-icon-monitor"/>
                    <span slot="title" id="/admin/monitor">系统监控</span>
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
                active: '/admin/site'
            }
        },
        methods: {
            rebuildTitle(index) {
                // 根据指定的导航 Index, 获取标题
                document.title = document.getElementById(index).innerText + ' | 后台管理';
            },
            click() {
                window.open('/', '_blank');
            }
        },
        mounted: function() {
            // 获取当前选中的左侧导航的文字, 作为标题
            let currentIndex = document.getElementsByClassName('is-active')[0].getElementsByTagName('span')[0].id;
            this.rebuildTitle(currentIndex);
        },
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
