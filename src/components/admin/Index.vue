<template>
    <div class="zfile-admin-index">
        <div class="zfile-admin-top">
            <div class="zfile-admin-top-content">
                <div class="zfile-admin-top-logo box animate__animated animate__fadeInLeft">
                    <el-popover
                        placement="top-start"
                        width="200"
                        trigger="hover">
                        <div v-if="latestInfo" class="zfile-admin-index-version-info">
                            <div v-html="`最新版：v${latestInfo.tag_name}`"></div>
                            <div v-html="`发布时间: ${common.dateFormat(latestInfo.published_at)}`"></div>
                            <br>

                            文档地址：<el-link href="http://docs.zhaojun.im/zfile" target="_blank" class="zfile-word-aux zfile-margin-left-unset">点击进入</el-link>
                            <br>
                            后端源码地址：<el-link href="https://github.com/zhaojun1998/zfile" target="_blank" class="zfile-word-aux zfile-margin-left-unset">点击进入</el-link>
                            <br>
                            前端源码地址：<el-link href="https://github.com/zhaojun1998/zfile-vue" target="_blank" class="zfile-word-aux zfile-margin-left-unset">点击进入</el-link>
                        </div>

                        <div slot="reference" @click="openZFileAdmin" v-html="`ZFile Admin v${common.version}`"></div>
                    </el-popover>
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
                    <el-menu-item index="/admin/short-link">
                        <i class="el-icon-link"/>
                        <span slot="title" id="/admin/short-link">短链管理</span>
                    </el-menu-item>
                    <el-menu-item @click="logDownload">
                        <i class="el-icon-download"/>
                        <span slot="title">日志下载</span>
                    </el-menu-item>
                    <el-menu-item @click="click">
                        <i class="el-icon-s-home"/>
                        <span slot="title">前往首页</span>
                    </el-menu-item>
                    <el-menu-item @click="logout">
                        <i class="el-icon-switch-button"/>
                        <span slot="title">注销</span>
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
                latestInfo: {},
                active: '/admin/site'
            }
        },
        methods: {
            logout() {
                this.$http.get('/logout').then(() => {
                    this.$router.push('/login');
                })
            },
            rebuildTitle(index) {
                // 根据指定的导航 Index, 获取标题
                document.title = document.getElementById(index).innerText + ' | 后台管理';
            },
            logDownload() {
                window.open(this.$http.defaults.baseURL + '/admin/log', '_blank');
            },
            click() {
                window.open('/', '_blank');
            },
            openZFileAdmin() {
                window.open('https://github.com/zhaojun1998/zfile');
            }
        },
        mounted: function() {
            // 获取当前选中的左侧导航的文字, 作为标题
            let currentIndex = document.getElementsByClassName('is-active')[0].getElementsByTagName('span')[0].id;
            this.rebuildTitle(currentIndex);
            this.$http.get('https://api.github.com/repos/zhaojun1998/zfile/releases/latest', {withCredentials: false, showMessage: false}).then((response) => {
                this.latestInfo = response.data;
            })
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
        cursor: pointer;
        height: 100%;
        line-height: 61px;
        color: #ffffff;
        padding-right: 20px;
    }

    .zfile-admin-top-logo:hover {
        color: #1890ff;
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

    .zfile-admin-index-version-info {
        font-size: 13px;
    }

    .zfile-admin-index-version-info >>> .el-link--inner{
        font-size: 13px;
    }
</style>
