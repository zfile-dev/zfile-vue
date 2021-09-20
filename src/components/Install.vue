<template>
    <div v-loading="fullLoading" class="zfile-install">
        <el-form ref="form" :rules="rules" :model="form"
                 label-width="auto"
                 :status-icon="true"
                 v-loading="loading"
                 class="zfile-install-form"
                 element-loading-text="保存并初始化中.">

            <div class="zfile-install-title box animate__animated animate__fadeIn">
                Z-File
                <small>Install</small>
            </div>

            <el-form-item class="box animate__animated animate__fadeInUp" prop="siteName">
                <el-input placeholder="站点名称" prefix-icon="el-icon-tickets" v-model="form.siteName"/>
            </el-form-item>

            <el-form-item class="box animate__animated animate__fadeInUp" prop="username">
                <el-input placeholder="管理员账号" prefix-icon="el-icon-user" v-model.trim="form.username"/>
            </el-form-item>

            <el-form-item class="box animate__animated animate__fadeInUp" prop="password">
                <el-input placeholder="管理员密码" prefix-icon="el-icon-key" v-model.trim="form.password"/>
            </el-form-item>

            <el-form-item class="box animate__animated animate__fadeInUp" prop="domain">
                <el-input placeholder="站点地址/域名" prefix-icon="el-icon-link" v-model.trim="form.domain"/>
            </el-form-item>

            <el-form-item class="zfile-install-enter">
                <el-button type="primary" icon="el-icon-check" size="small" @click="submitForm('form')">确认</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import qs from 'qs';

export default {
    name: "Install",
    data() {
        return {
        	fullLoading: false,
            form: {
                siteName: '',
                username: '',
                password: '',
                domain: ''
            },
            loading: false,
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
                ]
            }
        };
    },
    mounted() {
	    this.form.domain = this.$http.defaults.baseURL === "" ? window.location.origin : this.$http.defaults.baseURL;

	    this.fullLoading = true;
        this.$http.get('/is-installed').then((response) => {
            if (response.data.code !== 0) {
                this.$router.push('/main');
            }
            this.fullLoading = false;
        });
    },
    methods: {
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.loading = true;
                    let that = this;
                    this.$http.post('/doInstall', qs.stringify(this.form)).then((response) => {
                        this.loading = false;
                        let data = response.data;
                        if (data.code === 0) {
                            this.$message({
                                message: "初始化成功",
                                type: data.code === 0 ? 'success' : 'error',
                                duration: 1500,
                                onClose() {
                                    that.$router.push('/main')
                                }
                            });
                        } else {
                            this.$message({
                                message: data.msg,
                                type: 'error',
                                duration: 3000,
                                onClose() {
                                    that.$router.push('/main')
                                }
                            });
                        }
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
    .zfile-install {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }

    .zfile-install-form {
        width: 450px;
        padding: 30px 35px 15px;
        background: #fff;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 15px #cac6c6;
    }

    .zfile-install-title  {
        text-align: center;
        vertical-align: text-bottom;
        font-size: 30px;
        font-weight: 600;
        color: red;
        background-image: linear-gradient(-20deg, #6e45e2, #88d3ce);
        -webkit-text-fill-color: transparent;
        -webkit-background-clip: text;
        line-height: 80px;
    }

    .zfile-install-enter {
        text-align: right;
        margin-bottom: 0;
    }

    .zfile-install-title small  {
        font-size: 20px;
    }
</style>
