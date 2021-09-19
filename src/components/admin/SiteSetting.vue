<template>
    <el-card shadow="false">
        <el-form id="siteForm"
                 v-loading="loading"
                 element-loading-text="保存中..."
                 :rules="rules" ref="form" :model="form" label-width="auto" :status-icon="true">
            <el-form-item label="站点名称" prop="siteName" class="box animate__animated animate__fadeInUp">
                <el-input v-model="form.siteName"/>
            </el-form-item>

            <el-form-item label="站点域名" prop="domain" class="box animate__animated animate__fadeInUp">
                <el-input v-model="form.domain"/>
                <div class="zfile-word-aux zfile-margin-left-unset">此地址用于生成直链及本次存储下载使用，请务必保持和服务端地址一样。</div>
            </el-form-item>

            <el-form-item class="box animate__animated animate__fadeInUp">
                <el-button type="primary" size="small" @click="submitForm('form')">保存设置</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<script>
    import qs from 'qs';

    export default {
        name: "SiteSetting",
        data() {
            return {
                form: {
                    siteName: '',
                    domain: '',
                },
                loading: false,
                rules: {
                    siteName: [
                        {required: true, message: '请输入站点名称', trigger: 'change'},
                    ],
                    domain: [
                        {required: true, type: 'url', message: '请输入正确的域名，需以 http:// 或 https:// 开头', trigger: 'change'},
                    ]
                }
            };
        },
        methods: {
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.loading = true;
                        this.$http.post('/admin/config', qs.stringify(this.form)).then((response) => {
                            this.loading = false;
                            if (response.data.code === this.common.responseCode.SUCCESS) {
                                this.$message({
                                    message: '保存成功',
                                    type: 'success'
                                });
                            } else {
                                this.$message({
                                    message: response.data.msg,
                                    type: 'error'
                                });
                            }
                        })
                    } else {
                        return false;
                    }
                });
            },
        },
        mounted() {
            this.$http.get('/admin/config').then((response) => {
                this.form = response.data.data;

                let serverDomain = this.$http.defaults.baseURL === "" ? window.location.origin : this.$http.defaults.baseURL;
                let siteDomain = this.form.domain;

                if (serverDomain !== siteDomain) {
                    this.$confirm(`检测到服务端地址为 ${serverDomain}，当前配置站点域名为 ${siteDomain}，是否自动进行修正（不修正可能会影响下载、文件夹加密和文档预览功能）？`, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                        callback: action => {
                            if (action === 'confirm') {
                                this.form.domain = serverDomain;
                                this.$http.post('/admin/config', qs.stringify(this.form)).then((response) => {
                                    this.loading = false;
                                    if (response.data.code === this.common.responseCode.SUCCESS) {
                                        this.$message({
                                            message: '修正成功',
                                            type: 'success'
                                        });
                                    } else {
                                        this.$message({
                                            message: response.data.msg,
                                            type: 'error'
                                        });
                                    }
                                })
                            }
                        }
                    });
                }
            });
        }
    }
</script>

<style scoped>
    .el-row {
        overflow-y: auto;
    }

    #siteForm {
        margin-top: 20px;
    }

    #siteForm >>> .el-select {
        width: 70%;
    }
</style>
