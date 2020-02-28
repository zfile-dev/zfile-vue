<template>
    <div id="main">
        <Header/>
        <div class="alert" v-html="$store.getters.announcement" v-if="$store.getters.showAnnouncement"></div>

        <el-row :gutter="20">
            <el-col :offset="isFullScreen ? 0 : 3" :xs="24" :sm="24" :lg="isFullScreen ? 24 : 18">
                <List ref="List"/>
            </el-col>
        </el-row>
        <el-card class="box-card" :class="isFullScreen ? '' : 'center-box-card'"
                 v-if="$store.getters.showDocument && $store.state.config.readme !== null">
            <markdown-render :text="$store.state.config.readme"/>
        </el-card>
    </div>
</template>

<script>
    import Header from './Header.vue'
    import List from './List.vue'
    import MarkdownRender from "./MarkdownRender";

    export default {
        name: 'Main',
        components: {
            List, Header, MarkdownRender
        },
        watch: {
            '$store.state.config.viewConfig.customJs': function (newVal) {
                let script = document.createElement('script');
                script.type = 'text/javascript';
                script.text = newVal;
                document.getElementsByTagName('head')[0].appendChild(script)
            },
            '$store.state.config.viewConfig.customCss': function (newVal) {
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
    #app {
        font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
        font-size: 16px;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
        overflow-x: hidden;
    }

    body {
        margin: unset;
        overflow: hidden;
    }

    .icon {
        width: 1em;
        height: 1em;
        vertical-align: -0.15em;
        fill: currentColor;
        overflow: hidden;
    }

    /* ----- 滚动条样式 ----- */

    ::-webkit-scrollbar {width: 6px; height: 8px; background: rgba(144,147,153,.3);}
    ::-webkit-scrollbar-button:vertical{display: none;}
    ::-webkit-scrollbar-track, ::-webkit-scrollbar-corner{background-color: #e2e2e2;}
    ::-webkit-scrollbar-thumb{border-radius: 8px; background-color: #a6a6a6;}
    ::-webkit-scrollbar-thumb:vertical:hover{background-color: #7f7f7f;}
    ::-webkit-scrollbar-thumb:vertical:active{background-color: rgba(0,0,0,.38);}

    /* ----- 滚动条样式 ----- */

    .center-box-card {
        width: 1100px;
        margin: 0 auto;
    }

    .markdown-body {
        height: 300px;
        overflow-y: auto;
        padding: 0 !important;
        min-width: 100% !important;
    }

    .alert {
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
        transition: opacity .2s;
    }
</style>
