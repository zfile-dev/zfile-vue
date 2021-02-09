<template>
    <div v-if="supportStrategy">
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
                        <el-tooltip placement="right">
                            <div slot="content">
                                如不启用，则不在首页展示。
                            </div>
                            <i class="el-icon-info zfile-info-tooltip"></i>
                        </el-tooltip>
                    </el-form-item>

                    <el-form-item label="开启缓存">
                        <el-switch v-model="driveItem.enableCache" @change="cacheChange"/>
                        <el-tooltip placement="right">
                            <div slot="content">
                                开启缓存后，N 秒内重复请求相同文件夹，不会重复调用 API。
                                <br>
                                参数 N 在配置文件中设置 {zfile.cache.timeout}，默认为 1800 秒。
                                <br>
                                <br>
                                注意：开启缓存后，可能会导致系统不稳定，如非必要或不了解缓存的，不建议开启此功能。
                            </div>
                            <i class="el-icon-info zfile-info-tooltip"></i>
                        </el-tooltip>
                    </el-form-item>

                    <el-form-item label="开启缓存自动刷新">
                        <el-switch v-model="driveItem.autoRefreshCache"/>
                        <el-tooltip placement="right">
                            <div slot="content">
                                每隔 N 秒检测到期的缓存, 对于过期缓存尝试调用 API, 重新写入缓存.
                                <br>
                                参数 N 在配置文件中设置 {zfile.cache.auto-refresh-interval}，默认为 5 秒。
                                <br>
                                <br>
                                注意：如您的数据，并非
                            </div>
                            <i class="el-icon-info zfile-info-tooltip"></i>
                        </el-tooltip>
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
                        v-if="item.key !== 'siteType'"
                        :prop="'storageStrategyConfig.' + item.key">

                        <el-col class="el-drive-form-col" :span="22">
                            <!-- Endpoint -->
                            <el-select v-if="item.key === 'endPoint' && region.hasOwnProperty(driveItem.type)"
                                       v-model="driveItem.storageStrategyConfig.endPoint">
                                <el-option v-for="endPoint in region[driveItem.type]" :label="endPoint.name" :value="endPoint.val" :key="endPoint.name"/>
                            </el-select>

                            <!-- S3 PathStyle -->
                            <div v-else-if="item.key === 'pathStyle'">
                                <el-select v-model="driveItem.storageStrategyConfig.pathStyle">
                                    <el-option label="bucket-virtual-hosting" value="bucket-virtual-hosting"></el-option>
                                    <el-option label="path-style" value="path-style"></el-option>
                                </el-select>
                                <el-link class="zfile-word-aux" target="_blank" icon="el-icon-document"
                                         href="https://docs.aws.amazon.com/zh_cn/AmazonS3/latest/dev/VirtualHosting.html#path-style-access">查看 S3 API 说明文档</el-link>
                            </div>

                            <!-- 私有空间 -->
                            <div v-else-if="item.key === 'isPrivate'">
                                <el-switch v-model="driveItem.storageStrategyConfig.isPrivate" />
                                <el-tooltip placement="right">
                                    <div slot="content">
                                        私有空间会生成带签名的下载链接
                                    </div>
                                    <i class="el-icon-question zfile-info-tooltip"></i>
                                </el-tooltip>
                            </div>


                            <div v-else-if="item.key === 'siteName' && (driveItem.type === 'sharepoint' || driveItem.type === 'sharepoint-china')">
                                <el-input placeholder="请输入站点名称" v-model="driveItem.storageStrategyConfig.siteName" class="input-with-select">
                                    <el-select style="width: 100px" v-model="driveItem.storageStrategyConfig.siteType" @input="change($event)" slot="prepend">
                                        <el-option label="/sites/" value="/sites/"></el-option>
                                        <el-option label="/teams/" value="/teams/"></el-option>
                                    </el-select>
                                </el-input>
                            </div>

                            <el-input v-else placeholder="" @input="change($event)" v-model="driveItem.storageStrategyConfig[item.key]"/>
                        </el-col>

                        <div v-if="item.key === 'basePath'">
                            <el-tooltip placement="bottom">
                                <div slot="content">
                                    基路径表示从哪个路径开始文件, 不填写表示从根开始
                                </div>
                                <i class="el-icon-question zfile-info-tooltip"></i>
                            </el-tooltip>
                        </div>

                        <div v-if="item.key === 'filePath'">
                            <el-tooltip placement="bottom">
                                <div slot="content">
                                    Linux 或对象存储等需以 / 开头.
                                    <br>
                                    Windows 支持 C:/ 类的盘符开头.
                                    <br>
                                    结尾不需要加 <b>/</b>.
                                </div>
                                <i class="el-icon-question zfile-info-tooltip"></i>
                            </el-tooltip>
                        </div>

                        <div v-if="item.key === 'domain' && driveItem.type === 'ftp'">
                            <el-tooltip placement="bottom">
                                <div slot="content">
                                    此域名表示 http 访问域名，如有端口，也需要写明。
                                </div>
                                <i class="el-icon-question zfile-info-tooltip"></i>
                            </el-tooltip>
                        </div>

                        <div v-if="item.key === 'siteName' && (driveItem.type === 'sharepoint' || driveItem.type === 'sharepoint-china')">
                            <el-tooltip placement="bottom">
                                <div slot="content">
                                    /sites/xxx 或 /teams/xxx ，xxx 为你的站点名称
                                </div>
                                <i class="el-icon-question zfile-info-tooltip"></i>
                            </el-tooltip>
                        </div>

                        <div v-if="item.key === 'siteId' && (driveItem.type === 'sharepoint' || driveItem.type === 'sharepoint-china')">
                            <el-tooltip placement="bottom">
                                <div slot="content">
                                    输入 "访问令牌" 和 "站点名称" 后，可以自动获取 SiteId。
                                    <br>
                                    如无法自动获取，请点击下方的 "前往获取 Site Id"。
                                </div>
                                <i class="el-icon-question zfile-info-tooltip"></i>
                            </el-tooltip>
                        </div>
                    </el-form-item>

                    <el-form-item v-if="driveItem.type === 'onedrive' || driveItem.type === 'sharepoint'">
                        <el-link target="_blank" icon="el-icon-link" :href="$http.defaults.baseURL + '/onedrive/authorize'">前往获取令牌</el-link>
                        <br>
                        <el-link target="_blank" v-show="driveItem.type === 'sharepoint'" icon="el-icon-link" :href="'/#/sharepoint-util'">前往获取 Site Id</el-link>
                    </el-form-item>

                    <el-form-item v-if="driveItem.type === 'onedrive-china' || driveItem.type === 'sharepoint-china'">
                        <el-link target="_blank" icon="el-icon-link" :href="$http.defaults.baseURL + '/onedrive/china-authorize'">前往获取令牌</el-link>
                        <br>
                        <el-link target="_blank" v-show="driveItem.type === 'sharepoint-china'" icon="el-icon-link" :href="'/#/sharepoint-util'">前往获取 Site Id</el-link>
                    </el-form-item>


                    <el-form-item v-if="driveItem.type === 'ftp'">
                        <div class="zfile-word-aux zfile-margin-left-unset">
                            注意: FTP 协议，如果不填写加速域名 (HTTP 下载地址)，则会使用 FTP 协议进行下载
                            <br>
                            FTP 协议会在 URL 中暴露用户名密码，如：<b>ftp://用户名:密码@IP:端口/文件路径/文件名</b>
                            <br>
                            如为 FTP 提供了加速域名 (HTTP 下载地址)，则会使用 HTTP 协议，如：<b>http(s)://加速域名/文件路径/文件名</b>
                        </div>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div slot="footer" class="zfile-text-align-center">
            <el-button type="primary" :disabled="loading" @click="submitForm('form')">保 存</el-button>
            <el-button @click="close">取 消</el-button>
        </div>
    </div>
