<template>
	<div class="zfile-file-download-link-body" v-if="visible">
		<el-dialog v-model="visible" :destroy-on-close="true"
		           @close="visible = false"
		           title="生成直链"
		           :custom-class="selectFiles.length > 1 ? 'zfile-file-download-link-dialog-multiple' : 'zfile-file-download-link-dialog-single'"
		           draggable
		           top="5vh">
			<el-table class="zfile-download-link-table" :max-height="height * 0.7" :data="datas" v-if="selectFiles.length > 1">
				<el-table-column
				                 show-tooltip-when-overflow
				                 label="文件名">
					<template #default="scope">
						{{ scope.row.row.name }}
					</template>
				</el-table-column>
				<el-table-column show-overflow-tooltip>
					<template #header="scope">
						直链
						<el-tooltip
							:show-arrow="false"
							:offset="15"
							effect="dark"
							content="批量复制到剪贴板"
							placement="top">
							<svg-icon @click="batchCopyLink" class="inline cursor-pointer l-5" name="copy"></svg-icon>
						</el-tooltip>
					</template>
					<template #default="scope">
						{{ scope.row.directlink }}
					</template>
				</el-table-column>
				<el-table-column show-overflow-tooltip width="250">
					<template #header="scope">
						短链
						<el-tooltip
							:show-arrow="false"
							:offset="15"
							effect="dark"
							content="批量复制到剪贴板"
							placement="top">
							<svg-icon @click="batchCopyShortLink" class="inline cursor-pointer l-5" name="copy"></svg-icon>
						</el-tooltip>
					</template>
					<template #default="scope">
						{{ scope.row.link }}
					</template>
				</el-table-column>
			</el-table>
			<el-row class="space-y-6" v-if="selectFiles.length === 1 && data">
				<div class="flex flex-row space-x-10">
					<el-image ref="qrcodeRef" class="w-3/4" :src="data.currentImg"/>
					<div class="flex flex-col mt-3 space-y-3.5 overflow-y-auto">
						<div class="border w-10 h-10 p-1 rounded-md cursor-pointer"
						     @click="data.currentImg = data.img.a1"
						     :class="data.currentImg === data.img.a1 ? 'border-blue-400' : ''">
							<el-image class="w-full h-full" :src="data.img.a1"/>
						</div>
						<div class="border w-10 h-10 p-1 rounded-md cursor-pointer"
						     @click="data.currentImg = data.img.a2"
						     :class="data.currentImg === data.img.a2 ? 'border-blue-400' : ''">
							<el-image class="w-full h-full" :src="data.img.a2"/>
						</div>
						<div class="border w-10 h-10 p-1 rounded-md cursor-pointer"
						     @click="data.currentImg = data.img.sp1"
						     :class="data.currentImg === data.img.sp1 ? 'border-blue-400' : ''">
							<el-image class="w-full h-full" :src="data.img.sp1"/>
						</div>
						<div class="border w-10 h-10 p-1 rounded-md cursor-pointer"
						     @click="data.currentImg = data.img.aa1"
						     :class="data.currentImg === data.img.aa1 ? 'border-blue-400' : ''">
							<el-image class="w-full h-full" :src="data.img.aa1"/>
						</div>
						<div class="border w-10 h-10 p-1 rounded-md cursor-pointer"
						     @click="data.currentImg = data.img.ab2"
						     :class="data.currentImg === data.img.ab2 ? 'border-blue-400' : ''">
							<el-image class="w-full h-full" :src="data.img.ab2"/>
						</div>
					</div>
				</div>
				<div class="w-full">
					<el-form>
						<el-form-item>
							<el-input readonly :prefix-icon="Document" v-model="data.row.name"></el-input>
						</el-form-item>
						<el-form-item>
							<el-input readonly :prefix-icon="Calendar" v-model="data.row.time"></el-input>
						</el-form-item>
						<el-form-item>
							<el-input readonly :prefix-icon="Coin" v-model="data.row.size"></el-input>
						</el-form-item>
						<el-form-item v-if="storageConfigStore.config.showLinkBtn && storageConfigStore.config.showPathLink">
							<el-tooltip append-to=".zfile-file-download-link-body"
							            popper-class="zfile-link-tips"
							            placement="left" content="路径直链地址，包含文件完整路径.">
								<el-input @click="copyText(data.directlink)" :prefix-icon="Link" type="small" v-model="data.directlink">
								</el-input>
							</el-tooltip>
						</el-form-item>
						<el-form-item v-if="storageConfigStore.config.showLinkBtn && storageConfigStore.config.showShortLink">
							<el-tooltip append-to=".zfile-file-download-link-body"
							            popper-class="zfile-link-tips"
							            placement="left" content="缩短版直链地址，便于复制分发.">
								<el-input @click="copyText(data.link)" :prefix-icon="Link" type="small" v-model="data.link">
								</el-input>
							</el-tooltip>
						</el-form-item>
					</el-form>
				</div>
			</el-row>

			<template #footer>
				<el-button type="primary" @click="exportExcel">导出</el-button>
				<el-button type="info" @click="visible = false">关闭</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup>
