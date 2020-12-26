<template>
    <div id="List">
        <el-table ref="fileTable" id="ListTable"
                  :data="this.$store.getters.tableData"
                  @row-click="openFolder"
                  :height="$store.getters.showDocument && $store.state.common.config.readme !== null ? '50vh' : '84vh'"
                  :size="$store.getters.tableSize"
                  @row-contextmenu="showMenu">
            <el-table-column
                    prop="name"
                    label="文件名"
                    label-class-name="table-header-left"
                    min-width="100%">
                <template slot-scope="scope">
                    <svg class="icon" aria-hidden="true"><use :xlink:href="'#' + scope.row.icon"/></svg>
                    {{scope.row.name}}
                </template>
            </el-table-column>
            <el-table-column
                    prop="time"
                    label="修改时间"
                    class-name="hidden-xs-only"
                    min-width="20%">
            </el-table-column>
            <el-table-column
                    prop="size"
                    label="大小"
                    class-name="hidden-xs-only"
                    :formatter="this.common.fileSizeFilter"
                    min-width="15%">
            </el-table-column>

            <el-table-column
                    v-if="$store.getters.showOperator"
                    label="操作"
                    min-width="15%">
                <template slot-scope="scope">
                    <div v-if="scope.row.type === 'FILE'">
                        <i @click.stop="download(scope.row)" class="el-icon-download operator-btn"></i>
                        <i @click.stop="copyDirectLink(scope.row)" class="el-icon-copy-document operator-btn hidden-sm-and-down"></i>
                    </div>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog id="textDialog" :destroy-on-close="true"
                   :title="currentClickRow.name"
                   :visible.sync="dialogTextVisible"
                   :top="'5vh'"
                   :width="'90%'"
                   @opened="initTextDialog">
            <TextPreview :file="currentClickRow" ref="textDialog"/>
        </el-dialog>

        <el-dialog id="videoDialog" :destroy-on-close="true"
                   :title="currentClickRow.name"
                   :visible.sync="dialogVideoVisible">
            <video-player v-if="dialogVideoVisible" ref="videoPlayer" :data="currentClickRow"/>
        </el-dialog>

        <audio-player :file-list="this.$store.getters.filterFileByType('audio')" :audio-index="currentClickTypeIndex('audio')"/>

        <v-contextmenu ref="contextmenu">
            <v-contextmenu-item @click="openFolder(rightClickRow)">
                <i class="el-icon-view"></i>
                <label v-html="rightClickRow.type === 'FILE' ?  '预览' : '打开'"></label>
            </v-contextmenu-item>
            <v-contextmenu-item @click="download" v-show="rightClickRow.type === 'FILE'">
                <i class="el-icon-download"></i>
                <label>下载</label>
            </v-contextmenu-item>
            <v-contextmenu-item @click="copyDirectLink" v-show="rightClickRow.type === 'FILE'">
                <i class="el-icon-copy-document"></i>
                <label>复制直链</label>
            </v-contextmenu-item>
            <v-contextmenu-item @click="copyShortLink" v-show="rightClickRow.type === 'FILE'">
                <i class="el-icon-copy-document"></i>
                <label>复制短链</label>
            </v-contextmenu-item>
        </v-contextmenu>
    </div>
</template>

