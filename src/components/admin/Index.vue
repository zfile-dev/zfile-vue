<template>
    <div class="zfile-admin-index">
        <div class="zfile-admin-top">
            <div class="zfile-admin-top-content">
                <div class="zfile-admin-top-logo box animate__animated animate__fadeInLeft">
                    <div>ZFile Admin</div>
                </div>
                <el-menu
                    mode="horizontal"
                    background-color="#001529"
                    text-color="hsla(0,0%,100%,.65)"
                    active-text-color="#fff"
                    :default-active="this.$route.path !== '/admin' ? this.$route.path : '/admin/site'"
                    class="zfile-admin-menu box animate__animated animate__fadeInDown"
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
            </div>
        </div>
        <div class="zfile-admin-content">
            <keep-alive exclude="CacheManager,SiteSetting">
                <router-view class="zfile-admin-content-view box animate__animated animate__fadeIn"/>
            </keep-alive>
        </div>
    </div>
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
    .zfile-admin-index {
        height: 100%;
        overflow-y: hidden;
    }

    .zfile-admin-top {
        background-color: #001529;
    }

    .zfile-admin-top-logo {
        height: 100%;
        line-height: 61px;
        color: #ffffff;
        padding-right: 20px;
    }

    .zfile-admin-top-content {
        display: flex;
        margin: auto;
        max-width: 1200px;
    }

    .zfile-admin-content {
        background-color: #f0f2f5;
        height: 100%;
        overflow-y: auto;
    }

    .zfile-admin-content-view {
        margin: auto;
        max-width: 1200px;
        margin-top: 50px;
        margin-bottom: 100px;
    }

    .zfile-admin-menu {
    }


    .el-menu--horizontal > .el-menu-item.is-active {
        color: #1890ff !important;
    }
    .el-menu.el-menu--horizontal,
    .el-menu--horizontal > .el-menu-item{
        border: none;
    }
</style>
