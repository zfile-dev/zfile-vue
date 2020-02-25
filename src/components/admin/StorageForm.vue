<template>
    <el-row>
        <el-col :span="16"  v-loading="loading"
                element-loading-text="保存并初始化中.">
            <el-form id="storageForm" ref="form" :model="form" :rules="rules" label-width="auto" :status-icon="true">
                <el-form-item
                        v-for="(item) in storageStrategyForm"
                        :label="item.title"
                        :key="item.title"
                        :prop="item.key">

                    <el-select v-model="form.endPoint"
                               v-if="item.key === 'endPoint' && region.hasOwnProperty(storageStrategy)">
                        <el-option v-for="endPoint in region[storageStrategy]" :label="endPoint.name" :value="endPoint.val" :key="endPoint.name"/>
                    </el-select>

                    <div v-else-if="item.key === 'pathStyle'">
                        <el-select v-model="form.pathStyle" style="width: 50%">
                            <el-option label="bucket-virtual-hosting" value="bucket-virtual-hosting"></el-option>
                            <el-option label="path-style" value="path-style"></el-option>
                        </el-select>
                        <el-link class="zfile-word-aux" target="_blank" icon="el-icon-document"
                                 href="https://docs.aws.amazon.com/zh_cn/AmazonS3/latest/dev/VirtualHosting.html#path-style-access">查看 S3 API 说明文档</el-link>
                    </div>

                    <div v-else-if="item.key === 'isPrivate'">
                        <el-switch v-model="form.isPrivate" />
                        <span class="zfile-word-aux">私有空间会生成带签名的下载链接</span>
                    </div>

                    <el-input placeholder="" @input="change($event)" v-else v-model="form[item.key]"/>

                    <div v-if="item.key === 'base-path'">
                        <span class="zfile-word-aux" style="margin-left: 0">基路径表示从哪个路径开始文件, 不填写表示从根开始</span>
                    </div>

                    <div v-if="item.key === 'domain' && storageStrategy === 'ftp'">
                        <span class="zfile-word-aux" style="margin-left: 0">此域名表示 http 访问域名</span>
                    </div>

                </el-form-item>

                <el-form-item v-if="this.storageStrategy === 'onedrive'">
                    <el-link target="_blank" icon="el-icon-edit"
                             href="https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=09939809-c617-43c8-a220-a93c1513c5d4&response_type=code&redirect_uri=https://zfile.jun6.net/onedrive/callback&scope=offline_access%20User.Read%20Files.ReadWrite.All">前往获取授权</el-link>
                </el-form-item>

                <el-form-item v-if="this.storageStrategy === 'onedrive-china'">
                    <el-link target="_blank" icon="el-icon-edit"
                             href="https://login.chinacloudapi.cn/common/oauth2/v2.0/authorize?client_id=4a72d927-1907-488d-9eb2-1b465c53c1c5&response_type=code&redirect_uri=https://zfile.jun6.net/onedrive/china-callback&scope=offline_access%20User.Read%20Files.ReadWrite.All">前往获取授权</el-link>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="submitForm('form')">确认</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<script>
    import qs from 'qs';
    import region from "@/region";

    export default {
        name: "StorageForm",
        data() {
            return {
                form: {
                    endPoint: '',
                    pathStyle: '',
                    isPrivate: '',
                    domain: null,
                    accessKey: null,
                    secretKey: null,
                    'bucket-name': null,
                    host: null,
                    port: null,
                    accessToken: null,
                    refreshToken: null,
                    secretId: null,
                    username: null,
                    password: null,
                },
                storageStrategyForm: [],
                region: region,
                loading: false,
                rules: {
                    domain: [
                        {
                            required: this.storageStrategy !== 'ftp',
                            type: 'url',
                            message: '请输入正确的域名, 需以 http:// 或 https:// 开头',
                            trigger: 'change'
                        }
                    ],
                    username: [{required: this.storageStrategy === 'upyun', message: '操作员名称不能为空'}],
                    password: [{required: this.storageStrategy === 'upyun', message: '操作员密码不能为空'}],
                    endPoint: [{required: true, message: '区域不能为空'}],
                    accessKey: [{required: true, message: 'AccessKey 不能为空'}],
                    secretKey: [{required: true, message: 'SecretKey 不能为空'}],
                    'bucket-name': [{required: true, message: '此项不能为空'}],
                    host: [{required: true, message: "域名或 IP 不能为空"}],
                    port: [{required: true, message: "端口不能为空"}],
                    accessToken: [{required: true, message: "访问令牌不能为空"}],
                    refreshToken: [{required: true, message: "刷新令牌不能为空"}],
                    secretId: [{required: true, message: "SecretId 不能为空"}]
                }
            };
        },
        props: {
            storageStrategy: String,
            init: Function
        },
        methods: {
            change() {
                this.$forceUpdate();
            },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.loading = true;
                        this.form.storageStrategy = this.storageStrategy;
                        this.$http.post('admin/storage-strategy', qs.stringify(this.form)).then((response) => {
                            this.loading = false;
                            if (response.data.code === 0) {
                                this.$message({
                                    message: '初始化成功',
                                    type: 'success'
                                });
                            } else {
                                this.$message({
                                    message: response.data.msg,
                                    type: 'warning'
                                });
                            }
                            this.init();
                        })
                    } else {
                        return false;
                    }
                });
            }
        },
        mounted() {
            this.$http.get('admin/strategy-form', {params: {storageType: this.storageStrategy}}).then((response) => {
                this.form.endPoint = null;
                this.storageStrategyForm = response.data.data;

                for (let item of this.storageStrategyForm) {
                    if (item.value === 'true' || item.value === 'false') {
                        item.value = Boolean(item.value);
                    }
                    this.form[item.key] = item.value;
                }
            })
        }
    }
</script>

<style scoped>
    #storageForm {
        margin-left: 20px;
    }

    #storageForm >>> .el-select {
        width: 100%;
    }

    .zfile-word-aux {
        margin-left: 20px;
        color: #aaaaaa;
    }
</style>