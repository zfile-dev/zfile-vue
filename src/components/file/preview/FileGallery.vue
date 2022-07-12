<template>
	<!-- 画廊模式 -->
	<div class="zfile-gallery-body">
		<div class="zfile-img-body" v-if="transferResult.length > 0">
			<div class="zfile-img-row" v-for="(rowItem, index) in transferResult" :key="index">
				<div class="zfile-img-col"
				     @click="openImage(colItem)"
				     :style="{ display: globalConfigStore.zfileConfig.gallery.showInfoMode === 'hover' ? 'flex' : 'block'}"
				     v-for="colItem in rowItem">
					<el-image class="zfile-gallery-img"
					          :class="globalConfigStore.zfileConfig.gallery.roundedBorder ? 'zfile-gallery-img-rounded' : ''"
					          :src="colItem?.url"
					          :alt="colItem?.name"
					          loading="lazy"
					          lazy
					          @load="onImageLoad"
					          scroll-container=".zfile-gallery-body">
					</el-image>
					<div v-if="globalConfigStore.zfileConfig.gallery.showInfo &&
					    globalConfigStore.zfileConfig.gallery.showInfoMode === 'hover'"
					     :class="globalConfigStore.zfileConfig.gallery.roundedBorder ? 'zfile-gallery-img-rounded' : ''"
					     class="zfile-gallery-img-hover-info">
						<span class="zfile-gallery-img-text">{{colItem?.name}}</span>
						<span class="zfile-gallery-img-text">{{common.fileSizeFormat(colItem?.size)}}</span>
					</div>
					<div
						v-show="loadedList.includes(colItem?.name)"
						v-if="globalConfigStore.zfileConfig.gallery.showInfo &&
						globalConfigStore.zfileConfig.gallery.showInfoMode === 'bottom'">
						<span class="zfile-gallery-img-text"> {{ colItem?.name }} </span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
// 是否已初始化图片
import {computed, reactive, ref} from "vue";
import common from "~/common";
import 'nprogress/nprogress.css'

import useGlobalConfigStore from "~/stores/global-config";
import useFileDataStore from "~/stores/file-data";

let globalConfigStore = useGlobalConfigStore();

let fileDataStore = useFileDataStore();


const transferResult = computed(() => {
	// 获取图片列表
	let imgList = fileDataStore.filterFileByType('image');

	// 图片二维数组, 表示每行每列的图片
	let imgArray = ref([]);

	// 图片列数
	let galleryColumn = globalConfigStore.zfileConfig.gallery.column;

	// 当前行数
	let currRow = 0;

	imgList.forEach((item, index) => {
		if (index % galleryColumn === 0) {
			if (index !== 0) {
				currRow++;
			}
			imgArray.value[currRow] = [];
		}
		imgArray.value[currRow].push(item);
	})

	// 图片行转列函数
	function transfer(oldArr) {
		return oldArr[0].map((col, i) => oldArr.map(row => row[i]));
	}

	// 图片行转列完成后的数组
	return transfer(imgArray.value);
})



// 已加载完的图片列表, 已加载完才悬浮显示标题
let loadedList = reactive([]);
const onImageLoad = (e) => {
	loadedList.push(e.path[0].alt);
}

// 图片行间距 px
let galleryRowSpacingPx = computed(() => {
	return globalConfigStore.zfileConfig.gallery.rowSpacing + 'px';
});

// 图片实际宽度（减去列间距）
let galleryImgWidth = computed(() => {
	// 图片列数
	let galleryColumn = globalConfigStore.zfileConfig.gallery.column;
	let galleryColumnSpacing = globalConfigStore.zfileConfig.gallery.columnSpacing;
	return `calc(${100}% - ${((galleryColumn - 1) * galleryColumnSpacing / galleryColumn)}px)`
})

// 图片外部容器宽度, 100 / 图片列数
let galleryRowWidth = computed(() => {
	return `${100/globalConfigStore.zfileConfig.gallery.column}%`;
})


// 引入文件预览组件
import useFilePreview from '~/composables/file/useFilePreview';
const { openImage } = useFilePreview();


</script>

<style lang="scss" scoped>

.zfile-gallery-body {
	height: 100%;
	overflow-y: auto;

	.zfile-img-body {
		@apply flex h-full flex-wrap;
	}

	.zfile-img-row {
		width: v-bind('galleryRowWidth');
	}

	.zfile-img-col {
		@apply flex overflow-hidden relative text-center;
		width: v-bind('galleryImgWidth');
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



}

</style>