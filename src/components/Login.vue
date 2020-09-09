<template>
    <div class="zfile-login">
        <el-form :model="loginForm" :rules="rules"
                 status-icon
                 ref="loginForm"
                 @keyup.enter.native="handleSubmit"
                 label-position="left"
                 label-width="0px"
                 class="zfile-login-form">

            <h3 class="zfile-login-title">管理员登录</h3>

            <el-form-item prop="username">
                <el-input type="text"
                          v-model.trim="loginForm.username"
                          auto-complete="off"
                          placeholder="用户名">
                </el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input type="password"
                          v-model.trim="loginForm.password"
                          auto-complete="off"
                          placeholder="密码">
                </el-input>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" class="el-col-24"
                           @click="handleSubmit"
                           :loading="loading">登录
                </el-button>
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
            loading: false,
            loginForm: {},
            rules: {
                username: [{required: true, message: '账号不能为空', trigger: 'blur'}],
                password: [{required: true, message: '密码不能为空', trigger: 'blur'}]
            }
        }
    },
    mounted() {
        this.$http.get('is-installed').then((response) => {
            let data = response.data;
            if (data.code === 0) {
                this.$router.push('/install')
            }
        });
        document.title = '登录 | 后台管理';
    },
    methods: {
        handleSubmit() {
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    this.$http.post('login', qs.stringify(this.loginForm)).then((response) => {
                        this.$message({
                            message: response.data.msg,
                            type: 'success',
                            duration: 1000,
                            onClose: () => {
                                this.$router.push('/admin')
                            }
                        });
                    });
                } else {
                    return false;
                }
            })
        }
    }
}
</script>

<style scoped>

.zfile-login {
    width: 100%;
    height: 100%;
}

.zfile-login-title {
    text-align: center;
}

.zfile-login-form {
    -webkit-border-radius: 5px;
    border-radius: 5px;
    margin: 180px auto;
    width: 350px;
    padding: 35px 35px 15px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
}

</style>
