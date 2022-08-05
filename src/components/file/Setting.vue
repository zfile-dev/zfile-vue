<template>
	<div class="zfile-index-setting-drawer">
		<el-drawer
			v-model="visible"
			title="个人设置"
			custom-class="text-left"
			:with-header="false"
			direction="rtl">
			<div class="zfile-index-setting-drawer-body">
				<div class="zfile-index-setting-drawer-group" v-if="isMobile">
					<div class="zfile-index-setting-drawer-title">存储源</div>
					<div class="w-full">
						<el-select size="large" class="w-full" v-model="currentStorageKey" placeholder="请选择存储源">
							<el-option v-for="item in storageList"
							           :key="item.key"
							           :label="item.name"
							           :value="item.key">
							</el-option>
						</el-select>
					</div>
				</div>

				<div class="zfile-index-setting-drawer-group">
					<div class="zfile-index-setting-drawer-title">视图</div>
					<div class="zfile-index-setting-drawer-blockCheckbox">
						<el-tooltip
							effect="dark"
							content="列表模式"
							placement="bottom">
							<div class="zfile-index-setting-drawer-item current">
								<SvgIcon name="table-layout"></SvgIcon>
							</div>
						</el-tooltip>
						<el-tooltip
							effect="dark"
							content="图标模式（暂未实现）"
							placement="bottom">
							<div class="zfile-index-setting-drawer-item">
								<SvgIcon name="card-layout"></SvgIcon>
							</div>
						</el-tooltip>
					</div>
					<div class="px-2.5">
						<el-slider size="large" :show-tooltip="false" :marks="marks" v-model="zfileSettingCache.view.size" :step="1" :min="1" :max="3" show-stops />
					</div>
				</div>

				<!--<div class="zfile-index-setting-drawer-group">-->
				<!--	<div class="zfile-index-setting-drawer-title">信息</div>-->
				<!--	<div class="zfile-index-setting-drawer-blockCheckbox">-->
				<!--		<el-tooltip-->
				<!--			effect="dark"-->
				<!--			content="显示文件信息（暂未实现）"-->
				<!--			placement="bottom">-->
				<!--			<div class="zfile-index-setting-drawer-item current">-->
				<!--				<SvgIcon name="info"></SvgIcon>-->
				<!--			</div>-->
				<!--		</el-tooltip>-->
				<!--	</div>-->
				<!--</div>-->

				<div class="zfile-index-setting-drawer-group">
					<div class="zfile-index-setting-drawer-title">画廊</div>
					<div class="text-gray-400 text-sm">如已处于画廊模式，需重新启用画廊模式生效.</div>
					<div class="flex justify-between">
						<div class="text-lg font-medium">图片列数</div>
						<el-input-number v-model="zfileSettingCache.gallery.column" :min="1"></el-input-number>
					</div>
					<div class="flex justify-between">
						<div class="text-lg font-medium">列间距</div>
						<el-input-number v-model="zfileSettingCache.gallery.columnSpacing" :min="0"></el-input-number>
					</div>
					<div class="flex justify-between">
						<div class="text-lg font-medium">行间距</div>
						<el-input-number v-model="zfileSettingCache.gallery.rowSpacing" :min="0"></el-input-number>
					</div>
					<div class="flex justify-between">
						<div class="text-lg font-medium">图片是否带圆角边框</div>
						<el-switch v-model="zfileSettingCache.gallery.roundedBorder"></el-switch>
					</div>
					<div class="flex justify-between">
						<div class="text-lg font-medium">显示名称</div>
						<el-switch v-model="zfileSettingCache.gallery.showInfo"></el-switch>
					</div>
					<div class="flex justify-between">
						<div class="text-lg font-medium">名称显示模式</div>
						<el-select class="w-[150px]" v-model="zfileSettingCache.gallery.showInfoMode">
							<el-option label="悬浮显示" value="hover"></el-option>
							<el-option label="底部显示" value="bottom"></el-option>
						</el-select>
					</div>
					<div class="flex justify-between">
						<div class="text-lg font-medium">双击预览模式</div>
						<el-select class="w-[150px]" v-model="zfileSettingCache.imagePreview.mode">
							<el-option label="显示全部" value="full"></el-option>
							<el-option label="显示单张" value="only"></el-option>
						</el-select>
					</div>
          <div class="flex justify-between">
            <div class="text-lg font-medium">点击放大预览</div>
            <el-switch v-model="zfileSettingCache.imagePreview.gallery"></el-switch>
          </div>
          <div class="flex justify-between">
            <div class="text-lg font-medium">回到顶部按钮</div>
            <el-switch v-model="zfileSettingCache.gallery.showBackTop"></el-switch>
          </div>
				</div>
				<div class="text-gray-400 text-sm mt-10">
					Tips: 设置会自动保存，刷新后仍有效.
				</div>
			</div>
		</el-drawer>
	</div>
