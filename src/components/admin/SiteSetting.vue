<template>
    <el-row>
        <el-col :span="12">
            <el-form id="siteForm"
                     v-loading="loading"
                     element-loading-text="保存中..."
                     :rules="rules" ref="form" :model="form" label-width="auto" :status-icon="true">
                <el-form-item label="站点名称" prop="siteName">
                    <el-input v-model="form.siteName"/>
                </el-form-item>

                <el-form-item label="站点域名" prop="domain">
                    <el-input v-model="form.domain"/>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="submitForm('form')" round>保存设置</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
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
                        {required: true, type: 'url', message: '请输入正确的域名, 需以 http:// 或 https:// 开头', trigger: 'change'},
                    ]
                }
            };
        },
        methods: {
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.loading = true;
                        this.$http.post('admin/config', qs.stringify(this.form)).then((response) => {
                            this.loading = false;
                            if (response.data.code === 0) {
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
            this.$http.get('admin/config').then((response) => {
                this.form = response.data.data;
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
        margin-left: 20px;
    }

    #siteForm >>> .el-select {
        width: 70%;
    }
</style>