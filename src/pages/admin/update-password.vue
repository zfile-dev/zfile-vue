<template>
	<z-form :model="passwordData"
	        v-loading="updateLoading"
	        :rules="passwordDataRules" ref="updatePasswordForm">
		<template #form-title>
			密码信息
		</template>
		<template #form-sub-title>
			此处可以修改您的管理员登录账号密码，请妥善保管
		</template>

		<z-form-item prop="username" label="管理员账号">
			<el-input id="username" :prefix-icon="User" v-model.trim="passwordData.username"/>
		</z-form-item>

		<z-form-item prop="password" label="新密码">
			<el-input id="password" :prefix-icon="Key" v-model.trim="passwordData.password"/>
		</z-form-item>

		<z-form-item prop="repassword" label="重复新密码">
			<el-input id="repassword" :prefix-icon="Key" v-model.trim="passwordData.repassword"/>
		</z-form-item>

		<template #footer>
			<el-button type="primary" size="default" :icon="BadgeCheckIcon" @click="submitForm">保存设置</el-button>
		</template>
	</z-form>
</template>

<script setup>
import {User, Key} from "@element-plus/icons-vue";
import {BadgeCheckIcon} from '@heroicons/vue/solid'

import usePassword from "~/composables/admin/password/usePassword";
const { passwordData, updateLoading, updatePassword, passwordDataRules } = usePassword();

let updatePasswordForm = ref();

const submitForm = () => {
	updatePassword(updatePasswordForm);
}
</script>

<style scoped>
</style>

<route lang="yaml">
meta:
  layout: admin
  name: 直链管理
</route>