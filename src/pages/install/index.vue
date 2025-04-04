<template>
	<div class="h-full min-h-screen bg-gray-100 text-gray-900 flex justify-center items-center">
		<div class="h-full lg:h-auto max-w-screen-lg bg-white shadow-xl sm:rounded-xl flex flex-1">
			<div class="flex-1 bg-gray-50 text-center hidden lg:flex rounded-l-xl">
				<div class="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat zfile-install-logo" />
			</div>
			<div class="w-full lg:w-1/2 xl:w-1/2 mt-10 p-6 sm:p-12">
				<div class="mt-0 flex flex-col items-center">
					<a href="https://github.com/zfile-dev/zfile" target="_blank" class="text-2xl mt-0 xl:text-3xl font-extrabold box animate__animated animate__fadeInDown">
						<img class="w-16 cursor-pointer" src="../../assets/icons/zfile-basic.svg" />
					</a>
					<div class="w-full flex-1">
						<div class="my-12 relative">
							<div class="absolute inset-0 flex items-center" aria-hidden="true">
								<div class="w-full border-t text-gray-600" />
							</div>
							<div class="relative flex justify-center text-sm">
								<span class="px-2 bg-white text-sm leading-none text-gray-600 tracking-wide font-medium">
									系统初始化
								</span>
							</div>
						</div>
						<el-form :rules="formRules" :model="formData" ref="installFormRef"
								 class="zfile-install-form" size="large" @submit.native.prevent>
							<el-form-item class="box animate__animated animate__fadeInUp" prop="siteName">
								<el-input tabindex="1" v-model="formData.siteName" placeholder="站点名称" :prefix-icon="DocumentTextIcon">
									<template #suffix>
										<el-popover
											placement="left"
											width="300"
											trigger="hover">
											<template #default>
												这里填写站点名称，会显示在网站标题上
											</template>
											<template #reference>
												<QuestionMarkCircleIcon class="inline w-4 ml-1 -mt-0.5" />
											</template>
										</el-popover>
									</template>
								</el-input>
							</el-form-item>

							<el-form-item class="box animate__animated animate__fadeInUp" prop="username">
								<el-input tabindex="2" placeholder="管理员账号" :prefix-icon="UserIcon"
										  v-model.trim="formData.username">
									<template #suffix>
										<el-popover
											placement="left"
											width="300"
											trigger="hover">
											<template #default>
												这里填写初始化管理员账号, 一会用来登录后台
											</template>
											<template #reference>
												<QuestionMarkCircleIcon class="inline w-4 ml-1 -mt-0.5" />
											</template>
										</el-popover>
									</template>
								</el-input>
							</el-form-item>

							<el-form-item class="box animate__animated animate__fadeInUp" prop="password">
								<el-input tabindex="3" placeholder="管理员密码" type="password" show-password :prefix-icon="KeyIcon"
										  v-model.trim="formData.password">
									<template #suffix>
										<el-popover
											placement="left"
											width="300"
											trigger="hover">
											<template #default>
												这里填写初始化管理员密码, 一会用来登录后台
											</template>
											<template #reference>
												<QuestionMarkCircleIcon class="inline w-4 ml-1 -mt-0.5" />
											</template>
										</el-popover>
									</template>
								</el-input>
							</el-form-item>

							<el-form-item>
								<el-button tabindex="4" native-type="submit" :loading="loading" class="w-full" type="primary" :icon="CheckBadgeIcon" @click="submitForm">
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
import { installReq, installStatusReq } from '~/api/home/install'
import { CheckBadgeIcon, KeyIcon, DocumentTextIcon, UserIcon } from '@heroicons/vue/24/outline'
import { QuestionMarkCircleIcon } from "@heroicons/vue/24/solid";
import MessageBox from "~/components/messageBox/messageBox";
import { ElMessage } from "element-plus";

let router = useRouter();

let formData = reactive({
	siteName: '',
	username: '',
	password: ''
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
	]
});

let loading = ref(false);
let installFormRef = ref();
const submitForm = async () => {
	await installFormRef.value.validate((checked) => {
		if (checked) {
			loading.value = true;
			installReq(formData).then(() => {
				MessageBox.confirm('系统初始化成功, 点击确定跳转到登录页面。', '提示', {
				  confirmButtonText: '确定',
				  showCancelButton: false,
				  showCloseButton: false,
				  closeOnClickModal: false,
				  closeOnPressEscape: false,
				  type: 'success'
				}).then(() => {
				  router.push('/login')
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