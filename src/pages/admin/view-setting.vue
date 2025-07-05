<template>
	<div class="zfile-admin-view-setting-wrapper" v-loading="siteSettingLoading">
		<el-tabs v-model="activeName">
			<el-tab-pane label="使用习惯" name="a">
				<el-form :model="siteSetting"
						 v-loading="saveLoading"
						 v-if="siteSetting"
						 :label-width="globalConfigStore.adminForm.labelWidth"
						 :label-position="globalConfigStore.adminForm.labelPosition"
						 :size="globalConfigStore.adminForm.size"
						 status-icon
						 class="z-admin-form"
						 element-loading-text="保存中...">
					<el-form-item label="页面布局">
						<el-radio-group v-model="siteSetting.layout">
							<el-radio value="full">全屏</el-radio>
							<el-radio value="center">居中</el-radio>
							<el-radio value="card">卡片</el-radio>
						</el-radio-group>
					</el-form-item>

          <el-form-item label="移动端页面布局">
            <el-radio-group v-model="siteSetting.mobileLayout">
              <el-radio value="full">全屏</el-radio>
              <el-radio value="center">居中</el-radio>
              <el-radio value="card">卡片</el-radio>
            </el-radio-group>
          </el-form-item>

					<el-form-item label="根目录显示所有存储源">
						<el-switch v-model="siteSetting.rootShowStorage" />
						<div class="el-form-item-tips">
							勾选则根目录显示所有存储源列表, 反之会自动显示第一个存储源的内容.
						</div>
					</el-form-item>


					<el-form-item label="输入文件夹密码时默认勾选保存密码">
						<el-switch v-model="siteSetting.defaultSavePwd" />
					</el-form-item>

					<el-form-item label="文件操作习惯">
						<el-radio v-model="siteSetting.fileClickMode" value="click">单击进入</el-radio>
						<el-radio v-model="siteSetting.fileClickMode" value="dbclick">双击进入</el-radio>
						<div class="el-form-item-tips">
							控制文件和文件夹的点击习惯, 单击/双击打开文件夹或预览文件
						</div>
					</el-form-item>

					<el-form-item label="移动端文件操作习惯">
						<el-radio v-model="siteSetting.mobileFileClickMode" value="click">单击进入</el-radio>
						<el-radio v-model="siteSetting.mobileFileClickMode" value="dbclick">双击进入</el-radio>
						<div class="el-form-item-tips">
							控制文件和文件夹的点击习惯, 单击/双击打开文件夹或预览文件
						</div>
					</el-form-item>

					<el-form-item label="默认最大显示文件数">
						<el-input-number v-model="siteSetting.maxShowSize" :min="1" />
						<div class="el-form-item-tips">
							默认最大显示文件数, 用于控制文件夹中文件的显示数量，防止文件过多导致页面卡顿
						</div>
					</el-form-item>

					<el-form-item label="每次加载更多文件数">
						<el-input-number v-model="siteSetting.loadMoreSize" :min="1" />
						<div class="el-form-item-tips">
							当想显示更多文件时，每次额外显示的文件数
						</div>
					</el-form-item>

					<el-form-item label="默认排序字段">
						<el-radio v-model="siteSetting.defaultSortField" value="name">文件名</el-radio>
						<el-radio v-model="siteSetting.defaultSortField" value="size">文件大小</el-radio>
						<el-radio v-model="siteSetting.defaultSortField" value="time">修改时间</el-radio>
						<div class="el-form-item-tips">
							默认排序方式, 用于控制文件夹中文件的显示顺序
						</div>
					</el-form-item>

					<el-form-item label="默认排序方式">
						<el-radio v-model="siteSetting.defaultSortOrder" value="asc">升序</el-radio>
						<el-radio v-model="siteSetting.defaultSortOrder" value="desc">降序</el-radio>
						<div class="el-form-item-tips">
							默认排序方式, 用于控制文件夹中文件的显示顺序（文件和文件夹会分别排序，且始终是文件夹在前）
						</div>
					</el-form-item>

					<el-form-item label="显示目录文档">
						<el-switch v-model="siteSetting.showDocument" />
						<div class="el-form-item-tips">
							全局控制是否显示为存储源配置的目录文档
						</div>
					</el-form-item>
				</el-form>
			</el-tab-pane>

			<el-tab-pane label="预览类型" name="b">
				<div class="pt-4">
					<el-alert type="info">
            <template #title>
              <div>以下类型不区分大小，且不支持为空，为空会自动恢复至默认值，如果需要关闭某项的所有预览，可以随便写个不存在的格式。</div>
              <div>且这里填写了类型，不代表前端就能预览成功，这依赖浏览器是否支持该编码的，ZFile 程序不负责解码或转码。简单的测试文件是否可在某浏览器预览的方式(不包含Office)是: 新建一个浏览器标签页, 把文件拖进去, 看看是否能正常显示。</div>
            </template>
          </el-alert>
				</div>
				<el-form :model="siteSetting"
						 v-loading="saveLoading"
						 v-if="siteSetting"
						 :label-width="globalConfigStore.adminForm.labelWidth"
						 :label-position="globalConfigStore.adminForm.labelPosition"
						 :size="globalConfigStore.adminForm.size"
						 status-icon
						 class="z-admin-form"
						 element-loading-text="保存中...">
					<el-form-item label="视频文件后缀">
						<el-input v-model="siteSetting.customVideoSuffix">
              <template #suffix>
                <el-tooltip content="恢复默认">
                  <ArrowPathIcon class="w-4 cursor-pointer" @click="resetCustomSuffix('video')" />
                </el-tooltip>
              </template>
            </el-input>
						<div class="el-form-item-tips">
							自定义识别为视频格式的文件后缀，多个用逗号分开，如 'mp4,avi,mkv',
							在此列表中的将调用播放器打开（能否播放要取决于浏览器是否支持，现代浏览器一般只支持封装格式为 h.264 (mp4) 的编码格式）
						</div>
					</el-form-item>

					<el-form-item label="图像文件后缀">
						<el-input v-model="siteSetting.customImageSuffix">
              <template #suffix>
                <el-tooltip content="恢复默认">
                  <ArrowPathIcon class="w-4 cursor-pointer" @click="resetCustomSuffix('image')" />
                </el-tooltip>
              </template>
            </el-input>
					</el-form-item>

					<el-form-item label="音频文件后缀">
						<el-input v-model="siteSetting.customAudioSuffix">
              <template #suffix>
                <el-tooltip content="恢复默认">
                  <ArrowPathIcon class="w-4 cursor-pointer" @click="resetCustomSuffix('audio')" />
                </el-tooltip>
              </template>
            </el-input>
					</el-form-item>

					<el-form-item label="文本文件后缀">
						<el-input v-model="siteSetting.customTextSuffix">
              <template #suffix>
                <el-tooltip content="恢复默认">
                  <ArrowPathIcon class="w-4 cursor-pointer" @click="resetCustomSuffix('text')" />
                </el-tooltip>
              </template>
            </el-input>
					</el-form-item>

          <el-form-item label="Office文件后缀">
            <el-input v-model="siteSetting.customOfficeSuffix">
              <template #suffix>
                <el-tooltip content="恢复默认">
                  <ArrowPathIcon class="w-4 cursor-pointer" @click="resetCustomSuffix('office')" />
                </el-tooltip>
              </template>
            </el-input>
          </el-form-item>

		<el-form-item label="kkFileView文件后缀">
            <el-input v-model="siteSetting.customKkFileViewSuffix">
              <template #suffix>
                <el-tooltip content="恢复默认">
                  <ArrowPathIcon class="w-4 cursor-pointer" @click="resetCustomSuffix('kkfileview')" />
                </el-tooltip>
              </template>
            </el-input>
          </el-form-item>

				</el-form>
			</el-tab-pane>

			<el-tab-pane label="OnlyOffice" name="c">
				<el-form :model="siteSetting"
						 v-loading="saveLoading"
						 v-if="siteSetting"
						 :label-width="globalConfigStore.adminForm.labelWidth"
						 :label-position="globalConfigStore.adminForm.labelPosition"
						 :size="globalConfigStore.adminForm.size"
						 status-icon
						 class="z-admin-form"
						 element-loading-text="保存中...">
					<el-form-item label="OnlyOffice 服务地址">
						<el-input v-model="siteSetting.onlyOfficeUrl"></el-input>
						<div class="el-form-item-tips">
							<div>OnlyOffice 服务地址，默认的公共服务不保证稳定性，推荐自行部署 OnlyOffice 服务.
								部署教程：<a class="link" href="https://docs.zfile.vip/advanced/only-office" target="_blank">https://docs.zfile.vip/advanced/only-office</a>
							</div>
							<ul class="list-disc mt-2 ml-4">
								<li>预览：进行预览的文件需 OnlyOffice 服务能访问到，如您的 OnlyOffice在公网，要预览的文件在内网，则无法正常预览。
									<a class="link" target="_blank" href="https://docs.zfile.vip/question/only-office-download-fail">
										(为什么 OnlyOffice 预览失败？)
									</a>
								</li>
								<li>保存：因保存功能依赖于 OnlyOffice 回调 ZFile 服务，所以需您的 ZFile 服务能被OnlyOffice 访问到。</li>
								<li>浏览器安全规范：如您的 ZFile 是 https 协议的，OnlyOffice 服务也必须是 https协议的，否则无法正常使用。</li>
							</ul>
						</div>
						<div v-if="loopbackAddressTipShow" class="text-red-500 leading-none mt-2">
							提示：检测到当前 ZFile 服务地址 {{ currentHostname }} 属于环回地址，如果你的 OnlyOffice 部署在 Docker 中，将无法正常进行预览，请切换为局域网地址或其他 OnlyOffice 在 Docker 容器内可访问的地址。
						</div>
					</el-form-item>

					<el-form-item label="OnlyOffice Secret">
						<el-input v-model="siteSetting.onlyOfficeSecret"></el-input>
						<div class="el-form-item-tips">
							如果你部署的 OnlyOffice 需要开启 JWT Token 认证，可在此处填写 Secret，否则可以留空。查看OnlyOffice Secret 文档：
							<a class="link" target="_blank" href="https://docs.zfile.vip/advanced/only-office#only-office-secret">
								https://docs.zfile.vip/advanced/only-office#only-office-secret
							</a>
						</div>
					</el-form-item>
				</el-form>
			</el-tab-pane>

			<el-tab-pane label="kkFileView" name="f">
				<el-form :model="siteSetting"
						 v-loading="saveLoading"
						 v-if="siteSetting"
						 :label-width="globalConfigStore.adminForm.labelWidth"
						 :label-position="globalConfigStore.adminForm.labelPosition"
						 :size="globalConfigStore.adminForm.size"
						 status-icon
						 class="z-admin-form"
						 element-loading-text="保存中...">
					<el-form-item label="kkFileView 服务地址">
						<el-input v-model="siteSetting.kkFileViewUrl"></el-input>
						<div class="el-form-item-tips">
							部署文档参考: <a class="link" href="https://www.kkview.cn/zh-cn/docs/production.html" target="_blank">kkFileView 部署指南</a>
						</div>
						<div v-if="loopbackAddressTipShow" class="text-red-500 leading-none mt-2">
							提示：检测到当前 ZFile 服务地址 {{ currentHostname }} 属于环回地址，如果你的 kkFileView 部署在 Docker 中，将无法正常进行预览，请切换为局域网地址或其他 kkFileView 在 Docker 容器内可访问的地址。
						</div>
					</el-form-item>
				</el-form>
			</el-tab-pane>

			<el-tab-pane label="公告" name="d">
				<el-form :model="siteSetting"
						 v-loading="saveLoading"
						 v-if="siteSetting"
						 :label-width="globalConfigStore.adminForm.labelWidth"
						 :label-position="globalConfigStore.adminForm.labelPosition"
						 :size="globalConfigStore.adminForm.size"
						 status-icon
						 class="z-admin-form"
						 element-loading-text="保存中...">
					<el-form-item label="显示公告">
						<el-switch v-model="siteSetting.showAnnouncement" />
					</el-form-item>

					<el-form-item label="公告内容">
						<v-md-editor v-model="siteSetting.announcement" height="400px"></v-md-editor>
						<div class="el-form-item-tips">
							支持 Markdown 语法, 左右分栏, 所见即所得, 可以使用 HTML 语法
						</div>
					</el-form-item>
				</el-form>
			</el-tab-pane>

			<el-tab-pane label="自定义 JS/CSS" name="e">
				<el-form :model="siteSetting"
						 v-loading="saveLoading"
						 v-if="siteSetting"
						 :label-width="globalConfigStore.adminForm.labelWidth"
						 :label-position="globalConfigStore.adminForm.labelPosition"
						 :size="globalConfigStore.adminForm.size"
						 status-icon
						 class="z-admin-form"
						 element-loading-text="保存中...">
					<el-form-item label="自定义 CSS">
						<el-input
							type="textarea"
							:autosize="{ minRows: 3 }"
							placeholder="请输入自定义 CSS 内容"
							v-model="siteSetting.customCss">
						</el-input>
						<div class="el-form-item-tips">
							自定义 CSS 内容, 无须写 &#60;style&#62;&#60;/style&#62; 标签
						</div>
					</el-form-item>

					<el-form-item label="自定义 JS">
						<el-input
							type="textarea"
							:autosize="{ minRows: 3 }"
							placeholder="请输入自定义 JS 内容"
							v-model="siteSetting.customJs">
						</el-input>
						<div class="el-form-item-tips">
							自定义 JS 脚本, &#60;script&#62;&#60;/script&#62; 可写可不写，会自动兼容.<br>
							<span class="text-red-400">注意：如果你网站配置了防火墙，可能会被当成恶意请求拦截而保存失败。</span>
						</div>
					</el-form-item>
				</el-form>
			</el-tab-pane>
		</el-tabs>

		<el-form-item :label-width="globalConfigStore.adminForm.labelWidth" class="admin-from-footer">
			<el-button class="ml-auto" type="primary" :icon="CheckBadgeIcon" :loading="saveLoading" @click="saveData">保存设置</el-button>
		</el-form-item>
	</div>
