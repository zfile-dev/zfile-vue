<template>
	<el-dialog v-model="isShow" :destroy-on-close="true"
	           @close="closeDialog"
	           :title="props.title"
	           :show-close="false"
	           draggable
	           top="5vh"
	           width="80%">
		<v-md-editor v-model="readmeText" height="70vh"></v-md-editor>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="closeDialog">取消</el-button>
				<el-button type="primary" @click="saveDialog">保存</el-button>
			</span>
		</template>
	</el-dialog>
</template>


<script setup>

// markdown editor 组件懒加载, 节约首屏打开时间
const VMdEditor = defineAsyncComponent(() => {
	return new Promise((resolve, reject) => {
		;(async function () {
			try {
				const res = await import('@kangc/v-md-editor')
				await import('@kangc/v-md-editor/lib/style/base-editor.css');
				await import('@kangc/v-md-editor/lib/theme/style/vuepress.css');

				const vuepressTheme = await import('@kangc/v-md-editor/lib/theme/vuepress.js');
				const Prism = await import('prismjs');

				res.use(vuepressTheme, {
					Prism,
				});

				resolve(res)
			} catch (error) {
				reject(error)
			}
		})()
	})
})


const readmeText = ref('');
const isShow = true;

const props = defineProps({
	visible: {
		type: Boolean,
		required: true
	},
	title: {
		type: String,
		default: '',
	},
	modelValue: {
		type: String,
		default: '',
	}
});

const emit = defineEmits(['update:modelValue', 'update:visible'])

onMounted(() => {
	readmeText.value = props.modelValue;
})

const closeDialog = () => {
	emit('update:visible', false);
}

const saveDialog = () => {
	emit('update:modelValue', readmeText.value)
	emit('update:visible', false)
}
</script>


<style lang="scss" scoped>

</style>