<template>
    <aplayer v-show="fileList.length > 0 && audioIndex !== -1" ref="aplayer" id="aplyer" fixed preload="none"
             :audio="fileList" @listSwitch="updateCover"/>
</template>

<script>
    export default {
        name: "AudioPlayer",
        data() {
            return {
                audioInfo: {}
            }
        },
        props: {
            fileList: Array,
            audioIndex: Number
        },
        methods: {
            updateCover() {
                let currentMusic = this.$refs.aplayer.currentMusic;
                this.$http.get('/common/audio-info', {params: {url: currentMusic.url}}).then((response) => {
                    let data = response.data.data;
                    let el = this.$refs.aplayer.$el;
                    el.getElementsByClassName('aplayer-pic')[0].style.backgroundImage = 'url(' + data.cover + ')';
                    el.getElementsByClassName('aplayer-list-light')[0].getElementsByClassName('aplayer-list-author')[0].innerHTML = data.artist
                })
            }
        },
        watch: {
            audioIndex() {
                if (this.fileList.length > 0 && this.audioIndex !== -1) {
                    this.$refs.aplayer.play();
                    this.$refs.aplayer.switch(this.audioIndex);
                } else {
                    this.$refs.aplayer.pause();
                }
            },
            fileList(data) {
                if (data.length === 0) {
                    this.$refs.aplayer.pause();
                } else {
                    for (let file of this.fileList) {
                        file.artist = '';
                        file.cover = '';
                    }
                }
            }
        },
        mounted() {
            let el = this.$refs.aplayer.$el;
            el.getElementsByClassName("aplayer-miniswitcher")[0].click();
            el.getElementsByClassName('aplayer-icon-order')[0].setAttribute('title', '播放顺序');
            el.getElementsByClassName('aplayer-icon-loop')[0].setAttribute('title', '循环模式');
            el.getElementsByClassName('aplayer-icon-menu')[0].setAttribute('title', '播放列表');
        }
    }
</script>

<style scoped>
    #aplyer >>> .el-icon-close {
        position: absolute;
        right: 0;
        top: 0;
    }
</style>
