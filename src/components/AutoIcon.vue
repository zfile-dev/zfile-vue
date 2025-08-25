<template>
	<el-image
		v-if="icon"
		:src="iconConvertToSrc(icon)"
		:preview-src-list="clickPreview ? [iconConvertToSrc(icon)] : []"
		inline
		class="h-8 w-8 inline-block"
	></el-image>
</template>

<script setup>
defineProps({
	// 组件属性
	icon: {
		type: Object,
		required: true,
	},
	clickPreview: {
		type: Boolean,
		default: true,
	},
});

/**
 * icon 转换为 src 能识别的地址，对于 http 和 https 的地址直接返回，对于 svg 的地址进行转换，对于 base64 的地址判断是否包含 data:image/svg+xml;base64, 前缀
 * @param svg
 * @returns {string}
 */
function iconConvertToSrc(svg) {
	// 检查是否是 svg
	if (svg.indexOf('<svg') !== -1) {
		// svg 转换为 base64
		const base64 = btoa(unescape(encodeURIComponent(svg)));
		return 'data:image/svg+xml;base64,' + base64;
	} else if (svg.startsWith('http') || svg.startsWith('https')) {
		return svg;
	} else if (!svg.startsWith('data:image')) {
		return 'data:image/jpeg;base64,' + svg;
	} else {
		return svg;
	}
}
</script>

<style scoped lang="scss">

</style>