<template>
  <div class="zfile-admin-down-link-body">
    <el-form :model="siteSetting"
             v-loading="saveLoading"
             :rules="rules"
             :label-width="globalConfigStore.adminForm.labelWidth"
             :label-position="globalConfigStore.adminForm.labelPosition"
             :size="globalConfigStore.adminForm.size"
             status-icon
             class="z-admin-form"
             ref="settingFormRef"
             v-if="siteSetting"
             element-loading-text="保存中...">
      <el-tabs v-model="activeName">
        <el-tab-pane label="通用设置" name="a">
          <el-form-item label="记录下载日志">
            <el-switch v-model="siteSetting.recordDownloadLog" />
            <div class="el-form-item-tips">
              是否记录直/短链下载日志
            </div>
          </el-form-item>

          <el-form-item label="Referer 防盗链">
            <el-radio-group v-model="siteSetting.refererType">
              <el-radio value="off">不启用 Referer 防盗链</el-radio>
              <el-radio value="white_list">启用白名单</el-radio>
              <el-radio value="black_list">启用黑名单</el-radio>
            </el-radio-group>
            <div class="el-form-item-tips">
              防盗链支持访问文件直链或短链时校验，如用户直接访问直链跳转后的存储源原始链接，无法进行校验和拦截。
            </div>
          </el-form-item>

          <el-form-item v-show="siteSetting.refererType !== 'off'" label="Referer 配置">
            <el-radio-group v-model="siteSetting.refererAllowEmpty">
              <el-radio :value="true">允许 Referer 为空</el-radio>
              <el-radio :value="false">禁止 Referer 为空</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-show="siteSetting.refererType !== 'off'"
                        :label="siteSetting.refererType === 'white_list' ? '白名单' : '黑名单'">
            <el-input type="textarea"
                      @input="testAntPathMatcher"
                      :rows="6"
                      v-model="siteSetting.refererValue">
            </el-input>
            <div class="el-form-item-tips">
              每行输入一个域名，如：
              <ul>
                <li>限制泛域名 <span class="text-red-400">http 协议</span> 全部子目录可访问：
                  <div class="inline select-all font-bold"><span class="text-red-400">http://</span>*example.com/**
                  </div>
                </li>
                <li>限制泛域名 <span class="text-red-400">https 协议</span> 全部子目录可访问：
                  <div class="inline select-all font-bold"><span class="text-red-400">https://</span>*example.com/**
                  </div>
                </li>
                <li>限制泛域名 <span class="text-red-400">全部协议</span> 全部子目录可访问：
                  <div class="inline select-all font-bold"><span class="text-red-400">*://</span>*example.com/**
                  </div>
                </li>
              </ul>
              <div v-if="siteSetting.refererType === 'white_list'">
                每行输入一个域名，需要写协议头支持 * 通配符，如白名单 http://*zfile.vip 将只允许
                http://zfile.vip、http://www.zfile.vip、http://demo.zfile.vip 等网站访问。
              </div>
              <div v-if="siteSetting.refererType === 'black_list'">
                每行输入一个域名，需要写协议头，支持 * 通配符，如黑名单 http://*zfile.vip 将禁止所有如
                http://zfile.vip、http://www.zfile.vip、http://demo.zfile.vip 等网站访问。
              </div>
              <div class="mt-4">
                <div>可在下方输入你要测试的地址，应包含协议和路径（如 http://example.com/1.html）</div>
                <el-input @input="testAntPathMatcher" v-model="testAntVal">
                  <template #suffix>
                    <XCircleIcon class="w-4 text-red-500"
                                 v-if="testAntVal && testAntResult === null"></XCircleIcon>
                    <CheckCircleIcon class="w-4 text-green-500"
                                     v-else-if="testAntVal && testAntResult !== null"></CheckCircleIcon>
                  </template>
                </el-input>
                <div v-show="testAntResult">输入的测试地址匹配了规则: <span
                  class="text-blue-500">{{ testAntResult }}</span></div>
              </div>
            </div>
          </el-form-item>

          <!--设置直链防止恶意下载，单 IP N 秒内只允许访问 M 次直链-->
          <el-form-item label="下载频率限制">
            <div>
              <span>单 IP</span>
              <el-input-number v-model="siteSetting.linkLimitSecond" :min="0" :max="86400" :step="1" size="small"
                               class="mx-2" />
              <span>秒内允许下载</span>
              <el-input-number v-model="siteSetting.linkDownloadLimit" :min="0" :max="9999999" :step="1"
                               size="small" class="mx-2" />
              <span>次</span>
              <el-button :icon="EyeIcon" size="small" type="primary" class="ml-2"
                         @click="openLinkLimitInfo">统计信息
              </el-button>
            </div>
            <div class="el-form-item-tips">
              <span>用来防止恶意下载，单 IP N 秒内只允许访问 M 次直链，如其中一个为 0 则不做任何限制.</span>
              <br><br>
              <span>注意：此功能对直链、短链都有效，且共享限制次数。但直链/短链跳转后的实际下载链接无法限制，因为那些链接不经过 ZFile.</span>
              <br><br>
              <span>注意：如果你使用了反向代理，而不是直接访问的 ZFile 端口, 那你需要在反向代理处设置以下请求头为用户真实 IP："X-Forwarded-For", "X-Real-IP", "Proxy-Client-IP", "WL-Proxy-Client-IP", "HTTP_CLIENT_IP", "HTTP_X_FORWARDED_FOR"，不然不论谁访问 ZFile 都只能获取到反代服务器的 IP，同服务器一般是获取到 127.0.0.1 或 localhost, 这样此功能就无法正常使用!!!  (辅助信息: 系统获取到您当前 IP 为 <span
                class="text-blue-400 select-all">{{ clientIp }}</span>)</span>
            </div>
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="直链设置" name="b">
          <el-form-item label="是否允许使用直链（路径）">
            <el-switch v-model="siteSetting.showPathLink" />
            <div class="el-form-item-tips">
              全局控制是否显示获取直链按钮及是否允许使用直链进行下载，<span
              class="font-bold">优先级大于存储源权限设置.</span>
            </div>
          </el-form-item>

          <el-form-item label="直链地址前缀" prop="directLinkPrefix">
            <el-input v-model="siteSetting.directLinkPrefix"></el-input>
            <div class="el-form-item-tips">
              直链地址前缀, 如 <span class="select-all">{{ serverAddress }}<span
              class="text-red-400 font-bold">{{ siteSetting.directLinkPrefix }}</span>/path/filename</span>
            </div>
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="短链设置" name="c">
          <el-form-item label="是否允许使用短链">
            <el-switch v-model="siteSetting.showShortLink" />
            <div class="el-form-item-tips">
              全局控制是否显示生成短链按钮及是否允许使用已存在的短链进行下载，<span
              class="font-bold">优先级大于存储源权限设置.</span>
            </div>
          </el-form-item>

          <el-form-item label="短链有效期">
            <TimePicker v-model="siteSetting.linkExpireTimes" />
            <div class="el-form-item-tips">
              控制生成短链的有效期
            </div>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>

      <el-form-item :label-width="globalConfigStore.adminForm.labelWidth" class="admin-from-footer">
        <el-button class="ml-auto" type="primary" :size="globalConfigStore.adminForm.size" :icon="CheckBadgeIcon" :loading="saveLoading" @click="saveData(true)">
          保存设置
        </el-button>
      </el-form-item>
    </el-form>
  </div>

  <el-dialog append-to-body title="统计信息" v-model="showLinkLimitInfo" width="80%" top="5vh">
		<span>当前系统限制单 IP <span class="text-blue-400">{{ siteSetting.linkLimitSecond }}</span> 秒内下载 <span
      class="text-blue-400">{{ siteSetting.linkDownloadLimit }}</span> 次，已记录 <span
      class="text-blue-400">{{ linkLimitInfoList.length }}</span> 条记录。（超出 {{ siteSetting.linkLimitSecond }} 秒的记录将被清除。）</span>
    <ArrowPathIcon @click="loadLinkLimitInfo"
                   class="w-4 inline-block cursor-pointer hover:text-blue-400"></ArrowPathIcon>
    <el-table :data="linkLimitInfoList" max-height="400px">
      <el-table-column prop="key" label="IP"></el-table-column>
      <el-table-column prop="count" label="次数">
        <template #default="{ row }">
          <div :class="[row.value > siteSetting.linkDownloadLimit ? 'text-red-500' : '']"> {{ row.value }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="ttl" label="统计区间">
        <template #default="{ row }">
          {{ row.ttl / 1000 }} 秒
        </template>
      </el-table-column>
      <el-table-column prop="expiredTime" label="过期时间"></el-table-column>
      <template #empty>
        <div class="text-center text-gray-400">{{ siteSetting.linkLimitSecond }} 秒内没有任何下载记录</div>
      </template>
    </el-table>
    <template #footer>
			<span class="dialog-footer">
        <el-button @click="showLinkLimitInfo = false">关 闭</el-button>
			</span>
    </template>
  </el-dialog>
</template>

<script setup>
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon, CheckBadgeIcon, EyeIcon } from "@heroicons/vue/24/solid";

