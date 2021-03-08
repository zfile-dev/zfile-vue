<template>
    <div id="List">

        <el-table
                v-loading="loading"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(255,255,255,.5)"
                ref="fileTable"
                id="ListTable"
                @sort-change="sortMethod"
                :data="this.$store.getters.tableData"
                @row-click="openFolder"
                :height="this.$store.getters.showDocument && this.$store.state.common.config.readme !== null ? '50vh' : '84vh'"
                :size="this.$store.getters.tableSize"
                @row-contextmenu="showMenu">
            <el-table-column
                    prop="name"
                    icon="el-icon-notebook-1"
                    sortable="custom"
                    class-name="zfile-table-col-name"
                    label-class-name="table-header-left"
                    min-width="100%">
                <template slot="header" slot-scope="scope">
                    <i class="el-icon-document"></i>
                    <span>文件名</span>
                </template>
                <template slot-scope="scope">
                    <template v-if="$store.getters.imgMode && scope.row.icon === 'el-icon-my-image'">
                        <img class="img-mode-img" :src="scope.row.url"/>
                    </template>
                    <template v-else>
                        <svg class="icon" aria-hidden="true"><use :xlink:href="'#' + scope.row.icon"/></svg>
                        {{scope.row.name}}
                    </template>
                </template>
            </el-table-column>
            <el-table-column
                    prop="time"
                    label="修改时间"
                    sortable="custom"
                    v-if="!$store.getters.imgMode"
                    class-name="zfile-table-col-time hidden-xs-only"
                    min-width="20%">
                <template slot="header" slot-scope="scope">
                    <i class="el-icon-date"></i>
                    <span>修改时间</span>
                </template>
            </el-table-column>
            <el-table-column
                    prop="size"
                    label="大小"
                    class-name="zfile-table-col-size hidden-xs-only"
                    v-if="!$store.getters.imgMode"
                    sortable="custom"
                    :formatter="this.common.fileSizeFilter"
                    min-width="15%">
                <template slot="header" slot-scope="scope">
                    <i class="el-icon-coin"></i>
                    <span>大小</span>
                </template>
            </el-table-column>

            <el-table-column
                    v-if="$store.getters.showOperator && !$store.getters.imgMode"
                    label="操作"
                    class-name="zfile-table-col-operator"
                    min-width="15%">
                <template slot="header" slot-scope="scope">
                    <i class="el-icon-s-operation"></i>
                    <span>操作</span>
                </template>
                <template slot-scope="scope">
                    <div v-if="scope.row.type === 'FILE'">
                        <el-tooltip class="item" effect="dark" content="下载" placement="top">
                            <i @click.stop="download(scope.row)" class="el-icon-download operator-btn"></i>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="生成直链" placement="top">
                            <i @click.stop="copyShortLink(scope.row)" class="el-icon-copy-document operator-btn hidden-sm-and-down"></i>
                        </el-tooltip>
                    </div>
                </template>
            </el-table-column>
        </el-table>


        <el-dialog id="textDialog" :destroy-on-close="true"
                   :title="currentClickRow.name"
                   :visible.sync="dialogTextVisible"
                   v-if="dialogTextVisible"
                   :top="'5vh'"
                   :width="'90%'">
            <TextPreview :file="currentClickRow" ref="textDialog"/>
        </el-dialog>

        <el-dialog id="videoDialog" :destroy-on-close="true"
                   :title="currentClickRow.name"
                   v-if="dialogVideoVisible"
                   :visible.sync="dialogVideoVisible">
            <video-player v-if="dialogVideoVisible" ref="videoPlayer" :data="currentClickRow"/>
        </el-dialog>


        <el-dialog id="copyLinkDialog"
                   title="生成直链结果"
                   :width="this.common.isMobile() ? '95%': '50%'"
                   :visible.sync="dialogCopyLinkVisible"
                   v-if="dialogCopyLinkVisible">
            <el-row v-if="currentCopyLinkRow.row">
                <el-col :span="12" :xs="24" class="zfile-dialog-link-result-qrcode">
                    <el-form>
                        <el-form-item>
                            <img :src="currentCopyLinkRow.img" alt="右键可另存为图片">
                        </el-form-item>
                        <el-form-item class="hidden-sm-and-down">
                            <div class="zfile-word-aux zfile-margin-left-unset">二维码可右键另存为图片</div>
                        </el-form-item>
                        <el-form-item class="hidden-sm-and-up">
                            <div class="zfile-word-aux zfile-margin-left-unset">二维码可长按另存为图片</div>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="12" :xs="24" class="zfile-dialog-link-result-info">
                    <el-form>
                        <el-form-item>
                            <el-input disabled prefix-icon="el-icon-document" v-model="currentCopyLinkRow.row.name"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-input disabled prefix-icon="el-icon-date" v-model="currentCopyLinkRow.row.time"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-input disabled prefix-icon="el-icon-coin" v-bind:value="currentCopyLinkRow.row.size | fileSizeFormat"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-input prefix-icon="el-icon-link" type="small" v-model="currentCopyLinkRow.directlink">
                                <el-tooltip slot="append" class="item" effect="dark" content="复制" placement="bottom">
                                    <el-button @click="copyText(currentCopyLinkRow.directlink)" type="small" icon="el-icon-copy-document"></el-button>
                                </el-tooltip>
                            </el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-input prefix-icon="el-icon-link" type="small" v-model="currentCopyLinkRow.link">
                                <el-tooltip slot="append" class="item" effect="dark" content="复制" placement="bottom">
                                    <el-button @click="copyText(currentCopyLinkRow.link)" type="small" icon="el-icon-copy-document"></el-button>
                                </el-tooltip>
                            </el-input>
                        </el-form-item>
                        <el-form-item>
                            <div class="zfile-word-aux zfile-margin-left-unset">直链域名取决与站点设置中的地址</div>
                            <div class="zfile-word-aux zfile-margin-left-unset">第一个链接为直链(带文件名)，第二个链接为短链接</div>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </el-dialog>


        <audio-player :file-list="this.$store.getters.filterFileByType('audio')" :audio-index="currentClickTypeIndex('audio')"/>

        <v-contextmenu ref="contextmenu">
            <v-contextmenu-item @click="openFolder(rightClickRow)">
                <i class="el-icon-view"></i>
                <label v-html="rightClickRow.type === 'FILE' ?  '预览' : '打开'"></label>
            </v-contextmenu-item>
            <v-contextmenu-item @click="download(rightClickRow)" v-show="rightClickRow.type === 'FILE'">
                <i class="el-icon-download"></i>
                <label>下载</label>
            </v-contextmenu-item>
            <v-contextmenu-item @click="copyShortLink(rightClickRow)" v-show="rightClickRow.type === 'FILE'">
                <i class="el-icon-copy-document"></i>
                <label>生成直链</label>
            </v-contextmenu-item>
        </v-contextmenu>

        <template>
            <el-backtop target=".el-table__body-wrapper" :bottom="80" :right="30">
                <el-tooltip placement="top" content="回到顶部">
                    <transition name="fade">
                        <div class="back-to-ceiling">
                            <svg class="Icon Icon--backToTopArrow" aria-hidden="true">
                                <use xlink:href="#el-icon-my-to-top"></use>
                            </svg>
                        </div>
                    </transition>
                </el-tooltip>
            </el-backtop>
        </template>
    </div>
