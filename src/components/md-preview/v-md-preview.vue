<template>
	<v-md-preview-inner :text="props.text" />
</template>

<script setup>
import MarkdownViewerAsyncLoading from "~/components/file/preview/MarkdownViewerAsyncLoading.vue";

const VMdPreviewInner = defineAsyncComponent({
	loader: () => {
		return new Promise((resolve, reject) => {
			;(async function() {
				try {
					const res = await import('@kangc/v-md-editor/lib/preview')
					import('@kangc/v-md-editor/lib/style/preview.css');
					import('@kangc/v-md-editor/lib/theme/style/github.css');
					const githubTheme = await import('@kangc/v-md-editor/lib/theme/github.js');
					const hljs = await import('highlight.js');
					res.use(githubTheme, {
						Hljs: hljs.HighlightJS,
					});
					resolve(res)
				} catch (error) {
					reject(error);
				}
			})();
		});
	},
	loadingComponent: MarkdownViewerAsyncLoading
});


const props = defineProps({
	text: {
		type: String,
		required: true
	}
});

</script>