import { Calendar, Coin, Link, Document } from '@element-plus/icons-vue';

// 组件传参及回写
const props = defineProps({
	rowData: {
		type: Object
	}
});

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

let router = useRouter();
let route = useRoute();

import useFileLink from "~/composables/file/useFileLink";
let { visible, copyText, data, datas, loadRowLinkData } = useFileLink(router, route);

import useFileData from "~/composables/file/useFileData";
let { selectFiles } = useFileData(router, route);

watch(() => visible.value, (value) => {
	if (value) {
		if (selectFiles.value.length === 0) {
			ElMessage.warning('请至少选择一个文件');
		} else {
			selectFiles.value.forEach((item) => {
				loadRowLinkData(item);
			})
		}
	} else {
		datas.value = [];
	}
})


const batchCopyShortLink = () => {
	let links = [];
	datas.value.forEach((item) => {
		links.push(item.link);
	})
	copyText(links.join('\n'));
}

const batchCopyLink = () => {
	let links = [];
	datas.value.forEach((item) => {
		links.push(item.directlink);
	})
	copyText(links.join('\n'));
}

import useCommon from "~/composables/useCommon";
const { height } = useCommon();

import FileSaver from 'file-saver'
import { utils, write } from 'xlsx'

const exportExcel = () => {
	let xlsxParam = { raw: true }
	// 设置当前日期
	let time = new Date()
	let year = time.getFullYear()
	let month = time.getMonth() + 1
	let day = time.getDate()
	let name = year + '' + month + '' + day
	/* generate workbook object from table */
	//  .excelTable要导出的是哪一个表格   注意这里的 excelTable 是要导出的表格的类名
	let wb = utils.table_to_book(document.querySelector('.zfile-download-link-table'), xlsxParam)

	let colsWidth = [{ wch: 50 }, { wch: 50 }, { wch: 50 }];
	datas.value.forEach((item) => {
		let col1Length = item.row.name.length;
		let col2Length = item.directlink.length;
		let col3Length = item.link.length;

		if (col1Length > colsWidth[0].wch) {
			colsWidth[0].wch = col1Length;
		}
		if (col2Length > colsWidth[1].wch) {
			colsWidth[1].wch = col2Length + 20;
		}
		if (col3Length > colsWidth[2].wch) {
			colsWidth[2].wch = col3Length;
		}
	});

	wb.Sheets.Sheet1["!cols"] = colsWidth;

	console.log(colsWidth);

	/* get binary string as output */
	let wbout = write(wb, {
		bookType: 'xlsx',
		bookSST: true,
		type: 'array'
	})
	try {
		//  name+'.xlsx'表示导出的excel表格名字
		FileSaver.saveAs(
			new Blob([wbout], { type: 'application/octet-stream' }),
			name + 'ZFile 直链导出.xlsx'
		)
	} catch (e) {
		if (typeof console !== 'undefined') {
			// console.log(e, wbout)
			ElMessage.error(e + wbout);
		}
	}
	return wbout
}

</script>

<style scoped lang="scss">
.zfile-file-download-link-body {

	:deep(.zfile-file-download-link-dialog-single) {
		@apply w-10/12 md:w-96;
	}

	:deep(.zfile-file-download-link-dialog-multiple) {
		@apply w-10/12;
	}

	:deep(.zfile-link-tips) {
		@apply hidden md:block;
	}
}
</style>