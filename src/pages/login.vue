<template>
	<div class="h-full min-h-screen bg-gray-100 text-gray-900 flex justify-center items-center">
		<div class="h-full lg:h-auto max-w-screen-lg bg-white shadow-xl sm:rounded-xl flex flex-1">
			<div class="flex-1 bg-gray-50 text-center hidden lg:flex rounded-l-xl">
				<div class="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat zfile-login-logo" />
			</div>
			<div class="w-full lg:w-1/2 xl:w-1/2 mt-10 p-6 sm:p-12">
				<div class="mt-0 flex flex-col items-center">
					<a href="https://github.com/zfile-dev/zfile" target="_blank" class="text-2xl mt-0 xl:text-3xl font-extrabold box animate__animated animate__fadeInDown">
						<img class="w-16 cursor-pointer" src="../assets/icons/zfile-basic.svg" />
					</a>
					<div class="w-full flex-1">
						<div class="my-12 relative">
							<div class="absolute inset-0 flex items-center" aria-hidden="true">
								<div class="w-full border-t text-gray-600" />
							</div>
							<div class="relative flex justify-center text-sm">
								<span class="px-2 bg-white text-sm leading-none text-gray-600 tracking-wide font-medium">
									登录
								</span>
							</div>
						</div>

						<el-form :rules="formRules" :model="formData" ref="loginFormRef"
								 class="zfile-login-form" size="large" @submit.native.prevent>
							<el-form-item class="box animate__animated animate__fadeInUp" prop="username">
								<el-input placeholder="账号" :prefix-icon="UserIcon" v-model.trim="formData.username"
										  @input="loadLoginVerifyMode" @change="loadLoginVerifyMode" />
							</el-form-item>

							<el-form-item class="box animate__animated animate__fadeInUp" prop="password">
								<el-input placeholder="密码" type="password" show-password :prefix-icon="KeyIcon"
										  v-model.trim="formData.password" />
							</el-form-item>

							<el-form-item v-if="loginVerifyMode === '2fa'"
										  class="box animate__animated animate__fadeInUp" prop="verifyCode">
								<el-input placeholder="双因素认证验证码" :prefix-icon="CheckIcon"
										  v-model.trim="formData.verifyCode" />
							</el-form-item>

							<el-form-item v-else-if="loginVerifyMode === 'image'"
										  class="box animate__animated animate__fadeInUp" prop="verifyCode">
								<div class="flex space-x-5 w-full">
									<el-input class="flex-1" placeholder="请输入验证码" :prefix-icon="PhotoIcon"
											  v-model.trim="formData.verifyCode" />
									<el-image :src="loginVerifyCodeImgData?.imgBase64"
											  @click="loadLoginVerifyCodeImgData()"></el-image>
								</div>
							</el-form-item>

							<el-form-item class="box animate__animated animate__fadeInUp">
								<div class="flex justify-between w-full">
                  <el-checkbox v-model="remember" label="记住密码" />
                  <el-tooltip class="item" effect="dark" placement="left">
                    <template #content>
                      <div>
                        将配置文件 application.properties 中 zfile.debug 修改为 true, 重启后访问首页即可重置密码
                        <br>
                        <a target="_blank" class="text-blue-400" href="https://docs.zfile.vip/config/config-debug">
                          点击可前往文档查看操作方式
                        </a>
                      </div>
                    </template>
                    <el-link :icon="QuestionMarkCircleIcon" :underline="false">忘记密码</el-link>
                  </el-tooltip>
                </div>
							</el-form-item>

							<el-form-item>
								<el-button :loading="loading" autofocus class="w-full mb-0" native-type="submit" type="primary" :icon="CheckBadgeIcon" @click="submitForm">
									登录
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
import { checkLoginReq, loginReq, loginVerifyImgReq, loginVerifyModeReq } from "~/api/home/user";

import { CheckBadgeIcon, QuestionMarkCircleIcon } from "@heroicons/vue/24/solid";
import { PhotoIcon, UserIcon, KeyIcon, CheckIcon } from "@heroicons/vue/24/outline";
import { installStatusReq } from "~/api/home/install";

let router = useRouter();
let loading = ref(false);

const rememberStorage = useStorage('zfile-login-storage', {
  remember: false,
  username: '',
  password: ''
});
const remember = ref(rememberStorage.value.remember);

let loginFormRef = ref();

let formData = ref({
  username: rememberStorage.value.username,
  password: rememberStorage.value.password,
	verifyCode: "",
	verifyCodeUUID: ""
});



let formRules = ref({
	username: [
		{ required: true, message: "账号不能为空", trigger: ["change", "blur"] }
	],
	password: [
		{ required: true, message: "密码不能为空", trigger: ["change", "blur"] }
	]
});

const submitForm = () => {
	loginFormRef.value.validate((checked) => {
		if (checked) {
			loading.value = true;
			loginReq(formData.value).then((response) => {
				let token = response.data.token;
				let isAdmin = response.data.admin;

        if (remember.value) {
          rememberStorage.value.username = formData.value.username;
          rememberStorage.value.password = formData.value.password;
          rememberStorage.value.remember = true;
        } else {
          rememberStorage.value.username = '';
          rememberStorage.value.password = '';
          rememberStorage.value.remember = false;
        }

				window.localStorage.setItem("zfile-token", token);
				ElMessage({
					message: "登录成功",
					type: "success",
					duration: 1000,
					onClose() {
						if (isAdmin) {
							let redirect = router.currentRoute.value.query.redirect;
							router.push(redirect ? redirect : "/admin");
						} else {
							router.push("/");
						}
					}
				});
			}).catch(() => {
				loading.value = false;
				loadLoginVerifyCodeImgData();
			});
		} else {
			ElMessage.warning("请输入账号密码!");
		}
	});
};

const loginVerifyMode = ref("");

const loadLoginVerifyMode = () => {
	loginVerifyModeReq(formData.value.username).then((res) => {
		let oldLoginVerifyMode = loginVerifyMode.value;
		loginVerifyMode.value = res.data;
		if (oldLoginVerifyMode !== "image" && loginVerifyMode.value === "image") {
			loadLoginVerifyCodeImgData();
		}
	});
};


const loginVerifyCodeImgData = ref({});

const loadLoginVerifyCodeImgData = () => {
	loginVerifyImgReq().then((res) => {
		loginVerifyCodeImgData.value = res.data;
		formData.value.verifyCodeUUID = res.data.uuid;
	});
};


onMounted(() => {
	installStatusReq().then((response) => {
		if (!response.data) {
			router.push("/install");
		}
	});

	// 如果已登录, 则自动跳转到 admin.
	checkLoginReq().then((response) => {
		let isLogin = response.data.isLogin;
		let isAdmin = response.data.isAdmin;
		if (isLogin && isAdmin) {
			router.push("/admin");
		}
	});

	loadLoginVerifyMode();
});
</script>

<style lang="scss" scoped>

.zfile-login-logo {
	background-image: url('~/assets/icons/admin-login.svg');
}

.zfile-login-form {
	:deep(.el-form-item--large) {
		margin-bottom: 30px;

		&:last-child {
			margin-bottom: 0;
		}
	}

	--zfile-login-input-height: 45px;

	:deep(.el-input__inner) {
		height: var(--zfile-login-input-height);
	}

	:deep(.el-button--large) {
		--el-button-size: var(--zfile-login-input-height);
		height: var(--el-button-size);
	}

	// 防止谷歌浏览器记住密码后样式错乱
	:deep(.el-input input) {
		box-shadow: 0 0 0 1000px white inset;
	}
}
</style>