<template>
	<el-form :model="siteSetting"
			 v-if="siteSetting"
			 :label-width="globalConfigStore.adminForm.labelWidth"
			 :label-position="globalConfigStore.adminForm.labelPosition"
			 :size="globalConfigStore.adminForm.size"
			 class="z-admin-form"
			 v-loading="saveLoading">

		<admin-form-header title="访问控制" sub-title="此处设置可保护您的站点安全" />

		<el-form-item label="IP 黑名单">
			<el-input type="textarea" @input="testIpMatcher" :rows="6" v-model="siteSetting.accessIpBlocklist" />
			<div class="el-form-item-tips">
				每行输入一个 IP 或 IP 段，如：
				<ul class="list-disc ml-4">
					<li>127.0.0.1</li>
					<li>192.168.0.0/24</li>
					<li>支持 IPv6 地址和网段。</li>
				</ul>
				<div class="mt-1">
					注意：检测到你当前 ip 为：<span class="text-blue-400">{{ clientIp }}</span>，别把自己 ip 配置进去（
					<el-popover
						placement="top-start"
						title="提示"
						:width="300"
						trigger="hover">
						<template #reference>
							<span>这里显示的不是你的 IP 地址？<QuestionMarkCircleIcon class="w-4 h-4 inline align-sub" /></span>
						</template>
						<template #default>
							注意：如果你使用了反向代理，而不是直接访问的 ZFile 端口, 那你需要在反向代理处添加以下任意请求头为用户真实
							IP："X-Forwarded-For", "X-Real-IP", "Proxy-Client-IP", "WL-Proxy-Client-IP",
							"HTTP_CLIENT_IP", "HTTP_X_FORWARDED_FOR"，不然不论谁访问 ZFile 都只能获取到反代服务器的
							IP，同服务器一般是获取到 127.0.0.1 或 localhost, 这样此功能就无法正常使用!!!
						</template>
					</el-popover>
					）。
				</div>
				<div class="mt-4">
					<div>可在下方输入你要测试的 IP, 显示绿色表示不会被拦截，红色表示触发了黑名单会被拦截</div>
					<el-input @input="testIpMatcher" v-model="testIpVal">
						<template #suffix>
							<XCircleIcon class="error-icon" v-if="testIpVal && testIpResult !== null" />
							<CheckCircleIcon class="success-icon" v-else-if="testIpVal && testIpResult === null" />
						</template>
					</el-input>
					<div v-if="testIpVal">
						<div v-if="testIpResult">
							输入的测试 IP 匹配了规则: <span class="text-blue-500">{{ testIpResult }}</span>，会被禁止访问 ZFile。
						</div>
						<div v-else>输入的测试 IP 未匹配任何规则, 可以正常访问 ZFile。</div>
					</div>
				</div>
			</div>
		</el-form-item>
		<el-form-item label="UA 黑名单">
			<el-input type="textarea"
					  @input="testUserAgentMatcher"
					  :rows="6"
					  v-model="siteSetting.accessUaBlocklist">
			</el-input>
			<div class="el-form-item-tips">
				每行输入一个 UserAgent，支持 * 通配符，如：
				<ul class="list-disc ml-4">
					<li>Mozilla/5.0*</li>
					<li>Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36</li>
				</ul>
				<div class="mt-1">注意：当前浏览器 UserAgent 为：<span class="text-blue-400">{{ userAgent }}</span>，别把自己 ua 填到黑名单去。
				</div>
				<div class="mt-4">
					<div>可在下方输入你要测试的 UserAgent, 显示绿色表示不会被拦截，红色表示触发了黑名单会被拦截</div>
					<el-input @input="testUserAgentMatcher" v-model="testUserAgentVal">
						<template #suffix>
							<XCircleIcon class="error-icon" v-if="testUserAgentVal && testUserAgentResult != null" />
							<CheckCircleIcon class="success-icon" v-else-if="testUserAgentVal && testUserAgentResult === null" />
						</template>
					</el-input>
					<div v-if="testUserAgentVal">
						<div v-if="testUserAgentResult">
							输入的测试 UserAgent 匹配了规则: <span class="text-blue-500">{{ testUserAgentResult }}</span>，会被禁止访问 ZFile。
						</div>
						<div v-else>输入的测试 UserAgent 未匹配任何规则, 可以正常访问 ZFile。</div>
					</div>
				</div>
			</div>
		</el-form-item>
		<el-form-item label="快捷操作">
			<el-popover
				placement="top-start"
				title="提示"
				:width="300"
				trigger="hover">
				<template #reference>
					<el-button type="primary" @click="copyThunderUA">屏蔽迅雷下载</el-button>
				</template>
				<template #default>
					<div>使用迅雷下载，可能会导致服务器CPU和带宽长时间被耗尽，所以这里提供了一键屏蔽迅雷下载的功能，点击按钮即可复制到剪贴板，然后粘贴到
						UA 黑名单中<span class="font-bold">保存</span>即可。
					</div>
					<div class="mt-1">tips: 不保证该规则一直有效，迅雷的下载服务可能会更改 UA。</div>
				</template>
			</el-popover>
		</el-form-item>
		<el-form-item class="admin-from-footer">
			<el-button class="ml-auto" type="primary" :icon="CheckBadgeIcon" @click="saveData">保存设置</el-button>
		</el-form-item>
	</el-form>
