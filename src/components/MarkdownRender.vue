<template>
    <div>
        <div class="markdown-body" v-if="text" v-html="markdownHtml">
        </div>
        <template>
            <el-backtop target=".markdown-body" :bottom="20" :right="30">
                <el-tooltip placement="top" content="回到顶部">
                    <transition name="fade">
                        <div class="back-to-ceiling">
                            <svg class="Icon Icon--backToTopArrow" aria-hidden="true">
                                <use xlink:href="#el-icon-my-to-top"></use>
                            </svg>
                        </div>
                    </transition>
                </el-tooltip>
            </el-backtop>
        </template>
    </div>
</template>

<script>

    import marked from 'marked';
    import hljs from 'highlight.js/lib/core';
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
    .markdown-body >>> img {
        max-height: 150vh;
        max-width: 150vh;
        vertical-align: middle;
    }

    .markdown-body {
        box-sizing: border-box;
        min-width: 200px;
        max-width: 980px;
        margin: 0 auto;
        padding: 30px;
    }

    .markdown-body >>> pre {
        background-color: rgba(27,31,35,.05);
    }


    .back-to-ceiling {
        right: 50px;
        bottom: 50px;
        width: 40px;
        height: 40px;
        border-radius: 4px;
        line-height: 45px;
        background: #e7eaf1;
        display: inline-block;
        text-align: center;
        cursor: pointer;
    }

    .back-to-ceiling:hover {
        background: #d5dbe7;
    }

    .back-to-ceiling .Icon {
        fill: #9aaabf;
        background: none;
    }

    .back-to-ceiling .Icon--backToTopArrow {
        height: 16px;
        width: 16px;
    }

</style>
