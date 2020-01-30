<template>
    <el-tabs v-model="activeTab" @tab-click="handleClick" :stretch="true">
        <el-tab-pane v-for="(item) in supportStrategy"
                     :key="item.key"
                     :label="item.description"
                     :name="item.key"
                     :lazy="true">
            <span slot="label">
                {{item.description}}
                <el-badge is-dot v-if="item.available" class="item" type="success"/>
                <el-badge is-dot v-else class="item"/>
            </span>
            <storage-form :init="init" :storageStrategy="item.key"/>
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
                activeTab: 'aliyun',
            };
        },
        methods: {
            handleClick: function (tab) {
                this.activeTab = tab.name;
                let path = this.$route.path;
                this.$router.push({path: path + '?type=' + this.activeTab});
            },
            init: function () {
                if (this.$route.query.type) {
                    this.activeTab = this.$route.query.type;
                }

                this.$http.get('admin/support-strategy').then((response) => {
                    this.supportStrategy = response.data.data;
                });
            }
        },
        mounted() {
            this.init();
        },
        watch: {
            '$route.query.type': function () {
                if (this.$route.query.type) {
                    this.activeTab = this.$route.query.type;
                }
            },
        }
    }
</script>

<style scoped>
    .el-tabs {
        display: block;
        width: 940px;
    }
</style>