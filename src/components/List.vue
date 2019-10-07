<template>
    <div id="List">
        <markdown-render :text="this.config.header" />
        <el-table ref="fileTable" id="ListTable"
                  v-infinite-scroll="infiniteHandler"
                  infinite-scroll-immediate="false"
                  class="transition-box"
                  :data="tableData"
                  @sort-change="sortList"
                  @cell-mouse-enter="updateInfoHover"
                  @cell-mouse-leave="updateInfoLeave"
                  @row-click="openFolder"
                  size="small"
                  cell-class-name="table-cursor"
                  @row-contextmenu="showMenu">
            <el-table-column
                    prop="name"
                    label="文件名"
                    sortable="true"
                    label-class-name="table-header-left"
                    min-width="100%">
                <template slot-scope="scope">
                    <svg class="icon" aria-hidden="true"><use :xlink:href="'#' + fileIconName(scope.row)"></use></svg>
                    {{scope.row.name}}
                </template>
            </el-table-column>
            <el-table-column
                    prop="time"
                    label="修改时间"
                    sortable="true"
                    class-name="hidden-xs-only"
                    min-width="15%">
            </el-table-column>
            <el-table-column
                    prop="size"
                    label="大小"
                    sortable="true"
                    class-name="hidden-xs-only"
                    :formatter="fileSizeFilter"
                    min-width="15%">
            </el-table-column>
        </el-table>

        <el-dialog id="textDialog" :destroy-on-close="true"
                   :title="currentClickRow.name"
                   :visible.sync="dialogTextVisible"
                   :top="'5vh'"
                   :width="'90%'"
                   @opened="initTextDialog">
            <TextPlayer :file="currentClickRow" ref="textDialog"></TextPlayer>
        </el-dialog>

        <el-dialog id="videoDialog" :destroy-on-close="true"
                   :visible.sync="dialogVideoVisible"
                   :top="'5vh'"
                   :width="'70%'">
            <video-player :url="currentClickRow.url"></video-player>
        </el-dialog>

        <audio-player :file-list="filterFile('audio')" :audio-index="currentClickTypeIndex('audio')"></audio-player>

        <vue-context-menu id="contentMenu" :contextMenuData="contextMenuData"
                          @preview="preview"
                          @download="download"></vue-context-menu>
    </div>
</template>

