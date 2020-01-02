<template>
    <el-row>
        <el-col :span="16">
            <el-form id="storageForm" ref="form" :model="form" label-width="auto">
                <el-form-item
                        v-for="(item) in storageStrategyForm"
                        :label="item.title"
                        :key="item.title">

                    <el-select v-model="form.endPoint"
                               v-if="item.key === 'endPoint' && region.hasOwnProperty(storageStrategy)">
                        <el-option v-for="endPoint in region[storageStrategy]" :label="endPoint.name" :value="endPoint.val" :key="endPoint.name"/>
                    </el-select>
                    <el-input placeholder="" @input="change($event)" v-else v-model="form[item.key]"/>
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
                },
                storageStrategyForm: [],
                region: region
            };
        },
        props: {
            storageStrategy: String
        },
        methods: {
            change() {
                this.$forceUpdate();
            },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.form.storageStrategy = this.storageStrategy;
                        this.$http.post('storage-strategy', qs.stringify(this.form)).then((response) => {
                            if (response.response.data.code === 0) {
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
            this.$http.get('admin/strategy-form', {params: {storageType: this.storageStrategy}}).then((response) => {
                this.form.endPoint = null;
                this.storageStrategyForm = response.data.data;

                for (let item of this.storageStrategyForm) {
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
</style>