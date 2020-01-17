<template>
    <el-row>
        <el-col :span="12">
            <el-form id="siteForm" :rules="rules" ref="form" :model="form" label-width="auto" :status-icon="true">
                <el-form-item label="站点名称" prop="siteName">
                    <el-input v-model="form.siteName"/>
                </el-form-item>

                <el-form-item label="站点域名" prop="domain">
                    <el-input v-model="form.domain"/>
                </el-form-item>

                <el-form-item label="右侧信息框">
                    <el-switch v-model="form.infoEnable"/>
                    <span class="zfile-word-aux">开启会影响浏览性能</span>
                </el-form-item>

                <el-form-item label="开启缓存">
                    <el-switch v-model="form.enableCache" @change="form.searchEnable = false"/>
                    <span class="zfile-word-aux">默认缓存 60 分钟，每隔 30 分钟自动刷新一次.</span>
                </el-form-item>

                <el-form-item label="搜索" v-if="form.enableCache">
                    <el-switch v-model="form.searchEnable"/>
                    <span class="zfile-word-aux">从缓存中搜索文件, 可能会存在数据不一致的情况</span>
                </el-form-item>

                <el-form-item label="区分大小写" v-if="form.enableCache && form.searchEnable">
                    <el-switch v-model="form.searchIgnoreCase"/>
                </el-form-item>

                <el-form-item label="存储策略">
                    <el-select v-model="form.storageStrategy" placeholder="请选择存储策略">
                        <el-option :key="item.key" v-for="(item) in supportStrategy" :label="item.description" :value="item.key"/>
                    </el-select>
                    <el-button type="text" style="margin-left: 20px;" @click="jumpStorageStrategyConfig">设置策略</el-button>
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
                    storageStrategy: '',
                    domain: '',
                    infoEnable: false,
                    searchEnable: false,
                    searchIgnoreCase: false,
                    enableCache: false
                },
                supportStrategy: [],
                rules: {
                    siteName: [
                        {required: true, message: '请输入站点名称', trigger: 'change'},
                    ],
                    domain: [
                        {required: true, type: 'url', message: '请输入正确的域名, 需以 http:// 或 https:// 开头', trigger: 'change'},
                    ],
                }
            };
        },
        methods: {
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.$http.post('admin/config', qs.stringify(this.form)).then((response) => {
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
            },
            jumpStorageStrategyConfig() {
                this.$store.commit('changeActiveTab', this.form.storageStrategy);
                this.$router.push('/admin/storage');
            }
        },
        mounted() {
            this.$http.get('common/support-strategy').then((response) => {
                this.supportStrategy = response.data.data;
            });

            this.$http.get('admin/config').then((response) => {
                this.form = response.data.data;
            });
        }
    }
</script>

<style scoped>
    #siteForm {
        margin-top: 20px;
        margin-left: 20px;
    }

    #siteForm >>> .el-select {
        width: 85%;
    }

    .zfile-word-aux {
        margin-left: 20px;
        color: #aaaaaa;
    }
</style>