<template>
  <el-form :model="siteSetting"
           v-if="siteSetting"
           :label-width="globalConfigStore.adminForm.labelWidth"
           :label-position="globalConfigStore.adminForm.labelPosition"
           :size="globalConfigStore.adminForm.size"
           scroll-to-error
           status-icon
           class="z-admin-form"
           v-loading="saveLoading">

    <admin-form-header title="安全设置" sub-title="此处设置可保护您的站点安全" />

    <el-form-item label="是否显示登录入口">
      <el-switch v-model="siteSetting.showLogin"></el-switch>
      <div class="el-form-item-tips">
        启用后，会在首页上方工具栏显示后台登录入口，请根据自身情况选择是否启用。(这里只是控制是否显示，直接访问登录页 URL: <span class="text-blue-400">{{currentLocale}}/login</span> 也能访问)
      </div>
    </el-form-item>

    <el-form-item label="匿名用户首页显示">
        <el-input type="textarea" :rows="8" v-model="siteSetting.guestIndexHtml"></el-input>
        <div class="el-form-item-tips">
          可填写 html 代码，用于强制匿名用户访问首页时显示的内容，留空则显示默认首页内容。<br>
            如强制跳转到登录页，可填写 <code class="code select-all">&lt;script&gt;location.href = '/login';&lt;/script&gt;</code>
	        <br>
	        <span class="text-red-400">注意：如果你网站配置了防火墙，可能会被当成恶意请求拦截而保存失败。</span>
        </div>
    </el-form-item>

    <el-form-item label="登录日志模式">
      <el-radio-group v-model="siteSetting.loginLogMode">
        <el-radio value="off">关闭</el-radio>
        <el-radio value="all">全部记录</el-radio>
        <el-radio value="ignoreSuccessPwd">不记录成功密码</el-radio>
        <el-radio value="ignoreAllPwd">不记录密码</el-radio>
      </el-radio-group>
      <div class="el-form-item-tips">
        启用图片验证码可以防止批量恶意登录，但将密码设置为高强度才是最有效的防止恶意登录的方法。
      </div>
    </el-form-item>

    <el-form-item label="是否启用图片验证码">
      <el-switch v-model="siteSetting.loginImgVerify"></el-switch>
      <div class="el-form-item-tips">
        启用图片验证码可以防止批量恶意登录，但将密码设置为高强度才是最有效的防止恶意登录的方法。
      </div>
    </el-form-item>

		<el-form-item label="是否启用管理员双因素认证">
      <el-switch v-model="siteSetting.adminTwoFactorVerify" @change="adminTwoFactorVerifyOnChange"></el-switch>
      <div class="el-form-item-tips">
        双因素认证可完美保护登录认证，可使用任意支持 2FA 认证的软件，如 <b>Google 身份验证器</b>、<b>Microsoft Authenticator</b> 等软件.（仅适用于管理员登录，不影响其他用户登录。）
      </div>
			<div class="w-full" v-if="siteSetting.adminTwoFactorVerify && siteSetting.loginVerifySecret">
				<el-button type="primary" @click="rebind">重新绑定</el-button>
				<el-button type="primary" @click="cancelBind">取消绑定</el-button>
				<el-button type="primary" @click="validBind">验证绑定</el-button>
			</div>
		</el-form-item>

	  <el-form-item class="admin-from-footer">
		  <el-button class="ml-auto" type="primary" :icon="CheckBadgeIcon" @click="beforeSave">保存设置</el-button>
	  </el-form-item>
	</el-form>

	<two-fa-dialog :visible="twoFaDialogShow" @close="onTwoFaDialogClose" />
</template>

<script setup>
import { CheckBadgeIcon } from '@heroicons/vue/24/outline'

import { updateSecuritySettingReq } from "~/api/admin/admin-setting";
import { verify2FAInfoReq } from "~/api/admin/admin-2fa";

import useGlobalConfigStore from "~/stores/global-config";
const globalConfigStore = useGlobalConfigStore();

import useAdminSetting from "~/composables/admin/useAdminSetting";
import TwoFaDialog from "~/pages/admin/security-setting/two-fa-dialog.vue";
const { siteSetting, saveData, saveLoading } = useAdminSetting(updateSecuritySettingReq);

// 绑定成功后，手动验证双因素认证码.
const validBind = () => {
  ElMessageBox.prompt('请输入双因素认证 APP 中的验证码', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValidator(val) {
      return !!val
    },
    inputErrorMessage: '验证码不能为空.'
  }).then(({value}) => {
    let validData = {
      secret: siteSetting.value.loginVerifySecret,
      code: value
    }
    verify2FAInfoReq(validData).then(() => {
      ElMessage.success('验证成功');
    })
  });
}

// 重新绑定
const rebind = () => {
  siteSetting.value.loginVerifySecret = '';
	twoFaDialogShow.value = true;
}

// 取消绑定
const cancelBind = () => {
	siteSetting.value.loginVerifySecret = '';
	siteSetting.value.adminTwoFactorVerify = false;
}

const adminTwoFactorVerifyOnChange = () => {
  if (siteSetting.value.adminTwoFactorVerify === false) {
    siteSetting.value.loginVerifySecret = '';
  }

  if (siteSetting.value.adminTwoFactorVerify && !siteSetting.value.loginVerifySecret) {
	  twoFaDialogShow.value = true;
  }
}

const beforeSave = () => {
	if (siteSetting.value.adminTwoFactorVerify === false) {
		siteSetting.value.loginVerifySecret = '';
	}

	saveData();
};

const currentLocale = ref(window.location.origin);
const twoFaDialogShow = ref(false);
const onTwoFaDialogClose = (secret) => {
	if (secret) {
		siteSetting.value.loginVerifySecret = secret;
	} else {
		siteSetting.value.adminTwoFactorVerify = false;
	}
	twoFaDialogShow.value = false;
};
</script>

<style lang="scss" scoped>
</style>

<route lang="yaml">
meta:
  layout: admin
  name: 基本设置
</route>