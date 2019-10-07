<template>
    <div class="markdown-content" v-if="text" v-html="markdownHtml"></div>
</template>

<script>
    import hljs from 'highlight.js';
    import marked from 'marked';

    export default {
        name: "MarkdownRender",
        props: {
            text: String
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
    .markdown-content >>> img {
        max-height: 150vh;
        max-width: 150vh;
        vertical-align: middle;
    }

    .markdown-content {
        padding: 10px 30px 10px 30px;
    }

    .markdown-content >>> pre {
        background-color: rgba(27,31,35,.05);
    }
</style>