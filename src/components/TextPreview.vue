<template>
    <div class="content" v-loading="loading"
         element-loading-text="拼命加载中">
        <div class="dialog-scroll markdown-body"
             v-html="markdownHtml" v-if="fileType === 'markdown'">
        </div>
        <pre v-if="fileType === 'text'" class="dialog-scroll text-content"><code v-html="highlightText"/></pre>
    </div>
</template>

<script>

    import marked from 'marked';
    import * as hljs from 'highlight.js/lib/highlight';
    import 'github-markdown-css';

    hljs.registerLanguage('markdown', require('highlight.js/lib/languages/markdown'));
    hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
    hljs.registerLanguage('css', require('highlight.js/lib/languages/css'));
    hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'));
    hljs.registerLanguage('json', require('highlight.js/lib/languages/json'));
    hljs.registerLanguage('java', require('highlight.js/lib/languages/java'));
    hljs.registerLanguage('yaml', require('highlight.js/lib/languages/yaml'));
    hljs.registerLanguage('python', require('highlight.js/lib/languages/python'));
    hljs.registerLanguage('php', require('highlight.js/lib/languages/php'));

    export default {
        name: "TextPlayer",
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
                }).catch(() => {
                    this.$http.get(file.url).then((response) => {
                        this.loading = false;
                        this.text = response.data;
                    })
                });


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
            },
            highlightText() {
                if (this.loading) {
                    return '';
                } else if (this.file.size > 10240) {
                    this.$message('文件内容过多, 取消高亮显示');
                    return this.text;
                } else {
                    let result = '';
                    try {
                       result = hljs.highlightAuto(this.text).value;
                    } catch (e) {
                        result = this.text;
                    }
                    return result;
                }
            },
            fileType() {
                return this.getFileSuffix(this.file.name) === 'md' ? 'markdown' : 'text';
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

</style>