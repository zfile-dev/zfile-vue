<template>
    <div id="info" class="">
        <div class="icon">
            <svg class="icon" aria-hidden="true"><use :xlink:href="'#' + infoData.icon"></use></svg>
        </div>
        <div class="block">
            <div class="label">{{infoData.name}}</div>
            <div class="time">{{infoData.time}}</div>
        </div>
            <div title="" class="qrcode" ref="qrcode"></div>
    </div>
</template>

<script>

    import eventBus from '@/assets/eventBus'
    import QRCode from "qrcodejs2"
    import Aplayer from 'vue-aplayer'
    import path from 'path';

    export default {
        name: "Info",
        data: function () {
            return {
                qrcode: null,
                infoData: {
                    name: path.basename(this.$route.fullPath) ? path.basename(this.$route.fullPath) : window.location.host,
                    time: "",
                    icon: 'el-icon-my-folder'
                }
            }
        },
        methods: {
            removeDuplicateSeparator(path) {
                let result = '';

                if (path.indexOf("http://") === 0) {
                    result = "http://";
                } else if (path.indexOf("https://") === 0) {
                    result = "https://";
                }

                for (let i = result.length; i < path.length - 1; i++) {
                    let current = path.charAt(i);
                    let next = path.charAt(i + 1);
                    if (!(current === '/' && next === '/')) {
                        result += current;
                    }
                }
                result += path.charAt(path.length - 1);
                return result;
            }
        },
        created() {
            eventBus.$on('updateInfo', args => {
                this.infoData = args;
            })
        },
        mounted() {
            // this.infoData.name = window.
            //  生成二维码
            this.qrcode = new QRCode(this.$refs.qrcode, {
                text: window.location.href,
                width: 180,
                height: 180,
                colorDark: '#999999',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            })
        },
        watch: {
            'infoData': function (newVal) {
                let url;

                if (newVal.type === 'FILE') {
                    url = newVal.url;
                } else {

                    let host = window.location.host;
                    if (newVal.path) {
                        url = this.removeDuplicateSeparator(host + "/#/" + newVal.path + '/' + newVal.name)
                    } else {
                        url = this.removeDuplicateSeparator(host + "/#/")
                    }

                }

                this.qrcode.makeCode(url)
            }
        },
        components: {QRCode, Aplayer}
    }
</script>

<style scoped>

    #info {
        overflow: auto;
        -ms-flex: 0 0 auto;
        flex: 0 0 auto;
        -ms-flex-order: 99;
        order: 99;
        padding: 10px 10px 10px 10px;
        white-space: nowrap;
        overflow-x: hidden;
        width: 240px
    }

    #info .icon {
        width: 240px;
        height: 180px
    }

    #info .icon img {
        border-radius: 2px;
        display: block;
        overflow: hidden;
        margin: 0 auto;
        width: 180px;
        height: 180px
    }

    #info .icon .thumb {
        width: 240px
    }

    #info .block {
        border-top: 1px solid rgba(0, 0, 0, 0.05);
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        margin: 24px;
        padding: 24px 0
    }

    #info .name {
        font-size: 16px;
        margin-bottom: 16px
    }

    #info .time, #info .size, #info .content {
        line-height: 20px;
        height: 20px
    }

    #info .qrcode {
        margin: 0 auto;
        width: 200px
    }

    #info .qrcode img {
        display: block
    }
</style>