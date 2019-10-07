<template>
    <div id="app">
        <Header></Header>
        <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :lg="20">
                <List ref="List"></List>
            </el-col>
            <el-col :xs="0" :lg="4">
                <Info ref="Info"></Info>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import Header from './components/Header.vue'
    import List from './components/List.vue'
    import Info from './components/Info.vue'

    export default {
        name: 'app',
        components: {
            List, Header, Info
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
</style>
