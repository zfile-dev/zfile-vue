<template>
    <div>
        <!-- 头部: 搜索栏、面包屑、驱动器设置 -->
        <Header :drive-id="driveId"/>

        <!-- 公告区 -->
        <div class="zfile-header-announcement"
             v-html="$store.getters.announcement"
             v-if="$store.getters.showAnnouncement">
        </div>

        <!--
            文件区
            全屏布局：占用满屏
            居中布局: 占用 75% 屏幕, 并垂直居中, 但当屏幕过小时, 还是会恢复全屏.
         -->
        <el-row>
            <el-col
                :offset="isFullScreen ? 0 : 3"
                :xs="24"
                :sm="24"
                :lg="isFullScreen ? 24 : 18">
                <List :drive-id="driveId" ref="List"/>
            </el-col>
        </el-row>

        <!-- 文档区 -->
        <el-card :class="isFullScreen ? '' : 'zfile-readme-center'"
                 v-if="$store.getters.showDocument && $store.state.common.config.readme !== null">
            <markdown-render :text="$store.state.common.config.readme"/>
        </el-card>
    </div>
</template>

<script>
    import Header from './Header.vue'
    import List from './List.vue'
    import MarkdownRender from "./MarkdownRender";

    export default {
        name: 'Main',
        props: ['driveId'],
        components: {
            List, Header, MarkdownRender
        },
        watch: {
            // 如果有自定义 css, js, 则加载到页面上.
            '$store.state.common.config.customJs': function (newVal) {
                let script = document.createElement('script');
                script.type = 'text/javascript';
                script.text = newVal;
                document.getElementsByTagName('head')[0].appendChild(script)
            },
            '$store.state.common.config.customCss': function (newVal) {
                let style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = newVal;
                document.getElementsByTagName('head')[0].appendChild(style)
            }
        },
        computed: {
            isFullScreen() {
                return this.common.isMobile() || this.$store.getters.layout !== 'center';
            }
        }
    }
</script>

<style>
    body {
        overflow: hidden;
    }

    .zfile-readme-center {
        width: 1100px;
        margin: 0 auto;
    }

    .markdown-body {
        height: 300px;
        overflow-y: auto;
        padding: 0 !important;
        min-width: 100% !important;
    }

    .zfile-header-announcement {
        background-color: #f4f4f5;
        color: #909399;
        font-size: 12px;
        margin: 0 0 0;
        width: 100%;
        padding: 10px 16px;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        border-radius: 4px;
        position: relative;
        overflow: hidden;
        opacity: 1;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-transition: opacity .2s;
        transition: opacity 10s;
    }



    /* ----- icon 图标样式 ----- */
    .icon {
        width: 1em;
        height: 1em;
        vertical-align: -0.15em;
        fill: currentColor;
        overflow: hidden;
    }
    /* ----- icon 图标样式 ----- */


    /* ----- 滚动条样式 ----- */
    ::-webkit-scrollbar {width: 6px; height: 8px; background: rgba(144,147,153,.3);}
    ::-webkit-scrollbar-button:vertical{display: none;}
    ::-webkit-scrollbar-track, ::-webkit-scrollbar-corner{background-color: #e2e2e2;}
    ::-webkit-scrollbar-thumb{border-radius: 8px; background-color: #a6a6a6;}
    ::-webkit-scrollbar-thumb:vertical:hover{background-color: #7f7f7f;}
    ::-webkit-scrollbar-thumb:vertical:active{background-color: rgba(0,0,0,.38);}
    /* ----- 滚动条样式 ----- */

    .el-card__body {
        padding-right: 10px;
    }
</style>