</template>

<script setup>
import { CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon, CheckBadgeIcon } from "@heroicons/vue/24/solid";
import { toClipboard } from "@soerenmartius/vue3-clipboard";
import { testRuleMatcherReq, updateAccessSettingReq } from "~/api/admin/admin-setting";

import useGlobalConfigStore from "~/stores/global-config";
const globalConfigStore = useGlobalConfigStore();

const settingFormRef = ref();
import useAdminSetting from "~/composables/admin/useAdminSetting";
const { siteSetting, saveData, saveLoading } = useAdminSetting(updateAccessSettingReq, settingFormRef);

import useClientInfo from "~/composables/admin/useClientInfo";
const { clientIp, userAgent } = useClientInfo();

const testUserAgentVal = ref("");
const testUserAgentResult = ref(null);
const testUserAgentMatcher = useDebounceFn(() => {
	testRuleMatcher("springSimple", siteSetting.value?.accessUaBlocklist, testUserAgentVal.value, testUserAgentResult);
}, 250);

const testIpVal = ref("");
const testIpResult = ref(null);
const testIpMatcher = useDebounceFn(() => {
	testRuleMatcher("ip", siteSetting.value?.accessIpBlocklist, testIpVal.value, testIpResult);
}, 250);

const testRuleMatcher = (ruleType, rules, testValue, testResult) => {
	let param = {
		ruleType,
		rules,
		testValue
	};
	if (!(param.rules && param.testValue)) {
		testResult.value = null;
		return;
	}
	testRuleMatcherReq(param).then(res => {
		testResult.value = res.data;
	});
};

// 屏蔽迅雷 UserAgent
const ThunderUa = "*Thunder*\nMozilla/5.0 (Linux; Android) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.131 Safari/537.36\n*Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;*";
const copyThunderUA = () => {
	toClipboard(ThunderUa).then(() => {
		if (siteSetting.value.accessUaBlocklist) {
			if (!siteSetting.value.accessUaBlocklist.endsWith("\n")) {
				siteSetting.value.accessUaBlocklist += "\n";
			}
		}
		ElMessage.success("复制成功，请粘贴到 UA 黑名单中，然后保存。");
	}).catch(() => {
		ElMessage.error("复制失败");
	});
};
</script>

<style lang="scss" scoped>

.error-icon {
	@apply w-4 text-red-500;
}

.success-icon {
	@apply w-4 text-green-500;
}

</style>

<route lang="yaml">
meta:
  layout: admin
  name: 访问控制
</route>