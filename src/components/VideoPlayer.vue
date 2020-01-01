<template>
    <div id="dplayer"></div>
</template>

<script>
    import flvjs from 'flv.js'
    import 'dplayer/dist/DPlayer.min.css';
    import DPlayer from 'dplayer';
    window.flvjs = flvjs;

    export default {
        name: "VideoPlayer",
        data() {
            return {
                options: {
                    container: null,
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
            this.options.container = document.getElementById("dplayer");
            this.player = new DPlayer(this.options);
            this.player.switchVideo({
                url: this.url
            })
        },
        watch: {
            url(val) {
                this.player.switchVideo({
                    url: val
                })
            }
        }
    }
</script>

<style>
</style>