</template>

<script setup>
import { CheckBadgeIcon } from "@heroicons/vue/24/solid";
import {  ArrowPathIcon } from "@heroicons/vue/24/outline";

import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();

import { updateViewSettingReq } from "~/api/admin/admin-setting";

import useAdminSetting from "~/composables/admin/useAdminSetting";
const { siteSetting, siteSettingLoading, saveData, saveLoading } = useAdminSetting(updateViewSettingReq);
watch(() => siteSetting.value, (val, oldVal) => {
  if (oldVal === null) {
    if (!siteSetting.value.customVideoSuffix) {
      siteSetting.value.customVideoSuffix = constant.fileTypeMap.video.join(',');
    }  if (!siteSetting.value.customImageSuffix) {
      siteSetting.value.customImageSuffix = constant.fileTypeMap.image.join(',');
    }  if (!siteSetting.value.customAudioSuffix) {
      siteSetting.value.customAudioSuffix = constant.fileTypeMap.audio.join(',');
    }  if (!siteSetting.value.customTextSuffix) {
      siteSetting.value.customTextSuffix = constant.fileTypeMap.text.join(',');
    }  if (!siteSetting.value.customOfficeSuffix) {
      siteSetting.value.customOfficeSuffix = constant.fileTypeMap.office.join(',');
    }  if (!siteSetting.value.customKkFileViewSuffix) {
      siteSetting.value.customKkFileViewSuffix = constant.fileTypeMap.kkfileview.join(',');
    }
  }
});

