<template>
    <div class="content" v-loading="loading"
         element-loading-text="拼命加载中">

        <div id="container" class="editor" v-if="getFileSuffix(file.name) !== 'md'"></div>

        <div class="dialog-scroll markdown-body"
             v-html="markdownHtml" v-if="getFileSuffix(file.name) === 'md'">
        </div>
    </div>
</template>

<script>
    import marked from 'marked';
    import hljs from 'highlight.js/lib/core';
    import 'github-markdown-css';

    hljs.registerLanguage('markdown', require('highlight.js/lib/languages/markdown'));

    export default {
        name: "TextPreview",
        components: {
        },
        data() {
            return {
                text: '',
                loading: true,
                editor: '',
            }
        },
        props: {
            file: Object
        },
        mounted() {
            let file = this.file;

            this.$http.get(file.url, {withCredentials: false}).then((response) => {
                this.loading = false;
                this.text = response.data;
                this.initMonaco();
            }).catch(() => {
                this.$http.get('/common/content', {params: {url: file.url}}).then((response) => {
                    this.loading = false;
                    this.text = response.data.data;
                    this.initMonaco();
                });
            })
        },
        methods: {
            getFileSuffix(name) {
                let suffix = name.substr(name.lastIndexOf('.') + 1).toLocaleLowerCase();
                if (suffix === 'js') {
                    return 'javascript';
                }
                return suffix;
            },
            initMonaco() {
                if (this.getFileSuffix(this.file.name) !== 'md') {
                  import(/* webpackChunkName: "monaco-editor" */'monaco-editor/esm/vs/editor/editor.api')
                      .then(({editor}) => {
                        editor.create(document.getElementById('container'), {
                          value: this.text,
                          language: this.getFileSuffix(this.file.name),
                          theme: 'vs',
                        });
                  })
                }
            }
        },
        computed: {
            markdownHtml() {
                // url 新窗口打开.
                let renderer = new marked.Renderer();
                renderer.link = function() {
                    let link = marked.Renderer.prototype.link.apply(this, arguments);
                    return link.replace("<a","<a target='_blank'");
                };
                marked.setOptions({
                    renderer: renderer
                });

                return marked(this.text, {
                    highlight: function(code) {
                        return hljs.highlightAuto(code).value;
                    }
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
        height: calc(100vh - 5vh - 54px  - 55px - 5vh);
        overflow-y: auto;
        margin: 0;
    }

    .editor {
        width: 100%;
        height: 80vh;
    }
</style>
