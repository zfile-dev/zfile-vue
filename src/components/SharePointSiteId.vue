<template>
    <el-row :gutter="20">
        <el-col :span="12" :offset="6">
            <h2>在线获取 SharePoint SiteId 小工具</h2>
            <el-form ref="form" :rules="rules" :model="form">
                <el-form-item label="版本" class="box animate__animated animate__fadeInUp">
                    <el-radio v-model="form.type" @change="changeType" label="Standard">国际版</el-radio>
                    <el-radio v-model="form.type" @change="changeType" label="China">世纪互联</el-radio>
                </el-form-item>
                <el-form-item label="AccessToken" prop="accessToken" class="box animate__animated animate__fadeInUp">
                    <el-input v-model="form.accessToken" placeholder="请输入 AccessToken"></el-input>
                    <el-link target="_blank" v-show="form.type === 'Standard'" icon="el-icon-link" :href="$http.defaults.baseURL + '/onedrive/authorize'">前往获取令牌 (国际版)</el-link>
                    <el-link target="_blank" v-show="form.type === 'China'" icon="el-icon-link" :href="$http.defaults.baseURL + '/onedrive/china-authorize'">前往获取令牌 (世纪互联)</el-link>
                </el-form-item>
                <el-form-item label="SharePoint 域名" prop="domainPrefix" class="box animate__animated animate__fadeInUp">
                    <el-input v-model="form.domainPrefix" placeholder="请输入 SharePoint 域名">
                        <template slot="append">.sharepoint.{{ form.domainType }}</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="站点名称" prop="siteName" class="box animate__animated animate__fadeInUp">
                    <template slot="label">
                        <span>站点名称</span>
                        <span class="zfile-word-aux">（网址上域名后面的 /sites/xxx 或/teams/xxx）</span>
                    </template>
                    <el-input v-model="form.siteName" @input="submitForm('form')" placeholder="请输入站点名称" class="input-with-select">
                        <el-select v-model="form.siteType" @input="change($event)" slot="prepend">
                            <el-option label="/sites/" value="/sites/"></el-option>
                            <el-option label="/teams/" value="/teams/"></el-option>
                        </el-select>
                    </el-input>
                </el-form-item>

                <el-form-item label="SiteID" class="box animate__animated animate__fadeInUp">
                    <el-input type="small" v-model="siteId">
                        <el-tooltip slot="append" class="item" effect="dark" content="复制" placement="bottom">
                            <el-button @click="copyText(siteId)" type="small" icon="el-icon-copy-document"></el-button>
                        </el-tooltip>
                    </el-input>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<script>
export default {
    name: "SharePointSiteId",
    data() {
        return {
            form: {
                type: 'Standard',
                accessToken: '',
                domainPrefix: '',
                siteType: '/sites/',
                siteName: '',
                domainType: 'com'
            },
            siteId: '',
            rules: {
                accessToken: [
                    {required: true, message: 'AccessToken 不能为空', trigger: 'change'},
                ],
                domainPrefix: [
                    {required: true, message: 'SharePoint 域名不能为空', trigger: 'change'},
                ],
                siteName: [
                    {required: true, message: '站点名称不能为空', trigger: 'change'},
                ]
            },
            loading: false
        }
    },
    watch: {
        'form.type'() {
            if (!!this.form.accessToken) {
                this.getDomainPrefix();
            }
        },
        'form.accessToken'() {
            if (!!this.form.accessToken) {
                this.getDomainPrefix();
            }
        }
    },
    methods: {
        getDomainPrefix() {
            this.$http.post('/sharepoint/getDomainPrefix', this.form).then((response) => {
                if (response.data.code === this.common.responseCode.SUCCESS) {
                    this.form.domainPrefix = response.data.data;
                }
            })
        },
        copyText(text) {
            this.$copyText(text).then(() => {
                this.$message.success('复制成功');
            }, () => {
                this.$message.error('复制失败');
            });
        },
        changeType() {
            if (this.form.type === 'Standard') {
                this.form.domainType = 'com';
            } else if (this.form.type === 'China') {
                this.form.domainType = 'cn';
            }
        },
        change() {
            this.$forceUpdate();
        },
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.loading = true;
                    this.$http.post('/sharepoint/getSiteId', this.form).then((response) => {
                        if (response.data.code === this.common.responseCode.SUCCESS) {
                            this.siteId = response.data.data;
                            this.$forceUpdate();
                            this.$message.success('自动获取 SiteId 成功');
                        }
                        this.loading = false;
                    })
                } else {
                    this.loading = false;
                    return false;
                }
            });
        }
    }
}
</script>

<style scoped>
    .input-with-select .el-select {
        width: 100px;
    }
</style>
