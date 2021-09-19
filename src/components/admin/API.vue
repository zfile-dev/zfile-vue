<template>
    <el-card shadow="false">
        <markdown-render v-loading="loading"
                         element-loading-text="拼命加载中"
                         class="scroll"
                         :text="md">
        </markdown-render>
    </el-card>
</template>

<script>
    import MarkdownRender from "../MarkdownRender";
    export default {
        name: "API",
        components: {MarkdownRender},
        data() {
            return {
                loading: true,
                md: ''
            };
        },
        mounted() {
            let docUrl = 'https://c.jun6.net/ZFILE/ZFILE API.md';

            this.$http.get(docUrl, {withCredentials: false}).then((response) => {
                this.loading = false;
                this.md = response.data;
            }).catch(() => {
                this.$http.get('/common/content', {params: {url: docUrl}}).then((response) => {
                    this.loading = false;
                    this.md = response.data.data;
                });
            });
        }
    }
</script>

<style scoped>

    .markdown-body {
        padding: unset;
    }

</style>