import { testRuleMatcherReq, updateLinkSettingReq } from "~/api/admin/admin-setting";
import { existStorageKeyReq } from "~/api/admin/admin-storage";

import useGlobalConfigStore from "~/stores/global-config";
const globalConfigStore = useGlobalConfigStore();

const settingFormRef = ref();
import useAdminSetting from "~/composables/admin/useAdminSetting";
const { siteSetting, saveData, saveLoading } = useAdminSetting(updateLinkSettingReq, settingFormRef);

import useClientInfo from "~/composables/admin/useClientInfo";
const { clientIp } = useClientInfo();

import useLinkSetting from "~/composables/admin/link/useLinkSetting";
const { loadLinkLimitInfo, linkLimitInfoList } = useLinkSetting();

const activeName = ref("a");

const rules = {
	directLinkPrefix: [
    { required: true, message: "直链前缀不能为空", trigger: "change" },
		{
			validator: (rule, value, callback) => {
				if (value === undefined || value === null || value === "") {
					callback();
					return;
				}

				if (constant.systemNames.includes(value)) {
					callback(new Error("不可占用系统级名称，请修改。"));
					return;
				}

				let reg = /^[\w\-]+$/;
				if (!reg.test(value)) {
					callback(new Error("只允许使用字母、数字、下划线、横杠。"));
					return;
				}

				existStorageKeyReq({ storageKey: value }).then((res) => {
					if (res.data) {
						callback(new Error("不可与存储源别名重复，请修改。"));
					} else {
						callback();
					}
				});
			}
		}
	]
};

const testAntVal = ref("");
const testAntResult = ref(null);
const testAntPathMatcher = useDebounceFn(() => {
  let param = {
    ruleType: "antPath",
    rules: siteSetting?.value?.refererValue,
    testValue: testAntVal.value
  };
  // 如果没有规则或者没有测试值则不进行测试
  if (!param.rules || !param.testValue) {
    if (testAntResult.value !== null) {
      testAntResult.value = null;
    }
    return;
  }
  testRuleMatcherReq(param).then(res => {
    testAntResult.value = res.data;
  });
}, 250);

const serverAddress = computed(() => {
	let address = (siteSetting.value?.forceBackendAddress || globalConfigStore.serverAddress);
	return address.endsWith("/") ? address : address + "/";
});

const showLinkLimitInfo = ref(false);
const openLinkLimitInfo = () => {
  loadLinkLimitInfo();
  showLinkLimitInfo.value = true;
};
</script>

<style scoped lang="scss">
.zfile-admin-down-link-body {

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