<script>
    import path from 'path'
    import 'element-ui/lib/theme-chalk/display.css';

    const VideoPlayer = () => import(/* webpackChunkName: "front-video" */'./VideoPlayer');
    const TextPreview = () => import(/* webpackChunkName: "front-text" */'./TextPreview');
    const AudioPlayer = () => import(/* webpackChunkName: "front-audio" */'./AudioPlayer');

    import store from "@/store";

    let prefixPath = '/main';

    export default {
        components: {
            VideoPlayer, TextPreview, AudioPlayer
        },
        props: ['driveId'],
        data() {
            return {
                // 是否初始化加载完成
                loading: false,
                // 当前鼠标悬浮的行
                rightClickRow: {},
                // 是否打开文本浏览器弹出
                dialogTextVisible: false,
                // 是否打开视频播放器弹出
                dialogVideoVisible: false,
                // 查询条件
                searchParam: {
                    path: '',
                    password: ''
                },
                // 当前点击文件
                currentClickRow: {},
                contextMenuDataAxis: {
                    x: null,
                    y: null
                },
                driveList: []
            }
        },
        watch: {
            '$route.fullPath': function () {
                this.loadFile();
            }
        },
        mounted() {
            this.loadFile();
        },
        methods: {
            // 工具方法
            getPwd() {
                let p = this.$route.params.pathMatch;
                this.searchParam.path = p ? p : '/';
                return this.searchParam.path;
            },
            updateTitle() {
                let basePath = path.basename(this.searchParam.path);

                let config = this.$store.state.common.config;
                let siteName = '';
                if (config) {
                    siteName = ' | ' + this.$store.state.common.config.siteName;
                }

                if (basePath === '/' || basePath === '') {
                    document.title = "首页" + siteName;
                } else {
                    document.title = basePath + siteName;
                }
            },
            // 数据加载
            loadFile() {
                // 未指定 driveId 时, 不执行任何操作.
                if (!this.driveId) {
                    return;
                }
                let url = 'api/list/' + this.driveId;
                let param = {
                    path: this.getPwd(),
                    password: this.getPathPwd()
                };

                this.$http.get(url, {params: param}).then((response) => {
                    let data = response.data.data;

                    // 如果需要密码或密码错误进行提示, 并弹出输入密码的框.
                    if (response.data.code === -2 || response.data.code === -3) {
                        if (response.data.code === -3) {
                            this.$message.error('密码错误, 请重新输入!',);
                        }
                        this.popPassword();
                        return;
                    }

                    // 加载系统设置
                    this.loadingConfig();

                    // 如果不是根路径, 则构建 back 上级路径的数据.
                    let searchPath = this.searchParam.path;

                    if (searchPath !== '' && searchPath !== '/') {
                        let fullPath = this.$route.params.pathMatch;
                        fullPath = fullPath ? fullPath : '/';
                        let parentPathName = path.basename(path.resolve(fullPath, "../"));
                        data.unshift({
                            name: parentPathName ? parentPathName : '/',
                            path: path.resolve(searchPath, '../'),
                            type: 'BACK'
                        });
                    }

                    store.commit('tableData', data);
                });
            },
            loadingConfig() {
                if (this.driveId) {
                    this.$http.get('api/config/' + this.driveId, {params: {path: this.searchParam.path}}).then((response) => {
                        store.commit('updateConfig', response.data.data);
                        this.updateTitle();
                    });
                }
            },
            // 文件预览
            openFolder(row) {
                this.currentClickRow = row;
                if (row.type === 'FILE') {
                    if (this.$store.getters.currentStorageStrategyType === 'ftp') {
                        this.$message({
                            message: 'FTP 模式, 不支持预览功能, 已自动调用下载',
                            type: 'warning'
                        });
                        this.download();
                        return;
                    }

                    let fileType = this.common.getFileType(row.name);

                    switch (fileType) {
                        case 'video':
                            this.openVideo();
                            break;
                        case 'image':
                            this.openImage();
                            break;
                        case 'text':
                            this.openText();
                            break;
                        case 'audio':
                            this.openAudio();
                            break;
                        default:
                            this.download();
                    }
                } else {
                    let path;
                    if (row.type === 'BACK') {
                        path = row.path;
                    } else {
                        path = this.common.removeDuplicateSeparator(row.path + '/' + row.name)
                    }

                    if (path.indexOf('/') !== 0) {
                        path = '/' + path;
                    }

                    this.$router.push("/" + this.driveId + prefixPath + path);
                }
            },
            openImage() {
                let imageDate = [];
                for (let image of this.$store.getters.filterFileByType('image')) {
                    imageDate.push({
                       alt: image.name,
                       src: image.url
                    });
                }

                this.layer.photos({
                    photos: {
                        "data": imageDate,
                        "start": this.currentClickTypeIndex('image')
                    }
                    , anim: 5
                    , shade: 0.5
                });
            },
            openAudio() {
            },
            openText() {
                this.dialogTextVisible = true;
            },
            openVideo() {
                this.dialogVideoVisible = true;
            },
            initTextDialog() {
                this.$refs.textDialog.init();
            },
            // 右键菜单
            showMenu(row, column, event) {
                this.rightClickRow = row;
                event.preventDefault();
                this.$refs.contextmenu.show({
                    top: event.clientY,
                    left: event.clientX
                });
                this.$refs.contextmenu.$el.hidden = false;
            },
            download(row) {
                window.location.href = row.url;
            },
            copyShortLink() {
                let that = this;
                let directlink = this.common.removeDuplicateSeparator(this.$store.getters.domain + "/directlink/" + this.driveId + "/" + encodeURI(this.rightClickRow.path) + "/" + encodeURI(this.rightClickRow.name));

                alert(1);
                this.$http.get('https://sohu.gg/api?key=ApiKey&url=' + encodeURI(directlink), {withCredentials: false}).then((response) => {
                    console.log(response)
                    // this.$copyText(response.data.data.short_url).then(function () {
                    //     that.$message.success('复制成功');
                    // }, function () {
                    //     that.$message.error('复制失败');
                    // });
                });

                // this.$http.post('http://lf8.info/index.php?m=Index&a=create', {params: {url: directlink}, withCredentials: false}).then((response) => {
                //     console.log(response)
                //     // this.$copyText(response.data.data.short_url).then(function () {
                //     //     that.$message.success('复制成功');
                //     // }, function () {
                //     //     that.$message.error('复制失败');
                //     // });
                // });
            },
            copyDirectLink(row) {
                let that = this;
                let directlink = this.common.removeDuplicateSeparator(this.$store.getters.domain + "/directlink/"
                    + this.driveId + "/" + encodeURI(row.path) + "/" + encodeURI(row.name));
                this.$copyText(directlink).then(function () {
                    that.$message.success('复制成功');
                }, function () {
                    that.$message.error('复制失败');
                });
            },
            // 文件夹密码
            popPassword() {
                // 如果输入了密码, 则写入到 sessionStorage 缓存中, 并重新调用加载文件.
                this.$prompt('请输入密码', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputValidator(val) {
                        return !!val
                    },
                    inputErrorMessage: '密码不能为空.'
                }).then(({value}) => {
                    let cachePassword = this.getPathPwd();
                    if (value !== cachePassword) {
                        this.putPathPwd(value);
                    }
                    this.loadFile();
                }).catch(() => {
                    this.$router.push("/" + this.driveId + prefixPath + path.resolve(this.searchParam.path, '../'));
                });
            },
            getPathPwd() {
                let pwd = sessionStorage.getItem("zfile-pwd-" + this.searchParam.path);
                return pwd === null ? '' : pwd;
            },
            putPathPwd(value) {
                sessionStorage.setItem("zfile-pwd-" + this.searchParam.path, value);
            },
        },
        computed: {
            // 当前点击类型的索引
            currentClickTypeIndex() {
                return (fileType) => {
                    let currentClickRow = this.currentClickRow;
                    if (currentClickRow.type !== 'FILE') {
                        return -1;
                    }

                    if (JSON.stringify(currentClickRow) === '{}') {
                        return 0;
                    } else {
                        fileType = fileType ? fileType : this.common.getFileType(currentClickRow.name);
                        return this.$store.getters.filterFileByType(fileType).findIndex((item) => {
                            return item.name === currentClickRow.name;
                        })
                    }
                }
            }
        }
    }