</template>

<script setup>
import useSetting from "~/composables/header/useSetting";
const { visible, zfileSettingCache } = useSetting();

import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

const marks = reactive({
	1: '小',
	2: '中',
	3: '大'
})

const viewSizeMap = {
	1: 'small',
	2: 'default',
	3: 'large'
};

watch(() => zfileSettingCache.value, (value) => {
	globalConfigStore.zfileConfig.gallery.column = value.gallery.column;
	globalConfigStore.zfileConfig.gallery.columnSpacing = value.gallery.columnSpacing;
	globalConfigStore.zfileConfig.gallery.rowSpacing = value.gallery.rowSpacing;
	globalConfigStore.zfileConfig.gallery.showInfo = value.gallery.showInfo;
	globalConfigStore.zfileConfig.gallery.showInfoMode = value.gallery.showInfoMode;
	globalConfigStore.zfileConfig.gallery.roundedBorder = value.gallery.roundedBorder;
  globalConfigStore.zfileConfig.gallery.showBackTop = value.gallery.showBackTop;

	if (value?.view?.size) {
		storageConfigStore.globalConfig.tableSize = viewSizeMap[value.view.size];
	}

	if (!storageConfigStore.globalConfig.tableSize) {
		storageConfigStore.globalConfig.tableSize = 'defualt';
	}

	if (value?.imagePreview?.mode) {
		globalConfigStore.zfileConfig.imagePreview.mode = value.imagePreview.mode;
	}
  globalConfigStore.zfileConfig.imagePreview.gallery = value.imagePreview.gallery;
}, {
	immediate: true,
	deep: true
});

let router = useRouter();
let route = useRoute();

import useCommon from "~/composables/useCommon";
const { isMobile } = useCommon();

import useHeaderStorageList from "~/composables/header/useHeaderStorageList";
const { currentStorageKey, storageList } = useHeaderStorageList();


</script>

<style lang="scss" scoped>

.zfile-index-setting-drawer {

	// 自适应宽度
	:deep(.el-drawer) {
		@apply w-[90%] sm:w-6/12 md:w-5/12 lg:w-4/12 xl:w-3/12 #{!important};
	}

	.zfile-index-setting-drawer-body {
		@apply space-y-16 px-1.5;

		// 分组
		.zfile-index-setting-drawer-group {
			@apply space-y-8;
			&:first-child {
				@apply space-y-3;
			}

			// 标题
			.zfile-index-setting-drawer-title {
				@apply text-2xl font-medium text-black;
			}

			// 块状 checkbox 单选
			.zfile-index-setting-drawer-blockCheckbox {
				@apply space-x-6 flex;

				.zfile-index-setting-drawer-item {
					@apply hover:bg-gray-50 rounded-lg cursor-pointer;
					svg {
						@apply w-12 h-12 p-3;
					}
				}
				.zfile-index-setting-drawer-item.current {
					@apply border border-gray-200;
					svg {
						@apply text-blue-500;
					}
				}
			}
		}
	}
}

</style>