<script>
    import eventBus from '@/assets/eventBus'
    import "@/assets/table-animation.less"
    import path from 'path'
    import 'element-ui/lib/theme-chalk/display.css';
    import VideoPlayer from "@/components/VideoPlayer";
    import TextPlayer from "@/components/TextPreview";
    import AudioPlayer from "@/components/AudioPlayer";
    import MarkdownRender from "@/components/MarkdownRender";

    const fileTypeMap = {
        image: ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp'],
        video: ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv'],
        audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac', 'm4a'],
        text: ['css', 'js', 'md', 'xml', 'txt', 'py', 'go', 'html', 'less', 'php', 'rb', 'rust', 'script', 'java'],
        executable: ['exe', 'dll', 'com', 'vbs'],
        archive: ['7z', 'zip', 'rar', 'tar', 'gz'],
        document: ['doc', 'txt', 'docx', 'pages', 'epub', 'pdf', 'numbers', 'csv', 'xls', 'xlsx', 'keynote', 'ppt', 'pptx']
    };

    let iconFileType = ['css', 'go', 'html', 'js', 'less', 'php', 'py', 'rb', 'rust', 'script', 'md', 'apk', 'deb', 'rpm', 'java'];

    export default {
        components: {
            VideoPlayer, TextPlayer, AudioPlayer, MarkdownRender
        },
        created() {
            this.searchData.path = this.$route.fullPath;
        },
        data() {
            return {
                // 是否初始化加载完成
                loading: false,
                // 当前鼠标悬浮的行
                hoverRow: null,
                // 是否打开文本浏览器弹出
                dialogTextVisible: false,
                // 是否打开视频播放器弹出
                dialogVideoVisible: false,
                // 查询条件
                searchData: {
                    sortBy: 'name',
                    order: 'asc',
                    path: '',
                    password: '',
                    page: 1
                },
                config: {},
                // 表格 data
                tableData: [],
                // 当前点击文件
                currentClickRow: {},
                contextMenuData: {
                    // the contextmenu name(@1.4.1 updated)
                    menuName: 'file',
                    // The coordinates of the display(菜单显示的位置)
                    axis: {
                        x: null,
                        y: null
                    },
                    // Menu options (菜单选项)
                    menulists: [{
                        fnHandler: 'preview', // Binding events(绑定事件)
                        icoName: 'el-icon-view', // icon (icon 图标 )
                        btnName: '预览' // The name of the menu option (菜单名称)
                    }, {
                        fnHandler: 'download',
                        icoName: 'el-icon-download',
                        btnName: '下载'
                    }]
                }
            }
        },
        watch: {
            'searchData.path': {
                deep: true,
                handler() {
                    this.searchData.page = 1;
                    this.getList();
                    this.loadingConfig();
                }
            },
            '$route.fullPath': function (newVal) {
                this.searchData.path = newVal;
            }
        },
        methods: {
            showMenu() {
                event.preventDefault();
                let x = event.clientX;
                let y = event.clientY;
                this.contextMenuData.axis = {
                    x, y
                }
            },
            getList: function () {
                let that = this;
                this.$http.get('api/list', {params: this.searchData}).then((response) => {
                    if (response.data.data) {
                        if (that.searchData.path !== '' && that.searchData.path !== '/') {
                            let fullPath = this.$route.fullPath;
                            let parentPathName = path.basename(path.resolve(fullPath, "../"));
                            response.data.data.unshift({
                                name: parentPathName ? parentPathName : '/',
                                order: '',
                                path: path.resolve(that.searchData.path, '../'),
                                type: 'BACK'
                            });
                        }
                        that.searchData.page++;
                        that.loading = true;
                        that.tableData = response.data.data;
                    } else {
                        if (this.searchData.password) {
                            this.$message.error('密码错误, 请重新输入!',);
                        }
                        this.popPassword();
                    }
                })
            },
            popPassword() {
                this.$prompt('请输入密码', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputValidator(val) {
                        return !!val
                    },
                    inputErrorMessage: '密码不能为空.'
                }).then(({value}) => {
                    if (value === this.searchData.password) {
                        this.getList();
                    } else {
                        this.searchData.password = value;
                    }
                }).catch(() => {
                    this.$router.push(path.resolve(this.searchData.path, '../'));
                });
            },
            updateInfoHover: function (row) {
                this.hoverRow = row;
                let file = row;
                file['icon'] = this.fileIconName(row);
                eventBus.$emit('updateInfo', file);
            },
            updateInfoLeave: function () {
                let fullPath = this.$route.fullPath;
                this.hoverRow = {
                    icon : "el-icon-my-folder",
                    name : path.basename(fullPath) ? path.basename(fullPath) : window.location.host
                };
                eventBus.$emit('updateInfo', this.hoverRow);
            },
            sortList(sortParam) {
                this.searchData.sortBy = sortParam.prop;
                this.searchData.order = sortParam.order === "descending" ? "desc" : "asc";
            },
            loadingConfig() {
                this.$http.get('api/config', {params: {path: this.searchData.path}}).then((response) => {
                    this.config = response.data.data;
                });
            },
            openFolder(row) {
                this.currentClickRow = row;

                if (row.type === 'FILE') {
                    let fileType = this.getFileType(row.name);

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
                            this.$message({
                                showClose: true,
                                message: '该格式暂不支持在线预览',
                                type: 'error'
                            });
                    }
                } else {
                    let path;
                    if (row.type === 'BACK') {
                        path = row.path;
                    } else {
                        path = this.removeDuplicateSeparator(row.path + '/' + row.name)
                    }
                    this.searchData.path = path;
                    this.$router.push(path);
                }
            },
            removeDuplicateSeparator(path) {
                let result = '';

                if (path.indexOf("http://") === 0) {
                    result = "http://";
                } else if (path.indexOf("https://") === 0) {
                    result = "https://";
                }

                for (let i = result.length; i < path.length - 1; i++) {
                    let current = path.charAt(i);
                    let next = path.charAt(i + 1);
                    if (!(current === '/' && next === '/')) {
                        result += current;
                    }
                }
                result += path.charAt(path.length - 1);
                return result;
            },
            openImage() {
                let imageDate = [];
                for (let image of this.filterFile('image')) {
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
                // this.dialogAudioVisible = true;
            },
            openText() {
                this.dialogTextVisible = true;
            },
            openVideo() {
                this.dialogVideoVisible = true;
            },
            filterFile(type) {
                return this.tableData.filter(function (item) {
                    if (item.type === 'BACK') {
                        return false
                    }
                    let name = item.name;
                    let suffix = name.substr(name.lastIndexOf('.') + 1);
                    return fileTypeMap[type].indexOf(suffix) !== -1;
                });
            },
            getFileSuffix(name) {
                let lastIndex = name.lastIndexOf('.');
                if (lastIndex === -1) {
                    return 'other';
                }
                return name.substr(lastIndex + 1).toLowerCase();
            },
            getFileType(name) {
                let fileType;
                for (let key in fileTypeMap) {
                    let suffix = this.getFileSuffix(name);
                    if (fileTypeMap[key].indexOf(suffix) !== -1) {
                        fileType = key;
                        break;
                    }
                }
                return fileType;
            },
            initTextDialog() {
                this.$refs.textDialog.init();
            },
            preview() {
                this.openFolder(this.hoverRow);
            },
            download() {
                window.open(this.hoverRow.url);
            },
            infiniteHandler() {
                if (!this.loading) {
                    return true;
                }
                let that = this;
                this.$http.get('api/list', {params: this.searchData}).then((response) => {
                    let fileList = response.data.data;
                    if (fileList && fileList.length > 0) {
                        that.searchData.page++;
                        that.tableData = that.tableData.concat(fileList);
                    }
                });
            },
            fileSizeFilter: (row, column, bytes) => {
                if (row.type === "BACK") return '';
                if (row.type === "FOLDER") return '-';
                if (bytes === 0) return '0 B';
                let k = 1024;
                let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
                let i = Math.floor(Math.log(bytes) / Math.log(k));
                return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
            },
            fileIconName(file) {
                let ICON_PREFIX = 'el-icon-my-';
                let iconName;
                if (file.type === 'BACK' || file.type === 'FOLDER') {
                    return ICON_PREFIX + file.type.toLowerCase();
                } else {
                    let fileSuffix = this.getFileSuffix(file.name);
                    let fileType = this.getFileType(file.name);

                    if (iconFileType.indexOf(fileSuffix) !== -1) {
                        iconName = ICON_PREFIX + fileSuffix;
                    } else if (fileType) {
                        iconName = ICON_PREFIX + fileType;
                    } else {
                        iconName = ICON_PREFIX + 'file';
                    }
                }

                return iconName;
            }
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
                        fileType = fileType ? fileType : this.getFileType(currentClickRow.name);
                        return this.filterFile(fileType).findIndex((item) => {
                            return item.name === currentClickRow.name;
                        })
                    }
                }
            }
        }
    }
</script>

<style scoped>
    .el-table {
        margin: 20px;
        padding-right: 30px;
        height: calc(100vh - 80px);
        overflow-y: auto;
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
        padding: unset;
    }

    /*视频弹窗样式 -- 去除标题栏*/
    #videoDialog >>> .el-dialog__header {
        display: none;
    }

    #textDialog >>> .el-dialog {
        margin-bottom: 0;
    }

    #contentMenu {
        padding-left: 0;
    }

    #contentMenu >>> .no-child-btn.btn-wrapper-simple {
        padding-right: 0;
    }

    #contentMenu >>> .nav-icon-fontawe {
        left: unset;
    }

    #contentMenu >>> .context-menu-list:hover {
        background-color: #dddddd;
    }


</style>