const activeName = ref("a");

// markdown editor 组件懒加载, 节约首屏打开时间
const VMdEditor = defineAsyncComponent(() => {
	return new Promise((resolve, reject) => {
		;(async function() {
			try {
				const res = await import("@kangc/v-md-editor");
				await import("@kangc/v-md-editor/lib/style/base-editor.css");
				import('@kangc/v-md-editor/lib/theme/style/github.css');
				const githubTheme = await import('@kangc/v-md-editor/lib/theme/github.js');
				const hljs = await import('highlight.js');
				res.use(githubTheme, {
					Hljs: hljs.HighlightJS,
				});
				resolve(res)
			} catch (error) {
				reject(error);
			}
		})();
	});
});

const resetCustomSuffix = (type) => {
  if (type === 'video') {
    siteSetting.value.customVideoSuffix = constant.fileTypeMap.video.join(',');
  } else if (type === 'image') {
    siteSetting.value.customImageSuffix = constant.fileTypeMap.image.join(',');
  } else if (type === 'audio') {
    siteSetting.value.customAudioSuffix = constant.fileTypeMap.audio.join(',');
  } else if (type === 'text') {
    siteSetting.value.customTextSuffix = constant.fileTypeMap.text.join(',');
  } else if (type === 'office') {
    siteSetting.value.customOfficeSuffix = constant.fileTypeMap.office.join(',');
  } else if (type === 'kkfileview') {
    siteSetting.value.customKkFileViewSuffix = constant.fileTypeMap.kkfileview.join(',');
  }
}

const loopbackAddressTipShow = ref(false);
const currentHostname = ref(window.location.hostname);
onMounted(() => {
	const hostname = window.location.hostname;

	if (hostname === 'localhost' || hostname === '127.0.0.1') {
		loopbackAddressTipShow.value = true;
	}
})

</script>

<style scoped lang="scss">
.zfile-admin-view-setting-wrapper {

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
  name: 显示设置
</route>