<template>
    <div id="info" class="">
        <div class="icon">
            <svg class="icon" aria-hidden="true"><use :xlink:href="'#' + infoData.icon"/></svg>
        </div>
        <div class="block">
            <div class="label">{{infoData.name}}</div>
            <div class="time">{{infoData.time}}</div>
        </div>
        <div title="" class="qrcode" ref="qrcode"></div>
    </div>
</template>

<script>

    import QRCode from "qrcodejs2"

    export default {
        name: "Info",
        data: function () {
            return {
                qrcode: null,
                infoData: {}
            }
        },
        mounted() {
            //  生成二维码
            this.qrcode = new QRCode(this.$refs.qrcode, {
                text: window.location.host,
                width: 180,
                height: 180,
                colorDark: '#999999',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            })
        },
        watch: {
            'infoData': function (newVal) {
                this.qrcode.makeCode(newVal.url);
            },
            '$store.state.currentDirectory': function (val) {
                this.infoData = val;
                if (val.name === '/' || val.name === '') {
                    this.infoData.url = window.location.host;
                    this.infoData.name = window.location.host;
                }
            },
            '$store.state.hoverRow': function (val) {
                if (val) {
                    this.infoData = val;
                } else {
                    this.infoData = this.$store.state.currentDirectory;
                }
            }
        }
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