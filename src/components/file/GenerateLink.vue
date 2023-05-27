<template>
	<el-dialog title="生成短链" v-model="generateLinkDialogVisible" width="40%" top="20vh">
		<el-form @submit.navite.prevent label-width="130px" :model="generateLinkFormData">
			<el-form-item label="选中的文件">
        <el-tag type="success">{{ selectRows.length }} 个</el-tag>
			</el-form-item>
			<el-form-item label="直链有效期">
        <el-select v-model="generateLinkFormData.expireTime" placeholder="请选择直链有效期">
          <el-option
            v-for="item in linkExpireTimesJson"
            :key="item.seconds"
            :label="(item.unit === 'forever' ? '' : item.value) + ' ' + timeUnits[item.unit]"
            :value="item.seconds">
          </el-option>
        </el-select>
      </el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="generateLinkDialogVisible = false">取 消</el-button>
			<el-button type="primary" @click="submitGenerateLinkForm" :loading="generateLinkLoading">确 定</el-button>
		</template>
	</el-dialog>
</template>

<script setup>
import { timeUnits } from "~/tool/unit";

import useFileLink from "~/composables/file/useFileLink";
let { generateLinkDialogVisible, generateLinkFormData, generateLinkLoading, submitGenerateLinkForm } = useFileLink();

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

import useFileSelect from "~/composables/file/useFileSelect";
let { selectRows } = useFileSelect();

let linkExpireTimesJson = JSON.parse(storageConfigStore.globalConfig.linkExpireTimes);
generateLinkFormData.expireTime = linkExpireTimesJson[0].seconds;
</script>

<style scoped>

</style>
