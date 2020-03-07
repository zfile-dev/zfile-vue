<template>
    <el-row :gutter="20">
        <el-col :span="10" :offset="7">
            <el-card class="box-card" align-center shadow="always">
                <el-form ref="form" :rules="rules" :model="form" label-width="auto" :status-icon="true" v-loading="loading" element-loading-text="保存并初始化中.">
                    <el-form-item label="站点名称" prop="siteName">
                        <el-input v-model="form.siteName"/>
                    </el-form-item>

                    <el-form-item label="管理员账号" prop="username">
                        <el-input v-model.trim="form.username"/>
                    </el-form-item>

                    <el-form-item label="管理员密码" prop="password">
                        <el-input v-model.trim="form.password"/>
                    </el-form-item>

                    <el-form-item label="站点地址/域名" prop="domain">
                        <el-input v-model.trim="form.domain"/>
                    </el-form-item>

                    <el-form-item label="存储策略">
                        <el-select v-model="form.storageStrategy" placeholder="请选择存储策略">
                            <el-option :key="item.key" v-for="(item) in supportStrategy" :label="item.description" :value="item.key"/>
                        </el-select>
                    </el-form-item>

                    <el-form-item
                            v-for="(item) in storageStrategyForm"
                            :label="item.title"
                            :key="item.title"
                            :prop="'storageStrategyForm' + item.key">

                        <el-select v-model="form.storageStrategyConfig.endPoint"
                                   v-if="item.key === 'endPoint' && region.hasOwnProperty(form.storageStrategy)">
                            <el-option v-for="endPoint in region[form.storageStrategy]" :label="endPoint.name" :value="endPoint.val" :key="endPoint.name"/>
                        </el-select>

                        <div v-else-if="item.key === 'pathStyle'">
                            <el-select v-model="form.storageStrategyConfig.pathStyle" style="width: 50%">
                                <el-option label="bucket-virtual-hosting" value="bucket-virtual-hosting"></el-option>
                                <el-option label="path-style" value="path-style"></el-option>
                            </el-select>
                            <el-link class="zfile-word-aux" target="_blank" icon="el-icon-document"
                                     href="https://docs.aws.amazon.com/zh_cn/AmazonS3/latest/dev/VirtualHosting.html#path-style-access">查看 S3 API 说明文档</el-link>
                        </div>

                        <div v-else-if="item.key === 'isPrivate'">
                            <el-switch v-model="form.storageStrategyConfig.isPrivate" />
                            <span class="zfile-word-aux">私有空间会生成带签名的下载链接</span>
                        </div>

                        <el-input placeholder="" @input="change($event)" v-else v-model="form.storageStrategyConfig[item.key]"/>

                        <div v-if="item.key === 'base-path'">
                            <span class="zfile-word-aux" style="margin-left: 0">基路径表示从哪个路径开始文件, 不填写表示从根开始</span>
                        </div>

                        <div v-if="item.key === 'domain' && form.storageStrategy === 'ftp'">
                            <span class="zfile-word-aux" style="margin-left: 0">此域名表示 http 访问域名</span>
                        </div>
                    </el-form-item>

                    <el-form-item v-if="form.storageStrategy === 'onedrive'">
                        <el-link target="_blank" icon="el-icon-edit"
                                 href="https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=09939809-c617-43c8-a220-a93c1513c5d4&response_type=code&redirect_uri=https://zfile.jun6.net/onedrive/callback&scope=offline_access%20User.Read%20Files.ReadWrite.All">前往获取授权</el-link>
                    </el-form-item>

                    <el-form-item v-if="form.storageStrategy === 'onedrive-china'">
                        <el-link target="_blank" icon="el-icon-edit"
                                 href="https://login.chinacloudapi.cn/common/oauth2/v2.0/authorize?client_id=4a72d927-1907-488d-9eb2-1b465c53c1c5&response_type=code&redirect_uri=https://zfile.jun6.net/onedrive/china-callback&scope=offline_access%20User.Read%20Files.ReadWrite.All">前往获取授权</el-link>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="submitForm('form')">确认</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-col>
    </el-row>
</template>

<script>
    import qs from 'qs';
    import region from "@/region";

    export default {
        name: "Install",
        data() {
            return {
                active: 1,
                form: {
                    siteName: '',
                    storageStrategy: '',
                    username: '',
                    password: '',
                    domain: window.location.protocol + "//" + window.location.host,
                    storageStrategyConfig: {
                        endPoint: '',
                    },
                },
                loading: false,
                storageStrategyForm: [],
                supportStrategy: [],
                region: region,
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
                    storageStrategyFormdomain: [
                        {
                            required: this.storageStrategy !== 'ftp',
                            type: 'url',
                            message: '请输入正确的域名, 需以 http:// 或 https:// 开头',
                            trigger: 'change'
                        }
                    ],
                    storageStrategyFormusername: [{required: this.storageStrategy === 'upyun', message: '操作员名称不能为空'}],
                    storageStrategyFormpassword: [{required: this.storageStrategy === 'upyun', message: '操作员密码不能为空'}],
                    storageStrategyFormendPoint: [{required: true, message: '区域不能为空'}],
                    storageStrategyFormaccessKey: [{required: true, message: 'AccessKey 不能为空'}],
                    storageStrategyFormsecretKey: [{required: true, message: 'SecretKey 不能为空'}],
                    'storageStrategyFormbucket-name': [{required: true, message: '此项不能为空'}],
                    storageStrategyFormhost: [{required: true, message: "域名或 IP 不能为空"}],
                    storageStrategyFormport: [{required: true, message: "端口不能为空"}],
                    storageStrategyFormaccessToken: [{required: true, message: "访问令牌不能为空"}],
                    storageStrategyFormrefreshToken: [{required: true, message: "刷新令牌不能为空"}],
                    storageStrategyFormsecretId: [{required: true, message: "SecretId 不能为空"}]
                }
            };
        },
        watch: {
            'form.storageStrategy'(newVal) {
                this.$http.get('form', {params: {storageType: newVal}}).then((response) => {
                    this.form.storageStrategyConfig.endPoint = null;
                    this.storageStrategyForm = response.data.data;
                })
            }
        },
        methods: {
            change() {
                this.$forceUpdate();
            },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.loading = true;
                        let that = this;
                        this.$http.post('install', qs.stringify(this.form)).then((response) => {
                            this.loading = false;
                            let data =  response.data;
                            this.$message({
                                message: data.msg,
                                type: data.code === 0 ? 'success' : 'error',
                                duration: 1500,
                                onClose() {
                                    that.$router.push('/main')
                                }
                            });
                        })
                    } else {
                        this.loading = false;
                        return false;
                    }
                });
            }
        },
        created() {
            this.$http.get('is-installed').then((response) => {
                let data =  response.data;
                if (data.code !== 0) {
                    this.$router.push('/main');
                }
            })
        },
        mounted() {
            this.$http.get('common/support-strategy').then((response) => {
                this.supportStrategy = response.data.data;
            });
        }
    }
</script>

<style scoped>
    .box-card {
        padding-top: 30px;
        padding-right: 30px;
        margin: 10vh auto;
        height: 75vh;
        overflow-y: auto;
    }

    .el-select {
        width: 100%;
    }


    .zfile-word-aux {
        margin-left: 20px;
        color: #aaaaaa;
    }
</style>