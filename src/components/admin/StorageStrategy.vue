<template>
    <el-tabs v-model="activeName" :stretch="true">
        <el-tab-pane label="阿里云 OSS" name="oss" :lazy="true">
            <storage-form storageStrategy="aliyun"/>
        </el-tab-pane>
        <el-tab-pane label="腾讯云 COS" name="cos" :lazy="true">
            <storage-form storageStrategy="tencent"/>
        </el-tab-pane>
        <el-tab-pane label="华为云 OBS" name="obs" :lazy="true">
            <storage-form storageStrategy="huawei"/>
        </el-tab-pane>
        <el-tab-pane label="七牛云 KODO" name="kodo" :lazy="true">
            <storage-form storageStrategy="qiniu"/>
        </el-tab-pane>
        <el-tab-pane label="又拍云 USS" name="uss" :lazy="true">
            <storage-form storageStrategy="upyun"/>
        </el-tab-pane>
        <el-tab-pane label="FTP" name="ftp" :lazy="true">
            <storage-form storageStrategy="ftp"/>
        </el-tab-pane>
        <el-tab-pane label="本地存储" name="local" :lazy="true">
            <storage-form storageStrategy="local"/>
        </el-tab-pane>
        <el-tab-pane label="minio" name="minio" :lazy="true">
            <storage-form storageStrategy="minio"/>
        </el-tab-pane>
    </el-tabs>
</template>

<script>
    import StorageForm from "@/components/admin/StorageForm";

    export default {
        name: "StorageStrategy",
        components: {StorageForm},
        data() {
            return {
                activeName: "oss",
            }
        },
    }
</script>

<style scoped>
    .el-tabs { display: block; width: 940px; }
</style>