</template>

<script>
    import path from 'path'
    import 'element-ui/lib/theme-chalk/display.css';

    const VideoPlayer = () => import(/* webpackChunkName: "front-video" */'./VideoPlayer');
    const TextPreview = () => import(/* webpackChunkName: "front-text" */'./TextPreview');
    const AudioPlayer = () => import(/* webpackChunkName: "front-audio" */'./AudioPlayer');

    let prefixPath = '/main';

    const {qrcode, svg2url} = require('pure-svg-code');


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
                // 是否打开生成直链页面
                dialogCopyLinkVisible: false,
                // 查询条件
                searchParam: {
                    path: '',
                    password: '',
                    orderBy: '',
                    orderDirection: ''
                },
                // 当前点击文件
                currentClickRow: {},
                contextMenuDataAxis: {
                    x: null,
                    y: null
                },
                // 驱动器列表
                driveList: [],
                // 当前生成直链的行
                currentCopyLinkRow: {
                    row: null,
                    img: '',
                    link: ''
                },
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
            // 排序按钮
            sortMethod({prop, order}) {
                this.searchParam.orderBy = prop;
                this.searchParam.orderDirection = order === "descending" ? "desc" : "asc";
                this.loadFile();
            },
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
                this.loading = true;

                let url = 'api/list/' + this.driveId;
                let param = {
                    path: this.getPwd(),
                    password: this.getPathPwd(),
                    orderBy: this.searchParam.orderBy,
                    orderDirection: this.searchParam.orderDirection,
                };

                this.$http.get(url, {params: param}).then((response) => {
                    let data = response.data.data;

                    // 如果需要密码或密码错误进行提示, 并弹出输入密码的框.
                    if (response.data.code === this.common.responseCode.INVALID_PASSWORD) {
                        this.$message.error('密码错误，请重新输入！');
                        this.popPassword();
                        return;
                    }
                    if (response.data.code === this.common.responseCode.REQUIRED_PASSWORD) {
                        this.$message.warning('此文件夹需要密码，请输入密码！');
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

                    this.$store.commit('tableData', data);
                    this.loading = false;
                });
            },
            loadingConfig() {
                if (this.driveId) {
                    this.$http.get('api/config/' + this.driveId, {params: {path: this.searchParam.path}}).then((response) => {
                        this.$store.commit('updateConfig', response.data.data);
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
                            message: 'FTP 模式，不支持预览功能，已自动调用下载',
                            type: 'warning'
                        });
                        this.download(row);
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
                            this.download(row);
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
            copyShortLink(row) {
                let directlink = this.common.removeDuplicateSeparator("/" + encodeURI(row.path) + "/" + encodeURI(row.name));

                this.$http.get('api/short-link', {params: {driveId: this.driveId, path: directlink}}).then((response) => {
                    this.currentCopyLinkRow.row = row;
                    this.currentCopyLinkRow.link = response.data.data;
                    let directlink = this.common.removeDuplicateSeparator(this.$store.getters.domain + "/directlink/" + this.driveId + "/" + encodeURI(row.path) + "/" + encodeURI(row.name));
                    this.currentCopyLinkRow.directlink = directlink;
                    const svgString = qrcode(response.data.data);
                    this.currentCopyLinkRow.img = svg2url(svgString);
                    this.dialogCopyLinkVisible = true;
                });
            },
            copyText(text) {
                this.$copyText(text).then(() => {
                    this.$message.success('复制成功');
                }, () => {
                    this.$message.error('复制失败');
                });
            },
            // 文件夹密码
            popPassword() {
                // 如果输入了密码, 则写入到 sessionStorage 缓存中, 并重新调用加载文件.
                this.$prompt('请输入密码', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputType: 'password',
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

    #List >>> .el-table__body-wrapper {
        overflow-x: hidden;
        overflow-y: auto;
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

    .back-to-ceiling {
        right: 50px;
        bottom: 50px;
        width: 40px;
        height: 40px;
        border-radius: 4px;
        line-height: 45px;
        background: #e7eaf1;
        display: inline-block;
        text-align: center;
        cursor: pointer;
    }

    .back-to-ceiling:hover {
        background: #d5dbe7;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity .5s;
    }

    .fade-enter,
    .fade-leave-to {
        opacity: 0
    }

    .back-to-ceiling .Icon {
        fill: #9aaabf;
        background: none;
    }

    .back-to-ceiling .Icon--backToTopArrow {
        height: 16px;
        width: 16px;
    }


    #List >>> .img-mode-img{
        display: block;
        max-width: 100%;
        height: auto;
        margin: 0 auto;
    }

    #List >>> .el-table__header .cell i {
        margin-right: 5px;
    }

    .zfile-dialog-link-result-qrcode {
        text-align: center;
    }

    .zfile-dialog-link-result-info .el-form-item{
        margin-bottom: 10px;
    }

</style>
