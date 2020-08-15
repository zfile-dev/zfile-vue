<template>
    <div class="login-container">
        <el-form :model="ruleForm" :rules="rules"
                 status-icon
                 ref="ruleForm"
                 @keyup.enter.native="handleSubmit"
                 label-position="left"
                 label-width="0px"
                 class="demo-ruleForm login-page">
            <h3 class="title">管理员登录</h3>
            <el-form-item prop="username">
                <el-input type="text"
                          v-model.trim="ruleForm.username"
                          auto-complete="off"
                          placeholder="用户名">
                </el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input type="password"
                          v-model.trim="ruleForm.password"
                          auto-complete="off"
                          placeholder="密码">
                </el-input>
            </el-form-item>
            <el-form-item style="width:100%;">
                <el-button type="primary" style="width:100%;"
                           @click="handleSubmit"
                           :loading="logining">登录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    import qs from 'qs';

    export default {
        name: "Login",
        data() {
            return {
                logining: false,
                ruleForm: {},
                rules: {
                    username: [{required: true, message: '账号不能为空', trigger: 'blur'}],
                    password: [{required: true, message: '密码不能为空', trigger: 'blur'}]
                },
                checked: false
            }
        },
        mounted() {
            document.title = '登录 | 后台管理';
        },
        methods: {
            handleSubmit(){
                let that = this;
                this.$refs.ruleForm.validate((valid) => {
                    if(valid){
                        that.$http.post('login', qs.stringify(this.ruleForm)).then((response) => {
                            that.$message({
                                message: response.data.msg,
                                type: 'success',
                                duration: 1000,
                                onClose() {
                                    that.$router.push('/admin')
                                }
                            });
                        });
                    }else{
                        return false;
                    }
                })
            }
        }
    }
</script>

<style scoped>
    .login-container {
        width: 100%;
        height: 100%;
    }
    .login-page {
        -webkit-border-radius: 5px;
        border-radius: 5px;
        margin: 180px auto;
        width: 350px;
        padding: 35px 35px 15px;
        background: #fff;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 25px #cac6c6;
    }
    label.el-checkbox.rememberme {
        margin: 0 0 15px;
        text-align: left;
    }
</style>
