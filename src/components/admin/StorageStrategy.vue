<template>
    <el-tabs v-model="$store.getters.activeTab" :stretch="true">
        <el-tab-pane v-for="(item) in supportStrategy"
                     :key="item.key"
                     :label="item.description"
                     :name="item.key"
                     :lazy="true">
        <span slot="label">
            {{item.description}}
            <el-badge is-dot v-if="item.available" class="item" type="success"/>
            <el-badge is-dot v-else class="item" type="error"/>
        </span>
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
            this.$http.get('admin/support-strategy').then((response) => {
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