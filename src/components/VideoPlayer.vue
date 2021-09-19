<template>
    <div id="dplayer"></div>
</template>

<script>

    import flvjs from 'flv.js';
    import Hls from 'hls.js';
    import DPlayer from 'dplayer';

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
	                contextmenu: [
		                {
			                text: '下载',
			                click: (player) => {
				                window.open(player.video.src)
			                },
		                },
		                {
			                text: '使用 PotPlayer 打开',
			                click: (player) => {
				                window.location = 'potplayer://' +player.video.src
			                },
		                },
		                {
			                text: '使用 IINA 打开',
			                click: (player) => {
				                window.location = 'iina://weblink?url=' +player.video.src
			                },
		                },
		                {
			                text: '使用 VLC 打开',
			                click: (player) => {
				                window.location = 'vlc://' +player.video.src
			                },
		                },
		                {
			                text: '使用 nPlayer 打开',
			                click: (player) => {
				                window.location = 'nplayer-' +player.video.src
			                },
		                },
		                {
			                text: '使用 MXPlayer(Free) 打开',
			                click: (player) => {
				                window.location = 'intent:' +player.video.src + '#Intent;package=com.mxtech.videoplayer.ad;S.title=video;end'
			                },
		                },
		                {
			                text: '使用 MXPlayer(Pro) 打开',
			                click: (player) => {
				                window.location = 'intent:' +player.video.src + '#Intent;package=com.mxtech.videoplayer.pro;S.title=video;end'
			                },
		                },
	                ]
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
            });
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

    .dplayer-menu.dplayer-menu-show {
	    width: 180px;
    }
</style>
