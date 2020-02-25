<template>
    <div id="dplayer"></div>
</template>

<script>

    import 'dplayer/dist/DPlayer.min.css';
    let DPlayer;
    import flvjs from 'flv.js';
    import Hls from 'hls.js';
    require.ensure([], function() { DPlayer = require('dplayer')}, 'dplayer');

    window.flvjs = flvjs;
    window.Hls = Hls;

    export default {
        name: "VideoPlayer",
        data() {
            return {
                options: {
                    container: null,
                    video: {
                        url: ''
                    },
                    subtitle: null,
                    autoplay: false,
                },
                player: null,
            }
        },
        props: {
            data: Object
        },
        async mounted() {
            this.options.container = document.getElementById("dplayer");

            let currData = this.data;

            let tableData = this.$store.getters.tableData;

            let containerVtt = false;

            let vttUrl;

            tableData.find((value) => {
                if (value.name === (currData.name + ".vtt")) {
                    containerVtt = true;
                    vttUrl = value.url;
                    return true;
                }
            });

            if (containerVtt) {
                this.options.subtitle = {
                    url: vttUrl,
                    type: 'webvtt',
                    fontSize: '25px',
                    bottom: '10%',
                    color: '#b7daff',
                };
            }

            this.player = new DPlayer(this.options);
            this.player.switchVideo({
                url: currData.url
            })
        },
        destroyed() {
            this.player.destroy();
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
    @media screen and (min-width: 992px) {
        .dplayer {
            margin: 0 auto;
            height: 80vh;
        }
    }

    @media screen and (max-width: 992px) {
        .dplayer {
            margin: 0 auto;
            height: 35vh;
        }
    }
</style>