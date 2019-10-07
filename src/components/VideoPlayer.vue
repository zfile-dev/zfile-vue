<template>
    <d-player :options="options" ref="player">
    </d-player>
</template>

<script>
    import Vue from 'vue';
    import VueDPlayer from 'vue-dplayer'
    import 'vue-dplayer/dist/vue-dplayer.css'
    import flvjs from 'flv.js'

    window.flvjs = flvjs;
    Vue.use(VueDPlayer);

    export default {
        name: "VideoPlayer",
        data() {
            return {
                options: {
                    video: {
                        url: ''
                    },
                    autoplay: false
                },
                player: null,
            }
        },
        props: {
            url: String
        },
        mounted() {
            this.player = this.$refs.player.dp;
            this.switchHandle();
        },
        methods: {
            switchHandle(url) {
                this.player.switchVideo({
                    url: url ? url :this.url
                })
            }
        }
    }
</script>

<style>

</style>