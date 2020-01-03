<template>
    <el-row>
        <el-col :span="16">
            <el-form id="pwdForm" ref="form"
                     @keyup.enter.native="submitForm('form')"
                     :rules="rules"
                     :model="form" label-width="auto" :status-icon="true">
                <el-form-item label="管理员账号">
                    <el-input v-model.trim="form.username"/>
                </el-form-item>

                <el-form-item label="设置新密码" prop="password">
                    <el-input v-model.trim="form.password"/>
                </el-form-item>

                <el-form-item label="确认密码" prop="repassword">
                    <el-input v-model.trim="form.repassword"/>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="submitForm('form')">确认</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<script>

    import qs from 'qs'

    export default {
        name: "UpdatePassword",
        data() {
            return {
                form: {
                    username: '',
                    password: '',
                    repassword: ''
                },
                rules: {
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                    ],
                    repassword: [
                        {
                            required: true, validator: (rule, value, callback) => {
                                if (value === '') {
                                    callback(new Error('请再次输入密码'))
                                } else if (value !== this.form.password) {
                                    callback(new Error('两次输入密码不一致!'))
                                } else {
                                    callback()
                                }
                            }, trigger: 'change'
                        }
                    ]
                }
            };
        },
        methods: {
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.$http.post('admin/update-pwd', qs.stringify(this.form)).then((response) => {
                            if (response.data.code === 0) {
                                this.$message({
                                    message: '保存成功',
                                    type: 'success'
                                });
                            }
                        })
                    } else {
                        return false;
                    }
                });
            }
        },
        mounted() {
            this.$http.get('admin/config').then((response) => {
                this.form = response.data.data;
            })
        }
    }
</script>

<style scoped>
    #pwdForm {
        margin-top: 20px;
        margin-left: 20px;
    }
</style>