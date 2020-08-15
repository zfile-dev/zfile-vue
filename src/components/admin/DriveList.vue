<template>
    <el-row>
        <el-col :offset="1"
                element-loading-text="保存并初始化中.">
            <h1>驱动器列表</h1>

            <div style="margin-top: 20px">
                <el-button type="primary" size="mini" @click="addDrive">新增</el-button>
            </div>

            <el-table
                    :data="driveList"
                    ref="driveTable"
                    row-key="id"
                    highlight-current-row
                    style="width: 100%">
                <el-table-column
                        prop="id"
                        width="100"
                        label="驱动器ID">
                </el-table-column>
                <el-table-column
                        prop="name"
                        label="驱动器名称">
                </el-table-column>
                <el-table-column
                        prop="type"
                        :formatter="typeFormatter"
                        width="150"
                        label="所属策略">
                </el-table-column>
                <el-table-column
                        prop="enable"
                        width="150"
                        label="是否启用">
                    <template slot-scope="scope">
                        <el-switch @change="switchEnableStatus(scope.row)" v-model="scope.row.enable"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column
                        prop="enableCache"
                        width="150"
                        label="缓存开启">
                    <template slot-scope="scope">
                        <el-switch @change="switchCacheEnableStatus(scope.row)" v-model="scope.row.enableCache"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column
                        prop="autoRefreshCache"
                        width="150"
                        label="缓存自动刷新">
                    <template slot-scope="scope">
                        <el-switch @change="switchAutoRefreshStatus(scope.row)" v-model="scope.row.autoRefreshCache"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column
                        prop="orderNum"
                        width="100"
                        label="排序字段">
                </el-table-column>
                <el-table-column
                        label="操作"
                        width="400">
                    <template slot-scope="scope">
                        <template>
                            <el-button slot="reference" class="el-icon-edit" size="mini" type="primary" @click="editDrive(scope.row)">编辑</el-button>
                            <el-button slot="reference" :disabled="!scope.row.enableCache" class="el-icon-s-operation" size="mini" type="primary" @click="cacheManage(scope.row)">缓存管理</el-button>
                            <el-button class="el-icon-view" size="mini" type="primary" @click="showFilterDialog(scope.row)">文件过滤</el-button>
                            <el-button @click="deleteDrive(scope.row)" class="el-icon-delete" size="mini" type="danger">删除</el-button>
                        </template>
                    </template>
                </el-table-column>
            </el-table>

            <el-dialog width="80%" title="驱动器设置" :visible.sync="driveEditDialogVisible" top="10vh" :destroy-on-close="true">

                <el-form v-loading="loading"
                         element-loading-text="保存并初始化中."
                         id="siteForm" ref="form" :model="driveItem" :rules="rules" label-width="auto" :status-icon="true">
                    <el-row :gutter="50">
                        <el-col :span="12">
                            <el-form-item label="驱动器名称" prop="name">
                                <el-input v-model="driveItem.name"/>
                            </el-form-item>

                            <el-form-item label="是否启用">
                                <el-switch v-model="driveItem.enable"/>
                                <div class="zfile-word-aux" style="margin-left: 0">
                                    如不启用，则在前台不展示。
                                </div>
                            </el-form-item>

                            <el-form-item label="开启缓存">
                                <el-switch v-model="driveItem.enableCache"/>
                                <div class="zfile-word-aux" style="margin-left: 0">
                                    开启缓存后，N 秒内重复请求相同文件夹，不会重复调用 API。
                                </div>
                                <div class="zfile-word-aux" style="margin-left: 0">
                                    参数 N 在配置文件中设置 {zfile.cache.timeout}，默认为 1800 秒。
                                </div>
                            </el-form-item>

                            <el-form-item label="开启缓存自动刷新">
                                <el-switch v-model="driveItem.autoRefreshCache"/>
                                <div class="zfile-word-aux" style="margin-left: 0">
                                    每隔 N 秒检测到期的缓存, 对于过期缓存尝试调用 API, 重新写入缓存.
                                </div>
                                <div class="zfile-word-aux" style="margin-left: 0">
                                    参数 N 在配置文件中设置 {zfile.cache.auto-refresh-interval}，默认为 5 秒。
                                </div>
                            </el-form-item>

                            <el-form-item label="存储策略" prop="type">
                                <el-select filterable v-model="driveItem.type" placeholder="请选择存储策略">
                                    <el-option :key="item.key"
                                               v-for="(item) in supportStrategy"
                                               :label="item.description"
                                               :value="item.key">
                                    </el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="排序值" prop="name">
                                <el-input-number v-model="driveItem.orderNum" controls-position="right"></el-input-number>
                                <div class="zfile-word-aux" style="margin-left: 0">
                                    排序值越小，越靠前。
                                </div>
                            </el-form-item>
                        </el-col>

                        <el-col :span="12">
                            <el-form-item
                                    v-for="(item) in storageStrategyForm"
                                    :label="item.title"
                                    :key="item.title"
                                    :prop="'storageStrategyConfig.' + item.key">

                                <el-select v-model="driveItem.storageStrategyConfig.endPoint"
                                           v-if="item.key === 'endPoint' && region.hasOwnProperty(driveItem.type)">
                                    <el-option v-for="endPoint in region[driveItem.type]" :label="endPoint.name" :value="endPoint.val" :key="endPoint.name"/>
                                </el-select>

                                <div v-else-if="item.key === 'pathStyle'">
                                    <el-select v-model="driveItem.storageStrategyConfig.pathStyle" style="width: 50%">
                                        <el-option label="bucket-virtual-hosting" value="bucket-virtual-hosting"></el-option>
                                        <el-option label="path-style" value="path-style"></el-option>
                                    </el-select>
                                    <el-link class="zfile-word-aux" target="_blank" icon="el-icon-document"
                                             href="https://docs.aws.amazon.com/zh_cn/AmazonS3/latest/dev/VirtualHosting.html#path-style-access">查看 S3 API 说明文档</el-link>
                                </div>

                                <div v-else-if="item.key === 'isPrivate'">
                                    <el-switch v-model="driveItem.storageStrategyConfig.isPrivate" />
                                    <span class="zfile-word-aux">私有空间会生成带签名的下载链接</span>
                                </div>

                                <el-input placeholder="" @input="change($event)" v-else v-model="driveItem.storageStrategyConfig[item.key]"/>

                                <div v-if="item.key === 'basePath'">
                                    <span class="zfile-word-aux" style="margin-left: 0">基路径表示从哪个路径开始文件, 不填写表示从根开始</span>
                                </div>

                                <div v-if="item.key === 'filePath'">
                                    <span class="zfile-word-aux" style="margin-left: 0">Linux 或对象存储等需以 / 开头</span>
                                    <br>
                                    <span class="zfile-word-aux" style="margin-left: 0">Windows 支持 C:/ 类的盘符开头</span>
                                    <br>
                                    <span class="zfile-word-aux" style="margin-left: 0">结尾不需要加 /</span>
                                </div>

                                <div v-if="item.key === 'domain' && driveItem.type === 'ftp'">
                                    <span class="zfile-word-aux" style="margin-left: 0">此域名表示 http 访问域名，如有端口，也需要写明。</span>
                                </div>
                            </el-form-item>

                            <el-form-item v-if="driveItem.type === 'onedrive'">
                                <el-link target="_blank" icon="el-icon-edit"
                                         href="https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=09939809-c617-43c8-a220-a93c1513c5d4&response_type=code&redirect_uri=https://zfile.jun6.net/onedrive/callback&scope=offline_access%20User.Read%20Files.ReadWrite.All">前往获取授权</el-link>
                            </el-form-item>

                            <el-form-item v-if="driveItem.type === 'onedrive-china'">
                                <el-link target="_blank" icon="el-icon-edit"
                                         href="https://login.chinacloudapi.cn/common/oauth2/v2.0/authorize?client_id=4a72d927-1907-488d-9eb2-1b465c53c1c5&response_type=code&redirect_uri=https://zfile.jun6.net/onedrive/china-callback&scope=offline_access%20User.Read%20Files.ReadWrite.All">前往获取授权</el-link>
                            </el-form-item>

                            <el-form-item v-if="driveItem.type === 'ftp'">
                                <span class="zfile-word-aux" style="margin: unset">注意: FTP 协议，如果不填写加速域名 (HTTP 下载地址)，则会使用 FTP 协议进行下载</span>
                                <br>
                                <span class="zfile-word-aux" style="margin: unset">FTP 协议会在 URL 中暴露用户名密码，如：<b>ftp://用户名:密码@IP:端口/文件路径/文件名</b></span>
                                <br>
                                <span class="zfile-word-aux" style="margin: unset">如为 FTP 提供了加速域名 (HTTP 下载地址)，则会使用 HTTP 协议，如：<b>http(s)://加速域名/文件路径/文件名</b></span>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <div slot="footer" class="dialog-footer" style="text-align: center">
                    <el-button type="primary" :disabled="loading" @click="submitForm('form')">保 存</el-button>
                    <el-button @click="driveEditDialogVisible = false">取 消</el-button>
                </div>
            </el-dialog>


            <el-dialog width="40%" title="过滤规则" :visible.sync="filterDialogVisible" top="10vh" :destroy-on-close="true">
                <el-form id="filterForm" ref="filterForm" :model="filterForm" label-width="120px" style="margin-left: 60px">
                    <div v-for="(item, index) in filterForm.filterList" :key="index">
                        <el-row>
                            <el-col :span="20">
                                <el-form-item :prop="'filterList.' + index + '.expression'"
                                              :rules="{required: true, message: '此项不能为空', trigger: 'blur'}"
                                              :label="'表达式 ' + (index + 1)">
                                    <el-input v-model="item.expression"></el-input>
                                </el-form-item>
                            </el-col>

                            <el-col :span="4">
                                <el-button type="danger" size="small"  @click="deleteFilterItem(index)"
                                           icon="el-icon-delete">删除
                                </el-button>
                            </el-col>
                        </el-row>
                    </div>
                    <el-form-item>
                        <el-button type="primary" size="mini"
                                   icon="el-icon-plus" @click="addFilterItem">添加更多
                        </el-button>
                    </el-form-item>
                    <el-form-item>
                        <span class="zfile-word-aux" style="margin-left: 0;">
                            表达式规则:
                            <br>
                            *: 单级路径通配符，如表达式 /*.jpg，可以匹配根路径下所有的 jpg 后缀的文件
                            <br>
                            **: 多级路径通配符，如表达式 **.jpg，可以匹配所有路径下的 jpg 后缀的文件
                            <br>
                            注意：<b>/a.png</b> 表示根路径下的 a.png。 <b>/a/b/c.png</b>，表示 /a/b/ 路径下的 c.png。 <b>a.png</b>，什么都不表示，因为未标注路径。
                        </span>
                    </el-form-item>
                </el-form>


                <div slot="footer" class="dialog-footer" style="text-align: right; margin-top: 15px">
                    <el-button type="primary" size="mini" icon="el-icon-check" @click="saveFilterForm">保存</el-button>
                </div>
            </el-dialog>

            <el-dialog width="70%" title="缓存管理" :visible.sync="cacheManageVisible" top="10vh" :destroy-on-close="true" @close="closeCacheManage">

                <el-row :gutter="20" style="margin-bottom: 20px">
                    <el-col :span="8">
                        <el-card shadow="always">
                            <div slot="header" class="clearfix">
                                <span class="card-title">缓存数</span>
                                <el-button size="mini" round style="float: right" type="danger" @click="clearCache">清理缓存</el-button>
                            </div>
                            <div class="card-content" v-text="driveCacheInfo.cacheCount">
                            </div>
                        </el-card>
                    </el-col>

                    <el-col :span="8">
                        <el-card shadow="always">
                            <div slot="header" class="clearfix">
                                <span class="card-title">命中数</span>
                            </div>
                            <div class="card-content" v-text="driveCacheInfo.hitCount">
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="8">
                        <el-card shadow="always">
                            <div slot="header" class="clearfix">
                                <span class="card-title">未命中数</span>
                            </div>
                            <div class="card-content" v-text="driveCacheInfo.missCount">
                            </div>
                        </el-card>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="20">
                        <el-input placeholder="输入关键字搜索" v-model="cacheSearch"></el-input>
                    </el-col>
                    <el-col :span="4">
                        <el-button size="small" type="primary" style="float: right" @click="refreshCacheManageData">刷新统计信息</el-button>
                    </el-col>
                </el-row>

                <el-table
                        height="50vh"
                        :data="driveCacheInfo.cacheKeys.filter(data => !cacheSearch || data.name.toLowerCase().includes(cacheSearch.toLowerCase()))"
                        style="width: 100%; overflow-y: auto">
                    <el-table-column
                            prop="name"
                            label="缓存 Key (文件夹名称)"
                            min-width="75%">
                    </el-table-column>
                    <el-table-column min-width="25%"
                                     label="操作">
                        <template slot-scope="scope">
                            <el-button
                                    size="mini"
                                    type="primary"
                                    round
                                    @click="refreshCache(scope.row)">刷新缓存</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-dialog>
        </el-col>
    </el-row>
</template>

<script>
    import Sortable from "sortablejs";
    import region from "@/region";
    import qs from 'qs';

    export default {
        name: "DriveList",
        data() {
            return {
                loading: false,
                driveList: [],
                supportStrategy: [],
                storageStrategyForm: [],
                region: region,
                driveItem: {
                    orderNum: null,
                    name: '',
                    type: null,
                    searchEnable: false,
                    searchIgnoreCase: false,
                    searchContainEncryptedFile: false,
                    enableCache: false,
                    autoRefreshCache: false,
                    storageStrategyConfig: {
                        endPoint: '',
                        pathStyle: '',
                        isPrivate: false,
                        accessKey: null,
                        secretKey: null,
                        bucketName: null,
                        host: null,
                        port: null,
                        filePath: null,
                        accessToken: null,
                        refreshToken: null,
                        secretId: null,
                        username: null,
                        password: null,
                        basePath: "",
                        domain: ""
                    },
                },
                driveCacheInfo: {
                    cacheCount: 0,
                    hitCount: 0,
                    missCount: 0,
                    cacheKeys: []
                },
                sortable: null,
                filterForm: {
                    filterList: []
                },
                driveEditDialogVisible: false,
                filterDialogVisible: false,
                cacheManageVisible: false,
                currentCacheManageId: null,
                cacheSearch: '',
                rules: {
                    siteName: [
                        {required: true, message: '请输入站点名称', trigger: 'change'},
                    ],
                    username: [
                        {required: true, message: '请输入管理员账号', trigger: 'change'},
                    ],
                    password: [
                        {required: true, message: '请输入管理员密码', trigger: 'change'},
                    ],
                    domain: [
                        {required: true, type: 'url', message: '请输入正确的域名, 需以 http:// 或 https:// 开头', trigger: 'change'},
                    ],
                    type: [
                        {required: true, message: '存储策略不能为空', trigger: 'change'},
                    ],
                    'storageStrategyConfig.domain': [
                        {
                            validator: (rule, value, callback) => {
                                let domainCheck = /(http|https):\/\/([\w.]+\/?)\S*/

                                if ((value === undefined || value === '') && this.driveItem.type === 'ftp') {
                                    callback();
                                    return;
                                }

                                if (value === undefined || value === '') {
                                    callback(new Error('域名不能为空'));
                                    return;
                                }
                                if (!domainCheck.test(value)) {
                                    callback(new Error('请输入正确的域名, 需以 http:// 或 https:// 开头'));
                                } else {
                                    callback();
                                }
                            },
                            type: 'url',
                            trigger: 'change'
                        }
                    ],
                    'storageStrategyConfig.username': [
                        {
                            validator: (rule, value, callback) => {
                                if ((this.driveItem.type === 'upyun' || this.driveItem.type === 'ufile') && (value === undefined || value === '')) {
                                    callback(new Error('操作员名称不能为空'));
                                } else {
                                    callback();
                                }
                            }
                        }
                    ],
                    'storageStrategyConfig.password': [
                        {
                            validator: (rule, value, callback) => {
                                if ((this.driveItem.type === 'upyun' || this.driveItem.type === 'ufile') && (value === undefined || value === '')) {
                                    callback(new Error('操作员密码不能为空'));
                                } else {
                                    callback();
                                }
                            }
                        }
                    ],
                    'storageStrategyConfig.endPoint': [{required: true, message: '区域不能为空'}],
                    'storageStrategyConfig.accessKey': [{required: true, message: 'AccessKey 不能为空'}],
                    'storageStrategyConfig.filePath': [{required: true, message: '文件路径不能为空'}],
                    'storageStrategyConfig.secretKey': [{required: true, message: 'SecretKey 不能为空'}],
                    'storageStrategyConfig.bucketName': [{required: true, message: '此项不能为空'}],
                    'storageStrategyConfig.host': [{required: true, message: "域名或 IP 不能为空"}],
                    'storageStrategyConfig.port': [{required: true, message: "端口不能为空"}],
                    'storageStrategyConfig.accessToken': [{required: true, message: "访问令牌不能为空"}],
                    'storageStrategyConfig.refreshToken': [{required: true, message: "刷新令牌不能为空"}],
                    'storageStrategyConfig.secretId': [{required: true, message: "SecretId 不能为空"}]
                }
            }
        },
        watch: {
            'driveItem.type'(newVal) {
                if (newVal) {
                    this.$http.get('admin/strategy-form', {params: {storageType: newVal}}).then((response) => {
                        this.storageStrategyForm = response.data.data;
                    })
                } else  {
                    this.storageStrategyForm = null;
                }
            }
        },
        methods: {
            setSort() {
                const tbody = document.querySelector('.el-table__body-wrapper tbody')
                Sortable.create(tbody, {
                    onEnd: e => {
                        const currRow = this.driveList.splice(e.oldIndex, 1)[0];
                        this.driveList.splice(e.newIndex, 0, currRow)

                        this.$http.post('admin/drive/drag', this.driveList).then(() => {
                            this.$message({
                                message: '调整排序成功',
                                type: 'success'
                            });
                        });
                    }
                })
            },
            clearCache() {
                this.$http.post(`admin/cache/${this.currentCacheManageId}/clear`).then(() => {
                    this.loadCacheManageData();
                    this.$message({
                        message: '清理成功',
                        type: 'success'
                    });
                });
            },
            closeCacheManage() {
                this.cacheSearch = "";
            },
            refreshCache(row) {
                this.$http.post('admin/cache/' + this.currentCacheManageId +'/refresh', qs.stringify({key: row.name})).then(() => {
                    this.$message({
                        message: '刷新成功',
                        type: 'success'
                    });
                });
            },
            saveFilterForm() {
                this.$http.post(`admin/drive/${this.currentCacheManageId}/filters`, this.filterForm.filterList).then(() => {
                    this.$message({
                        message: '保存成功',
                        type: 'success'
                    });
                    this.filterDialogVisible = false;
                });
            },
            showFilterDialog(row) {
                this.currentCacheManageId = row.id;
                this.$http.get(`admin/drive/${this.currentCacheManageId}/filters`).then((response) => {
                    this.filterForm.filterList = response.data.data;
                    this.filterDialogVisible = true;
                });
            },
            addFilterItem() {
                this.filterForm.filterList.push({expression: '', driveId: this.currentCacheManageId});
            },
            deleteFilterItem(index) {
                this.filterForm.filterList.splice(index, 1);
            },
            cacheManage(row) {
                this.currentCacheManageId = row.id;
                this.loadCacheManageData();
            },
            refreshCacheManageData() {
                this.loadCacheManageData();
                this.$message({
                    message: '刷新成功',
                    type: 'success'
                });
            },
            loadCacheManageData() {
                this.$http.get('admin/cache/' + this.currentCacheManageId + '/info').then((response) => {
                    let data = response.data.data;

                    let cacheKeys = data.cacheKeys;
                    cacheKeys.sort(function (a, b) {
                        return a.length - b.length;
                    });
                    let tempData = [];
                    for (let i = 0; i < cacheKeys.length; i++) {
                        tempData[i] = {"name": cacheKeys[i]};
                    }
                    data.cacheKeys = tempData;
                    this.driveCacheInfo = data;

                    this.cacheManageVisible = true;
                });
            },
            switchEnableStatus(row) {
                let action = row.enable ? 'enable' : 'disable';
                this.$http.post('admin/drive/' + row.id + "/" + action).then(() => {
                    this.$message.success('修改成功');
                })
            },
            switchCacheEnableStatus(row) {
                let action = row.enableCache ? 'enable' : 'disable';
                this.$http.post('admin/cache/' + row.id + "/" + action).then(() => {
                    this.$message.success('修改成功');
                })
            },
            switchAutoRefreshStatus(row) {
                let action = row.autoRefreshCache ? 'start' : 'stop';
                this.$http.post('admin/cache/' + row.id + "/auto-refresh/" + action).then(() => {
                    this.$message.success('修改成功');
                })
            },
            typeFormatter(row, column, val) {
                for (let index in this.supportStrategy) {
                    if (this.supportStrategy[index].key === val) {
                        return this.supportStrategy[index].description;
                    }
                }
            },
            change() {
                this.$forceUpdate();
            },
            editDrive(row) {
                this.$http.get('admin/drive/' + row.id).then((response) => {
                    let data = response.data.data;
                    data.type = data.type.key;
                    this.driveItem = data;
                });
                this.driveEditDialogVisible = true;
            },
            deleteDrive(row) {
                this.$confirm('是否确认删除？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    callback: action => {
                        if (action === 'confirm') {
                            this.$http.delete('admin/drive/' + row.id).then((response) => {
                                if (response.data.code === 0) {
                                    this.$message.success('删除成功');
                                    this.init();
                                } else {
                                    this.$message.success('删除失败');
                                }
                            });
                        }
                    }
                });
            },
            addDrive() {
                Object.assign(this.driveItem, this.$options.data().driveItem);
                this.driveItem.id = null;
                this.driveEditDialogVisible = true;
            },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.loading = true;
                        this.$http.post('admin/drive', this.driveItem).then((response) => {
                            let data =  response.data;
                            this.$message({
                                message: data.msg,
                                type: data.code === 0 ? 'success' : 'error',
                                duration: 1500,
                            });
                            this.driveEditDialogVisible = false;
                            this.init();
                            this.loading = false;
                        }).catch(()=>{
                            this.loading = false;
                        })
                    } else {
                        return false;
                    }
                });
            },
            init() {
                this.$http.get('admin/support-strategy').then((response) => {
                    this.supportStrategy = response.data.data;
                });

                this.$http.get('admin/drives').then((response) => {
                    let data = response.data.data;

                    for (let index in data) {
                        data[index].type = data[index].type.key;
                    }

                    this.driveList = response.data.data;
                });
            }
        },
        mounted() {
            this.init();
            this.setSort();
        }
    }
</script>

<style scoped>
    .zfile-word-aux {
        margin-left: 20px;
        color: #aaaaaa;
    }

    .el-row {
        padding: 20px;
    }

    .el-form-item {
        margin-right: 50px;
    }

    .card-title {
        color: rgba(0,0,0,.45);
        font-size: 14px;
    }

    .card-content {
        color: rgba(0,0,0,.85);
        font-size: 25px;
        line-height: 30px;
    }

    .card-title-button {
        float: right;
        padding: 3px 0;
    }

    .table-search-input {
        width: 300px;
        float: right;
    }

    #filterForm .el-row {
        padding: 0;
    }
</style>
