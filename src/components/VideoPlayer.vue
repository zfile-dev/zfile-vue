<template>
    <div id="dplayer"></div>
</template>

<script>
    import Hls from 'hls.js'
    window.Hls = Hls;

    import 'dplayer/dist/DPlayer.min.css';
    import axios from "axios";

    let DPlayer;
    require.ensure([], function() { DPlayer = require('dplayer')}, 'dplayer');

    export default {
        name: "VideoPlayer",
        data() {
            return {
                options: {
                    container: null,
                    video: {
                        url: ''
                    },
                    subtitle: {
                        url: axios.defaults.baseURL  + '/api/content/origin?url=http://c.jun6.net/testProcess.mp4.vtt',
                        type: 'webvtt',
                        fontSize: '25px',
                        bottom: '10%',
                        color: '#b7daff',
                    },
                    autoplay: false,
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