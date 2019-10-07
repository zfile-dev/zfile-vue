<template>
    <aplayer v-show="fileList.length > 0 && audioIndex !== -1" ref="aplayer" id="aplyer" fixed :audio="fileList" @listSwitch="updateCover"/>
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
                this.$http.get('api/audioInfo', {params: {url: currentMusic.url}}).then((response) => {
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
        computed: {
            // musicList() {
            //     let musicList = [];
            //     for (let index in this.fileList) {
            //         let music = {
            //             artist: this.audioInfo[index] ? this.audioInfo[index].artist : '未知',
            //             cover: this.audioInfo[index] ? this.audioInfo[index].cover : '未知',
            //             name: this.fileList[index].name,
            //             url: this.fileList[index].url
            //         };
            //         musicList.push(music);
            //     }
            //     return musicList;
            // }
        },
        mounted() {
            let el = this.$refs.aplayer.$el;
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