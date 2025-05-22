<template>
	<div class="zfile-admin-sso-setting-wrapper">
		<el-dropdown split-button type="primary" class="mb-2" @click="addTab('')">
			<span>新增</span>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item v-for="item in baseSsoConfig" :key="item.provider" @click="addTab(item.provider)">
						{{ item.name }}
					</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>

		<div class="text-sm text-gray-400">
			注意：单点登录后新用户的默认权限取自 <router-link to="/admin/user-list" class="link">用户管理</router-link> 中 <router-link to="/admin/user-edit/0" class="link">虚拟新用户</router-link> 的默认权限设置，请确保该用户有访问权限。
		</div>

		<el-empty v-if="ssoConfigList.length === 0" class="h-full mt-20" description="暂无数据" />

		<el-tabs
			v-model="currentSsoProvider"
			closable
			@tab-remove="removeTab"
		>
			<el-tab-pane
				v-for="item in ssoConfigList"
				:key="item.id"
				:label="item.name"
				:name="item.id"
			>
				<el-form :rules="formRules"
						 :model="item"
						 ref="ssoFormRef"
						 status-icon
						 class="z-admin-form"
						 scroll-to-error
						 :label-width="globalConfigStore.adminForm.labelWidth"
						 :label-position="globalConfigStore.adminForm.labelPosition"
						 :size="globalConfigStore.adminForm.size"
				>
					<el-form-item label="是否启用" prop="enabled">
						<el-switch v-model="item.enabled" />
						<div class="el-form-item-tips">是否启用该服务商，如不启用，则不会在登录页显示该服务商</div>
					</el-form-item>
					<el-form-item label="服务商名称" prop="name">
						<el-input v-model="item.name" placeholder="请输入" />
						<div class="el-form-item-tips">登录页悬浮到图标上显示的名称</div>
					</el-form-item>
					<el-form-item label="服务商图标" prop="icon">
						<el-input v-model="item.icon" placeholder="请输入" />
						<div class="el-form-item-tips">
							<span>登录页显示的图标，支持以下几种格式：</span>
							<ul class="list-disc ml-4">
								<li>http://xxx，其中 http 必须小写</li>
								<li>https://xxx，其中 https 必须小写</li>
								<li>带 data:image 前缀的 base64 图片</li>
								<li>不带 data:image 前缀的 base64 图片, 自动添加前缀: data:image/jpeg;base64,</li>
							</ul>
							<div class="flex items-center">
								<span>实时预览：</span>
								<auto-icon :icon="item.icon" />
							</div>
						</div>

					</el-form-item>
					<el-form-item label="服务商简称" prop="provider">
						<el-input v-model="item.provider" placeholder="如 github, google"/>
						<div class="el-form-item-tips">
							<span>用于在服务商回调地址中配置为：</span>
							<span class="select-all link">{{ concatPath(globalConfigStore.serverAddress, "sso", item.provider, 'login/callback') }}</span>
						</div>
					</el-form-item>
					<el-form-item label="Client ID" prop="clientId">
						<el-input v-model="item.clientId" placeholder="请输入 ClientId" />
					</el-form-item>
					<el-form-item label="Client Secret" prop="clientSecret">
						<el-input v-model="item.clientSecret" placeholder="请输入 ClientSecret" />
					</el-form-item>
					<el-form-item label="授权端点" prop="authUrl">
						<el-input v-model="item.authUrl" placeholder="请输入授权端点" />
						<el-button class="mt-2" type="primary" @click="addByWellKnownEndpoint(item)">通过 .well-known 地址自动获取</el-button>
					</el-form-item>
					<el-form-item label="Token 端点" prop="tokenUrl">
						<el-input v-model="item.tokenUrl" placeholder="请输入 Token 端点" />
					</el-form-item>
					<el-form-item label="用户信息端点" prop="userInfoUrl">
						<el-input v-model="item.userInfoUrl" placeholder="请输入用户信息端点" />
					</el-form-item>
					<el-form-item label="Scope" prop="scope">
						<el-input v-model="item.scope" placeholder="请输入" />
						<div class="el-form-item-tips">授权范围，请根据服务商的要求填写，应支持调用上面填写的用户信息接口</div>
					</el-form-item>
					<el-form-item label="用户字段" prop="bindingField">
						<el-input v-model="item.bindingField" placeholder="请输入" />
						<div class="el-form-item-tips">取用户信息端点返回的哪个字段作为用户名，支持
							<a class="link" href="https://alibaba.github.io/fastjson2/jsonpath_cn" target="_blank">
								JSONPath 语法
							</a>
						</div>
					</el-form-item>
					<el-form-item label="排序" prop="orderNum">
						<el-input v-model="item.orderNum" type="number" placeholder="请输入" />
						<div class="el-form-item-tips"><span>登录页显示的顺序，数字越小越靠前</span></div>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="beforeSaveOrUpdate(item)">保存</el-button>
					</el-form-item>
				</el-form>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script setup>
import { concatPath } from "~/utils";
import { baseSsoConfig } from "~/composables/admin/sso/baseSsoConfig";

import useSsoConfig from "~/composables/admin/sso/useSsoConfig";
const { ssoConfigList, currentSsoProvider,
		formRules, addTab, removeTab, beforeLeave,
		saveOrUpdate
} = useSsoConfig();

import useGlobalConfigStore from "~/stores/global-config";
import { getWellKnownEndpointReq } from "~/api/admin/admin-sso";
const globalConfigStore = useGlobalConfigStore();

const saveLoading = ref(false);
const ssoFormRef = ref(null);
const beforeSaveOrUpdate = (item) => {
	const index = ssoConfigList.value.findIndex((i) => i.id === item.id);
	ssoFormRef.value[index].validate((valid) => {
		if (valid) {
			saveOrUpdate(item)
		} else {
			saveLoading.value = false;
		}
	});
};


const addByWellKnownEndpoint = (item) => {
	ElMessageBox.prompt('请在输入框中输入 .well-known 地址，系统会自动解析出相关参数。<br>如：https://gitlab.com/.well-known/openid-configuration', '提示', {
		dangerouslyUseHTMLString: true,
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		inputValidator(val) {
			return !!val
		},
		inputErrorMessage: '地址不能为空.'
	}).then(({value}) => {
		getWellKnownEndpointReq(value).then((res) => {
			if (res.status === 200) {
				const data = res.data;
				item.authUrl = data.authorization_endpoint;
				item.tokenUrl = data.token_endpoint;
				item.userInfoUrl = data.userinfo_endpoint;
				ElMessage.success('自动获取成功');
			} else {
				ElMessage.error('获取失败');
			}
		});
	});
};
</script>

<style scoped lang="scss">
.zfile-admin-sso-setting-wrapper {
	// 修正 el-tabs 给的 padding
	:deep(.el-tabs__content) {
		margin-top: -20px;
	}

	// 内部表单不再有 padding
	:deep(.el-form) {
		padding: 0;
	}

}
</style>

<route lang="yaml">
meta:
  layout: admin
  name: 用户管理
</route>