<template>
	<div class="h-full min-h-screen bg-gray-100 text-gray-900 flex justify-center items-center">
		<div class="h-full lg:h-auto max-w-screen-lg bg-white shadow-xl sm:rounded-xl flex flex-1">
			<div class="flex-1 bg-gray-50 text-center hidden lg:flex rounded-l-xl">
				<div class="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat zfile-install-logo"/>
			</div>
			<div class="w-full lg:w-1/2 xl:w-1/2 mt-10 p-6 sm:p-12">
				<div class="mt-0 flex flex-col items-center">
					<h1 class="text-2xl mt-0 xl:text-3xl font-extrabold box animate__animated animate__fadeInDown">
						<img class="w-16 cursor-pointer"
						     @click="openLink('https://github.com/zhaojun1998/zfile')"
						     src="../../assets/icons/zfile-basic.svg"/>
					</h1>
					<div class="w-full flex-1">

            <div class="my-12 relative">
              <div class="absolute inset-0 flex items-center" aria-hidden="true">
                <div class="w-full border-t text-gray-600" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-sm leading-none text-gray-600 tracking-wide font-medium">系统初始化</span>
              </div>
            </div>

						<el-form @submit.native.prevent ref="installFormRef" :rules="formRules" :model="formData"
						         class="zfile-install-form" size="large">
							<el-form-item class="box animate__animated animate__fadeInUp" prop="siteName">
								<el-input placeholder="站点名称" :prefix-icon="Tickets" v-model="formData.siteName"/>
							</el-form-item>

							<el-form-item class="box animate__animated animate__fadeInUp" prop="username">
								<el-input placeholder="管理员账号" :prefix-icon="User" v-model.trim="formData.username"/>
							</el-form-item>

							<el-form-item class="box animate__animated animate__fadeInUp" prop="password">
								<el-input placeholder="管理员密码" type="password" show-password :prefix-icon="Key" v-model.trim="formData.password"/>
							</el-form-item>

							<el-form-item class="box animate__animated animate__fadeInUp" prop="domain">
								<el-input placeholder="站点地址/域名" :prefix-icon="Link" v-model.trim="formData.domain"/>
							</el-form-item>

							<el-form-item>
								<el-button native-type="submit"
								           :loading="loading"
								           class="w-full" type="primary" :icon="BadgeCheckIcon"
								           @click="submitForm">
									系统初始化
								</el-button>
							</el-form-item>
						</el-form>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import {installReq, installStatusReq} from '~/api/install'

import {Key, Link, Tickets, User} from '@element-plus/icons-vue'
import {BadgeCheckIcon} from '@heroicons/vue/solid'
import useGlobalConfigStore from "~/stores/global-config";

let router = useRouter();

let loading = ref(false);
let installFormRef = ref();

let formData = reactive({
	siteName: '',
	username: '',
	password: '',
	domain: ''
});

let formRules = ref({
	siteName: [
		{required: true, message: '请输入站点名称', trigger: ['change', 'blur']},
	],
	username: [
		{required: true, message: '请输入管理员账号', trigger: ['change', 'blur']},
	],
	password: [
		{required: true, message: '请输入管理员密码', trigger: ['change', 'blur']},
	],
	domain: [
		{required: true, message: '请输入正确的域名，需以 http:// 或 https:// 开头', trigger: 'change'},
	]
});

const openLink = (link) => {
	window.open(link)
}

const submitForm = async () => {
	await installFormRef.value.validate((checked) => {
		if (checked) {
			loading.value = true;
			installReq(formData).then((response) => {
				ElMessage({
					message: "初始化成功",
					type: response.code === 0 ? 'success' : 'error',
					duration: 1500,
					onClose() {
						router.push('/')
					}
				});
			}).finally(() => {
				loading.value = false;
			})
		} else {
			ElMessage.warning("请正确输入初始化值!")
		}
	})
}

onBeforeMount(() => {
	const globalConfigStore = useGlobalConfigStore();
	formData.domain = globalConfigStore.zfileConfig.baseUrl || window.location.origin;
	installStatusReq().then((response) => {
		if (response.data) {
			router.push('/')
		}
	});
})

</script>

<style lang="scss" scoped>

.zfile-install-logo {
	background-image: url('~/assets/icons/install-step.svg');
}

.zfile-install-form {
	--zfile-install-input-height: 45px;

	:deep(.el-input__inner) {
		height: var(--zfile-install-input-height);
	}

	:deep(.el-button--large) {
		--el-button-size: var(--zfile-install-input-height);
		height: var(--el-button-size);
	}

	// 防止谷歌浏览器记住密码后样式错乱
	:deep(input:-internal-autofill-selected) {
		-webkit-text-fill-color: var(--el-input-text-color, var(--el-text-color-regular));
		transition: background-color 1000s ease-out 0.5s;
	}
}
</style>