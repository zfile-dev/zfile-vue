<template>
    <el-card shadow="false">
        <el-form id="siteForm"
                 v-loading="loading"
                 element-loading-text="保存中..."
                 ref="form" :model="form" label-width="auto" :status-icon="true">
            <el-form-item label="页面布局" class="box animate__animated animate__fadeInUp">
                <el-radio v-model="form.layout" label="full">全屏</el-radio>
                <el-radio v-model="form.layout" label="center">居中</el-radio>
            </el-form-item>

            <el-form-item label="列表尺寸" class="box animate__animated animate__fadeInUp">
                <el-radio v-model="form.tableSize" label="medium">大</el-radio>
                <el-radio v-model="form.tableSize" label="small">中</el-radio>
                <el-radio v-model="form.tableSize" label="mini">小</el-radio>
            </el-form-item>

            <el-form-item label="显示操作按钮" class="box animate__animated animate__fadeInUp">
                <el-switch v-model="form.showOperator"/>
                <span class="zfile-word-aux">显示下载和复制按钮, 在移动端只显示下载</span>
            </el-form-item>

            <el-form-item label="显示文档区" class="box animate__animated animate__fadeInUp">
                <el-switch v-model="form.showDocument"/>
                <span class="zfile-word-aux">在文件列表下，显示当前文件夹中 readme.md 的内容</span>
            </el-form-item>

            <el-form-item label="显示公告" class="box animate__animated animate__fadeInUp">
                <el-switch v-model="form.showAnnouncement"/>
                <span class="zfile-word-aux">网站顶部，显示公告内容</span>
            </el-form-item>

            <el-form-item label="公告内容" class="box animate__animated animate__fadeInUp">
                <el-input
                        type="textarea"
                        :rows="3"
                        placeholder="请输入公告内容"
                        v-model="form.announcement">
                </el-input>
            </el-form-item>

            <el-form-item label="自定义 CSS" class="box animate__animated animate__fadeInUp">
                <el-input
                        type="textarea"
                        :rows="3"
                        placeholder="请输入自定义 CSS 内容"
                        v-model="form.customCss">
                </el-input>
            </el-form-item>

            <el-form-item label="自定义 JS" class="box animate__animated animate__fadeInUp">
                <el-input
                        type="textarea"
                        :rows="3"
                        placeholder="请输入自定义 JS 内容"
                        v-model="form.customJs">
                </el-input>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="submitForm('form')" round>保存设置</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<script>
    import qs from 'qs';

    export default {
        name: "ViewSetting",
        data() {
            return {
                form: {
                    layout: '',
                    tableSize: '',
                    showOperator: false,
                    showDocument: false,
                    showAnnouncement: false,
                    announcement: '',
                    customCss: '',
                    customJs: '',
                },
                loading: false,
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
            });
        }
    }
</script>

<style scoped>
</style>
