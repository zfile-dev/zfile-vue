<template>
	<z-form :model="data"
	        v-if="data"
	        v-loading="saveLoading">
		<template #form-title>
			安全设置
		</template>
		<template #form-sub-title>
			此处设置可保护您的站点安全
		</template>

		<z-form-item label="是否显示登录入口">
			<el-switch v-model="data.showLogin"></el-switch>
			<template #tips>
				启用后，会在门户显示后台登录入口，请根据自身情况选择是否启用
			</template>
		</z-form-item>

		<z-form-item label="登录验证方式">
			<el-radio v-model="data.loginVerifyMode" label="off">不启用登录验证</el-radio>
			<el-radio v-model="data.loginVerifyMode" label="image">启用图片验证码</el-radio>
			<el-radio v-model="data.loginVerifyMode" label="2fa">启用双因素认证</el-radio>

			<template #tips v-if="data.loginVerifyMode === 'image'">
				图片验证码也可能会被识别，不能完全抵挡暴力破解。
			</template>
			<template #tips v-if="data.loginVerifyMode === '2fa'">
				双因素认证可完美保护登录认证，可使用任意支持 2FA 认证的软件，如 <b>Google 身份验证器</b>、<b>Microsoft Authenticator</b> 等软件.
				<br>
			</template>
		</z-form-item>

		<z-form-item label="双因素认证密钥" v-if="data.loginVerifyMode === '2fa'">
			<div class="w-full" v-if="data.loginVerifySecret">
				<el-button size="small" type="primary" @click="rebind">重新绑定</el-button>
				<el-button size="small" type="primary" @click="cancelBind">取消绑定</el-button>
				<el-button size="small" type="primary" @click="validBind">验证绑定</el-button>
			</div>
			<div v-else>
				<el-image @click="load2FAInfo" :src="twoFAData?.qrcode"></el-image>
				<el-input readonly v-model="twoFAData.secret">
					<template #append>
						<el-tooltip class="item" effect="dark" content="复制" placement="bottom">
							<el-button @click="copyTwoFASecret" :icon="CopyDocument"></el-button>
						</el-tooltip>
					</template>
				</el-input>
			</div>
			<template #tips v-if="!data.loginVerifySecret">
				可扫描上方二维码或复制下方密钥到支持双因素认证的软件中添加。
			</template>
		</z-form-item>

		<z-form-item label="双因素认证验证码" v-if="data.loginVerifyMode === '2fa' && !data.loginVerifySecret">
			<el-input v-model="twoFAData.code">
			</el-input>
			<el-button @click="verifyCodeAndBind" type="primary">验证并绑定</el-button>
			<template #tips>
				请绑定双因素认证软件后，输入显示的验证码进行绑定
			</template>
		</z-form-item>
	</z-form>
</template>

<script setup>
import { CopyDocument } from '@element-plus/icons-vue';
import useSecuritySetting from "~/composables/admin/scurity/useSecuritySetting";
const {
	data, saveData, saveLoading,
	load2FAInfo, twoFAData, copyTwoFASecret, verifyCodeAndBind,
	rebind, cancelBind, validBind
} = useSecuritySetting();


watch(() => data.value?.loginVerifyMode, (value, oldValue) => {
	// 如果切换到了 off 或 image, 则直接保存, oldValue 有值表示是切换过来的.
	if ((value === 'off' || value === 'image') && oldValue) {
		saveData();
	}

	// 如果选中了 2FA, 但没有绑定过, 则加载 2FA 密钥.
	if (value === '2fa' && !data.value.loginVerifySecret) {
		load2FAInfo();
	}
})


watch(() => data.value?.showLogin, (value, oldValue) => {
	if (value !== oldValue && oldValue !== undefined) {
		saveData();
	}
})

</script>

<style lang="scss" scoped>
.el-button {
	height: 35px;
}
.el-input {
	:deep(input) {
		height: 35px;
	}
}
</style>

<route lang="yaml">
meta:
  layout: admin
  name: 基本设置
</route>