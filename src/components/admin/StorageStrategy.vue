<template>
    <el-tabs v-model="$store.getters.activeTab" :stretch="true">

        <el-tab-pane v-for="(item) in supportStrategy"
                     :key="item.key"
                     :label="item.description"
                     :name="item.key"
                     :lazy="true">
            <storage-form :storageStrategy="item.key"/>
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
                supportStrategy: [],
            };
        },
        mounted() {
            this.$http.get('common/support-strategy').then((response) => {
                this.supportStrategy = response.data.data;
            });
        }
    }
</script>

<style scoped>
    .el-tabs {
        display: block;
        width: 940px;
    }
</style>