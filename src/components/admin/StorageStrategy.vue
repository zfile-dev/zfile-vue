<template>
    <el-tabs v-model="$store.getters.activeTab" :stretch="true">
        <el-tab-pane label="阿里云 OSS" name="aliyun" :lazy="true">
            <storage-form storageStrategy="aliyun"/>
        </el-tab-pane>
        <el-tab-pane label="腾讯云 COS" name="tencent" :lazy="true">
            <storage-form storageStrategy="tencent"/>
        </el-tab-pane>
        <el-tab-pane label="华为云 OBS" name="huawei" :lazy="true">
            <storage-form storageStrategy="huawei"/>
        </el-tab-pane>
        <el-tab-pane label="七牛云 KODO" name="qiniu" :lazy="true">
            <storage-form storageStrategy="qiniu"/>
        </el-tab-pane>
        <el-tab-pane label="又拍云 USS" name="upyun" :lazy="true">
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
    }
</script>

<style scoped>
    .el-tabs { display: block; width: 940px; }
</style>