</script>

<style scoped>
    #List {
        overflow: hidden;
    }

    .el-table {
        margin: 20px 0 0 20px;
        padding-right: 30px;
        overflow-y: hidden;
    }

    .el-table::before {
        height: 0;
    }

    .el-table svg {
        font-size: 18px;
        margin-right: 15px;
    }

    #ListTable >>> .table-header-left {
        margin-left: 38px;
    }

    #ListTable >>> tr {
        cursor: pointer;
    }

    .el-scrollbar >>> .el-scrollbar__wrap {
        overflow-x: hidden !important;
    }

    /*视频弹窗样式 -- 去除内容边框*/
    #videoDialog >>> .el-dialog__body {
        padding: 10px 0 0 0;
    }

    /* 弹窗标题居中, 高度减少 */
    #List >>> .el-dialog__header {
        text-align: center;
        margin-bottom: -10px;
        padding: 5px 0 5px 0;
    }

    #videoDialog >>> .el-dialog__headerbtn {
        top: 10px;
    }

    #textDialog >>> .el-dialog {
        margin-bottom: 0;
    }

    .v-contextmenu-item >>> label {
        margin-left: 10px;
    }

    @media screen and (max-device-width: 1920px) {
        #videoDialog >>> .el-dialog {
            margin-top: 5vh !important;
            width: 70% !important;
        }
    }

    @media screen and (max-device-width: 769px) {
        #videoDialog >>> .el-dialog {
            margin-top: 10vh !important;
            width: 90% !important;
        }
    }

    .operator-btn {
        color: #1E9FFF;
        margin-right: 20px;
        font-size: 16px
    }

</style>
