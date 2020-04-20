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
                    style="width: 100%">
                <el-table-column
                        type="index"
                        label="序号"
                        width="100">
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
                        prop="enableCache"
                        width="150"
                        label="缓存开启">
                    <template slot-scope="scope">
                        <el-switch @change="switchEnableStatus(scope.row)" v-model="scope.row.enableCache"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column
                        label="操作"
                        width="300">
                    <template slot-scope="scope">
                        <template>
                            <el-button slot="reference" class="el-icon-edit" size="mini" type="primary" @click="editDrive(scope.row)">编辑</el-button>
                            <el-button @click="deleteDrive(scope.row)" class="el-icon-delete" size="mini" type="danger">删除</el-button>
                        </template>
                    </template>
                </el-table-column>
            </el-table>

            <el-dialog width="80%" title="编辑" :visible.sync="driveEditDialogVisible" top="10vh" :destroy-on-close="true">

                <el-form v-loading="loading"
                         element-loading-text="保存并初始化中."
                         id="siteForm" ref="form" :model="driveItem" :rules="rules" label-width="auto" :status-icon="true">
                    <el-row :gutter="50">
                        <el-col :span="12">
                            <el-form-item label="驱动器名称" prop="name">
                                <el-input v-model="driveItem.name"/>
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

                            <el-form-item label="存储策略" prop="type">
                                <el-select filterable v-model="driveItem.type" placeholder="请选择存储策略">
                                    <el-option :key="item.key"
                                               v-for="(item) in supportStrategy"
                                               :label="item.description"
                                               :value="item.key">
                                    </el-option>
                                </el-select>
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

                                <div v-if="item.key === 'domain' && driveItem.type === 'ftp'">
                                    <span class="zfile-word-aux" style="margin-left: 0">此域名表示 http 访问域名</span>
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
                        </el-col>
                    </el-row>
                </el-form>
                <div slot="footer" class="dialog-footer" style="text-align: center">
                    <el-button type="primary" :disabled="loading" @click="submitForm('form')">保存</el-button>
                    <el-button @click="driveEditDialogVisible = false">取 消</el-button>
                </div>
            </el-dialog>

        </el-col>
    </el-row>
</template>

<script>
    import region from "@/region";

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
                        isPrivate: '',
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
                    },
                },
                driveEditDialogVisible: false,
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
                            required: this.type !== 'ftp',
                            type: 'url',
                            message: '请输入正确的域名, 需以 http:// 或 https:// 开头',
                            trigger: 'change'
                        }
                    ],
                    // 'storageStrategyConfig.username': [{required: this.driveItemType == 'upyun', message: '操作员名称不能为空'}],
                    // 'storageStrategyConfig.password': [{required: this.driveItemType == 'upyun', message: '操作员密码不能为空'}],
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
            switchEnableStatus(row) {
                let action = row.enableCache ? 'enable' : 'disable';
                this.$http.post('admin/cache/' + row.id + "/" + action).then(() => {
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
        }
    }
</script>

<style scoped>
    .zfile-word-aux {
        margin-left: 20px;
        color: #aaaaaa;
    }
</style>