<template>
    <div id="List">
        <markdown-render :text="$store.state.config.header"/>
        <el-table ref="fileTable" id="ListTable"
                  v-infinite-scroll="infiniteHandler"
                  infinite-scroll-immediate="true"
                  class="transition-box"
                  :data="this.$store.getters.tableData"
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
                    min-width="15%">
            </el-table-column>
            <el-table-column
                    prop="size"
                    label="大小"
                    class-name="hidden-xs-only"
                    :formatter="this.common.fileSizeFilter"
                    min-width="15%">
            </el-table-column>
        </el-table>

        <el-dialog id="textDialog" :destroy-on-close="true"
                   :title="currentClickRow.name"
                   :visible.sync="dialogTextVisible"
                   :top="'5vh'"
                   :width="'90%'"
                   @opened="initTextDialog">
            <TextPlayer :file="currentClickRow" ref="textDialog"/>
        </el-dialog>

        <el-dialog id="videoDialog" :destroy-on-close="true"
                   :visible.sync="dialogVideoVisible"
                   :top="'5vh'"
                   :width="'70%'">
            <video-player v-if="dialogVideoVisible" ref="videoPlayer" :url="currentClickRow.url"/>
        </el-dialog>

        <audio-player :file-list="this.$store.getters.filterFileByType('audio')" :audio-index="currentClickTypeIndex('audio')"/>

        <v-contextmenu ref="contextmenu">
            <v-contextmenu-item @click="preview">
                <i class="el-icon-view"/>
                <label v-html="hoverRow.type === 'FILE' ?  '预览' : '打开'"/>
            </v-contextmenu-item>
            <v-contextmenu-item @click="download" v-show="hoverRow.type === 'FILE'">
                <i class="el-icon-download"/>
                <label>下载</label>
            </v-contextmenu-item>
        </v-contextmenu>
    </div>
</template>

<script>
    import path from 'path'
    import 'element-ui/lib/theme-chalk/display.css';
    import VideoPlayer from "@/components/VideoPlayer";
    import TextPlayer from "@/components/TextPreview";
    import AudioPlayer from "@/components/AudioPlayer";
    import MarkdownRender from "@/components/MarkdownRender";
    import store from "@/store";

    let prefixPath = '/main';

    export default {
        components: {
            VideoPlayer, TextPlayer, AudioPlayer, MarkdownRender
        },
        created() {
            let p = this.$route.params.pathMatch;
            this.searchParam.path = p ? p : '/';
        },
        data() {
            return {
                // 是否初始化加载完成
                loading: false,
                // 当前鼠标悬浮的行
                hoverRow: {},
                // 是否打开文本浏览器弹出
                dialogTextVisible: false,
                // 是否打开视频播放器弹出
                dialogVideoVisible: false,
                // 查询条件
                searchParam: {
                    sortBy: 'name',
                    order: 'asc',
                    path: '',
                    password: '',
                    page: 1
                },
                // 当前点击文件
                currentClickRow: {},
                contextMenuDataAxis: {
                    x: null,
                    y: null
                }
            }
        },
        watch: {
            'searchParam.path': {
                deep: true,
                handler() {
                    this.searchParam.page = 1;
                    this.loadingConfig();
                    this.getList();
                }
            },
            '$route.fullPath': function () {
                this.searchParam.path = this.$route.params.pathMatch;
            }
        },
        methods: {
            showMenu() {
                event.preventDefault();
                this.$refs.contextmenu.show({
                    top: event.clientY,
                    left: event.clientX
                });
                this.$refs.contextmenu.$el.hidden = false;
            },
            getList: function () {
                let that = this;
                
                this.$http.get('api/list', {params: this.searchParam}).then((response) => {
                    let data = response.data.data;
                    if (data) {
                        let searchPath = that.searchParam.path;
                        
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
                        that.searchParam.page++;
                        that.loading = true;
                        store.commit('tableData', data);
                        let currentDirectory = {
                            path: searchPath,
                            name: path.basename(searchPath),
                            icon: 'el-icon-my-folder',
                            url: this.common.removeDuplicateSeparator(window.location.host + "/#/main/" + searchPath)
                        };
                        store.commit('currentDirectory', currentDirectory);
                    } else {
                        if (this.searchParam.password) {
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
                    if (value !== this.searchParam.password) {
                        this.searchParam.password = value;
                    }
                    this.getList();
                }).catch(() => {
                    this.$router.push(prefixPath + path.resolve(this.searchParam.path, '../'));
                });
            },
            updateInfoHover: function (row) {
                this.hoverRow = row;
                store.commit('hoverRow', row);
            },
            updateInfoLeave: function () {
                store.commit('hoverRow', null);
            },
            sortList(sortParam) {
                this.searchParam.sortBy = sortParam.prop;
                this.searchParam.order = sortParam.order === "descending" ? "desc" : "asc";
            },
            loadingConfig() {
                this.$http.get('api/config', {params: {path: this.searchParam.path}}).then((response) => {
                    store.commit('updateConfig', response.data.data);
                });
            },
            openFolder(row) {
                this.currentClickRow = row;

                if (row.type === 'FILE') {
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

                    this.$router.push(prefixPath + path);
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
            preview() {
                this.openFolder(this.hoverRow);
            },
            download() {
                window.location.href = this.hoverRow.url;
            },
            infiniteHandler() {
                if (!this.loading) {
                    return true;
                }
                this.$http.get('api/list', {params: this.searchParam}).then((response) => {
                    let data = response.data.data;
                    store.commit('appendTableData', data);
                    this.searchParam.page++;
                });
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
            },
            contextMenuData() {
                let menulists = [];

                if (this.hoverRow === null || this.hoverRow.type === 'FILE') {
                    menulists.push({
                        fnHandler: 'preview', // Binding events(绑定事件)
                        icoName: 'el-icon-view', // icon (icon 图标 )
                        btnName: '预览' // The name of the menu option (菜单名称)
                    }, {
                        fnHandler: 'download',
                        icoName: 'el-icon-download',
                        btnName: '下载'
                    })
                } else {
                    menulists.push({
                        fnHandler: 'preview', // Binding events(绑定事件)
                        icoName: 'el-icon-view', // icon (icon 图标 )
                        btnName: '打开' // The name of the menu option (菜单名称)
                    })
                }

                return {
                    menuName: 'file',
                    axis: this.contextMenuDataAxis,
                    // Menu options (菜单选项)
                    menulists: menulists
                };
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

    .v-contextmenu-item >>> label {
        margin-left: 10px;
    }

</style>