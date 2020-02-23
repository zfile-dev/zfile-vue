<template>
    <markdown-render v-loading="loading"
                     element-loading-text="拼命加载中"
                     class="scroll"
                     :text="md">
    </markdown-render>
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
            let docUrl = 'http://c.jun6.net/ZFILE/ZFILE API.md';

            this.$http.get('common/content', {params: {url: docUrl}}).then((response) => {
                this.loading = false;
                this.md = response.data.data;
            }).catch(() => {
                this.$http.get(docUrl).then((response) => {
                    this.loading = false;
                    this.text = response;
                });
                this.loading = false;
            });
        }
    }
</script>

<style scoped>

    .markdown-body {
        padding: 20px !important;
    }

    .scroll {
        height: 100vh;
        overflow-y: auto;
    }
</style>