</template>

<script>
import region from "@/region";

export default {
    name: "DriveEdit",
    props: {
        close: {
            type: Function
        },
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
                domain: "",
                siteType: '/sites/',
                siteId: ""
            },
        },
        supportStrategy: null
    },
    watch: {
        'driveItem.type'(newVal) {
            if (newVal) {
                this.loadStrategyForm(newVal);
            } else {
                this.storageStrategyForm = null;
            }
        },
        'driveItem.storageStrategyConfig.siteName'() {
            if (!!this.driveItem.storageStrategyConfig.siteName && !!this.driveItem.storageStrategyConfig.accessToken) {
                let fromData = {
                    type: this.driveItem.type === 'sharepoint' ? "Standard" : "China",
                    accessToken: this.driveItem.storageStrategyConfig.accessToken,
                    siteType: this.driveItem.storageStrategyConfig.siteType,
                    siteName: this.driveItem.storageStrategyConfig.siteName
                }
                this.$http.post('/sharepoint/getSiteId', fromData).then((response) => {
                    if (response.data.code === this.common.responseCode.SUCCESS) {
                        this.driveItem.storageStrategyConfig.siteId = response.data.data;
                        this.$forceUpdate();
                        this.$message.success('自动获取 SiteId 成功');
                    }
                })
            }
        }
    },
    data() {
        return {
            region: region,
            loading: false,
            storageStrategyForm: [],
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
                    {required: true, type: 'url', message: '请输入正确的域名，需以 http:// 或 https:// 开头', trigger: 'change'},
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
                                callback(new Error('请输入正确的域名，需以 http:// 或 https:// 开头'));
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
                'storageStrategyConfig.secretId': [{required: true, message: "SecretId 不能为空"}],
                'storageStrategyConfig.siteId': [{required: true, message: 'SiteId 不能为空'}]
            }
        }
    },
    methods: {
        cacheChange(newVal) {
            if (!newVal) {
                this.driveItem.autoRefreshCache = false;
            }
        },
        loadStrategyForm(val) {
            this.$http.get('admin/strategy-form', {params: {storageType: val}}).then((response) => {
                this.storageStrategyForm = response.data.data;
                if (val === 'sharepoint' || val === 'sharepoint-china') {
                    this.driveItem.storageStrategyConfig.siteType = '/sites/';
                }
            })
        },
        change() {
            this.$forceUpdate();
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
                        this.close();
                        this.loading = false;
                    }).catch(()=>{
                        this.loading = false;
                    })
                } else {
                    return false;
                }
            });
        },
    },
    mounted() {
        if (this.driveItem.type) {
            this.loadStrategyForm(this.driveItem.type);
        }
    }
}
</script>

<style scoped>

    .el-drive-form-col {
        padding-left: 0 !important;
    }

</style>
