<template>
	<!-- 画廊模式 -->
	<div class="zfile-gallery-body">
		<div v-if="fileDataStore.imgMode">
			<div v-if="fileDataStore.filterFileByType('image').length > 0">
				<div class="zfile-gallery-item"
				     :style="{ display: globalConfigStore.zfileConfig.gallery.showInfoMode === 'hover' ? 'flex' : 'block'}"
				     v-for="(item) in fileDataStore.filterFileByType('image')"
				     :key="item.name">
					<el-image class="zfile-gallery-img"
					          :class="globalConfigStore.zfileConfig.gallery.roundedBorder ? 'zfile-gallery-img-rounded' : ''"
					          :src="item.url"
					          :alt="item.name"
					          loading="lazy"
					          lazy
					          scroll-container=".zfile-gallery-body"
					          @error="onImageLoad"
					          @load="onImageLoad">
					</el-image>
					<div v-if="globalConfigStore.zfileConfig.gallery.showInfo &&
					    globalConfigStore.zfileConfig.gallery.showInfoMode === 'hover'" class="zfile-gallery-img-hover-info">
						<span class="zfile-gallery-img-text">{{item.name}}</span>
						<span class="zfile-gallery-img-text">{{common.fileSizeFormat(item.size)}}</span>
					</div>
					<div
						v-show="loadedList.includes(item.name)"
						v-if="globalConfigStore.zfileConfig.gallery.showInfo &&
						globalConfigStore.zfileConfig.gallery.showInfoMode === 'bottom'">
						<span class="zfile-gallery-img-text"> {{ item.name }} </span>
					</div>
				</div>
			</div>
			<div v-else>
				<el-empty description="当前文件夹无图片"></el-empty>
			</div>
		</div>
	</div>
</template>

<script setup>
// 是否已初始化图片
import {computed, reactive, ref, watch} from "vue";
import common from "~/common";
import Masonry from "masonry-layout";
import NProgress from "nprogress";
import 'nprogress/nprogress.css'

import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();

import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

const useImageModel = () => {
	// 是否已初始化图片
	let isInitImage = ref(false);

	// 已加载完的图片列表, 已加载完才悬浮显示标题
	let loadedList = reactive([]);

	// 图片列数
	let galleryColumn = globalConfigStore.zfileConfig.gallery.column;

	// 图片列间距 px
	let galleryColumnSpacingPx = computed(() => {
		return globalConfigStore.zfileConfig.gallery.columnSpacing + 'px';
	});

	// 图片行间距 px
	let galleryRowSpacingPx = computed(() => {
		return globalConfigStore.zfileConfig.gallery.rowSpacing + 'px';
	});

	// 图片百分比宽度
	let galleryWidth = computed(() => {
		let galleryColumnSpacing = globalConfigStore.zfileConfig.gallery.columnSpacing;
		return `calc(${100 / galleryColumn}% - ${((galleryColumn - 1) * galleryColumnSpacing / galleryColumn)}px)`
	})



	// 图片布局器实例
	let masonryInstance;

	// 当前页总数, 初始化时图片布局器实例时获取
	let totalSize;

	// 获取实例
	const getMasonryInstance = () => {
		if (isInitImage.value) {
			return masonryInstance;
		}

		// 初始化实例并获取实例对象
		let grid = document.querySelector(".zfile-gallery-body");
		masonryInstance = new Masonry(grid, {
			itemSelector: ".zfile-gallery-item",
			percentPosition: true,
			gutter: globalConfigStore.zfileConfig.gallery.columnSpacing,
			// fitWidth: true,
		});
		totalSize = fileDataStore.filterFileByType('image').length;
		isInitImage.value = true;
		loadingSize = 0
		return masonryInstance;
	}

	let loadingSize = 0;
	// 图片加载完重试
	const onImageLoad = (e) => {
		console.log('图片加载完成', e.target.src)
		if (loadingSize >= totalSize) {
			loadingSize = 0;
		}
		if (loadingSize === 0) {
			NProgress.start();
			getMasonryInstance();
		}
		if (e.type === 'error') {
			console.error(`加载第 ${loadingSize} / ${totalSize} 个图片失败: ${e.path[0].alt}`);
		}

		loadedList.push(e.path[0].alt);

		loadingSize += 1;
		if (loadingSize % galleryColumn === 0) {
			getMasonryInstance().layout();
		}
		if (loadingSize === totalSize) {
			NProgress.done(true);
			getMasonryInstance().layout();
		}
	}

	// 切换画廊模式
	watch(() => fileDataStore.imgMode, (newVal) => {
		// 如果开启了画廊模式，则初始化实例
		if (newVal) {
			loadedList.splice(0, loadedList.length - 1)
			isInitImage.value = false;
		} else {
			NProgress.done(true);
		}
	})

	return { onImageLoad, galleryWidth, loadedList, galleryColumnSpacingPx, galleryRowSpacingPx}
};

const { onImageLoad, galleryWidth, loadedList, galleryColumnSpacingPx, galleryRowSpacingPx} = useImageModel();

</script>

<style lang="scss" scoped>

.zfile-gallery-body {

	.zfile-gallery-item {
		@apply flex overflow-hidden;
		text-align: center;
		width: v-bind('galleryWidth');
		margin-bottom: v-bind('galleryRowSpacingPx');

		.zfile-gallery-img {
			@apply border;
		}

		.zfile-gallery-img-rounded {
			@apply rounded-lg;
		}

		.zfile-gallery-img-text {
			@apply overflow-ellipsis overflow-hidden whitespace-nowrap text-sm opacity-70;
		}

		.zfile-gallery-img-hover-info {
			@apply absolute top-0 h-1/2 left-0 right-0 text-sm p-2
					transition-opacity duration-300
					flex justify-between
					text-white space-x-10 opacity-0;
			background: linear-gradient(180deg,rgba(0,0,0,.6),transparent 120px);

			.zfile-gallery-img-text:last-child {
				@apply text-right min-w-fit;
			}
		}

		&:hover .zfile-gallery-img-hover-info {
			@apply opacity-100;
		}
	}

	:deep(.el-empty) {
		margin-top: 10%;
	}


}

</style>