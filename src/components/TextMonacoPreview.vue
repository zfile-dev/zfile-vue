<template>
    <div class="content" v-loading="loading"
         element-loading-text="拼命加载中">
        <MonacoEditor class="editor"
                      v-model.trim="text"
                      theme=""
                      language="markdown"/>
    </div>
</template>

<script>
    import MonacoEditor from 'vue-monaco';

    export default {
        name: "TextPlayer",
        components: {
            MonacoEditor
        },
        data() {
            return {
                text: '',
                loading: true
            }
        },
        props: {
            file: Object
        },
        methods: {
            getFileSuffix(name) {
                return name.substr(name.lastIndexOf('.') + 1);
            },
            init() {
                let file = this.file;
                this.$http.get('common/content', {params: {url: file.url}}).then((response) => {
                    this.loading = false;
                    this.text = response.data.data;
                });
            }
        }
    }
</script>

<style scoped>
    .content >>> img {
        max-height: 150vh;
        max-width: 150vh;
        vertical-align:middle;
    }

    .content .markdown-body >>> pre {
        margin-right: 20px;
        background-color: rgba(27,31,35,.05);
    }

    .dialog-scroll {
        height: calc(100vh - 5vh - 54px  - 55px - 50vh);
        overflow-y: auto;
        margin: 0;
    }

    .editor {
        width: 100%;
        height: 600px;
    }
</style>