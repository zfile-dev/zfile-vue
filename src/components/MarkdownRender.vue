<template>
    <div class="zfile-markdown-body" v-if="text" v-html="markdownHtml"></div>
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
    .zfile-markdown-body >>> img {
        max-height: 150vh;
        max-width: 150vh;
        vertical-align: middle;
    }

    .zfile-markdown-body {
        box-sizing: border-box;
        min-width: 200px;
        max-width: 980px;
        margin: 0 auto;
        padding: 30px;
    }

    .zfile-markdown-body >>> pre {
        background-color: rgba(27,31,35,.05);
    }

</style>
