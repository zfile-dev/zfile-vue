<template>
    <div class="zfile-header">
        <div class="zfile-header-breadcrumb box animate__animated animate__fadeIn flex flex-1">
            <header-logo></header-logo>
            <Breadcrumb class="h-12" :items="breadcrumbData" @breadcrumb-click="clickBreadcrumb">
            </Breadcrumb>
        </div>

        <div class="zfile-header-right box animate__animated animate__fadeIn">
            <!-- 功能区 -->
            <div class="zfile-header-btn" v-if="isNotMobile">

                <!-- debug 模式 -->
                <template v-if="storageConfigStore.globalConfig.debugMode">
                    <el-tooltip placement="bottom">
                        <template #content>
                            此功能为 DEBUG 模式下重置管理员密码功能, 使用完后请关闭 DEBUG 模式并重启服务.
                        </template>
                        <el-button size="default" @click="openResetAdminPwdDialog" type="danger">
                            重置管理员密码
                        </el-button>
                    </el-tooltip>
                </template>

                <!-- 如果已登录，则显示 <el-dropdown> 下拉框，下拉中显示注销和修改密码 -->
                <el-dropdown v-if="storageConfigStore.loginInfo.isLogin" trigger="click">
                    <i-mdi-account-circle-outline class="w-6 h-6 text-gray-500 hover:text-blue-500" />
                    <template #dropdown>
                        <el-dropdown-menu class="font-medium">
                            <el-dropdown-item>
                                <span class="text-gray-500 text-center mx-auto">{{ storageConfigStore.loginInfo.username }}{{ storageConfigStore.loginInfo.nickname ? "(" + storageConfigStore.loginInfo.nickname + ")" : "" }}</span>
                            </el-dropdown-item>
                            <el-dropdown-item @click="toAdmin" v-if="storageConfigStore.loginInfo.isAdmin">
                                <i-mdi-account-settings-variant class="mr-3" />
                                前往后台
                            </el-dropdown-item>
                            <el-dropdown-item @click="openUpdatePwdDialog">
                                <i-mdi-lock class="mr-3" />
                                修改密码
                            </el-dropdown-item>
                            <el-dropdown-item @click="logout">
                                <i-mdi-logout class="mr-3" />
                                注销
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>

                <!-- 登录账号 -->
                <el-tooltip placement="bottom" v-else-if="storageConfigStore.globalConfig.showLogin">
                    <template #content>
                        登录账号
                    </template>
                    <div @click="toLoginView">
                        <i-mdi-login-variant class="w-5 h-6 text-gray-500 hover:text-blue-500" />
                    </div>
                </el-tooltip>

                <!-- 上传 -->
                <el-dropdown v-if="storageConfigStore.permission.upload || storageConfigStore.permission.newFolder"
                             trigger="click"
                             popper-class="zfile-header-dropdown">
                    <div v-show="route.params.storageKey">
                        <el-badge :value="uploadProgressInfoStatistics.totalUploadingAndWaiting"
                                  :hidden="uploadProgressInfoStatistics.totalUploadingAndWaiting === 0"
                                  :max="99"
                                  class="!block">
                            <CloudArrowUpIcon class="w-6 h-6 text-gray-500 hover:text-blue-500"></CloudArrowUpIcon>
                        </el-badge>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu class="font-medium">
                            <el-dropdown-item v-if="storageConfigStore.permission.newFolder" @click="newFolder">
                                <i-lucide-folder-plus class="mr-3" />
                                新建文件夹
                            </el-dropdown-item>

                            <el-dropdown-item v-if="storageConfigStore.permission.upload" @click="openUploadDialog"
                                              :divided="storageConfigStore.permission.upload && storageConfigStore.permission.newFolder">
                                <i-ci-file-upload class="mr-3" />
                                上传文件
                            </el-dropdown-item>

                            <el-dropdown-item v-if="storageConfigStore.permission.uploadFolder"
                                              @click="openUploadFolderDialog">
                                <i-ci-folder-upload class="mr-3" />
                                上传文件夹
                            </el-dropdown-item>

                        </el-dropdown-menu>
                    </template>
                </el-dropdown>

                <!-- 画廊模式切换 -->
                <div v-show="route.params.storageKey" @click="fileDataStore.imgMode = !fileDataStore.imgMode">
                    <i-solar-gallery-wide-linear v-if="fileDataStore.imgMode" class="w-5 h-6 text-blue-400" />
                    <i-solar-gallery-wide-linear v-else class="w-5 h-6" />
                </div>

                <!-- 设置按钮 -->
                <div @click="openSettingVisible">
                    <Cog8ToothIcon class="w-6 h-6"></Cog8ToothIcon>
                </div>

            </div>

            <!-- 存储源选择 -->
            <div class="zfile-header-storage-select" v-if="isNotMobile">
                <el-select size="default" v-model="currentStorageKey" placeholder="请选择存储源">
                    <el-option v-for="item in storageList"
                               :key="item.key"
                               :label="item.name"
                               :value="item.key">
                    </el-option>
                </el-select>
            </div>
        </div>

        <div v-if="isMobile">
            <el-dropdown trigger="click">
                <Bars3Icon class="block h-12 w-8" aria-hidden="true" />
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item v-if="storageConfigStore.globalConfig.debugMode"
                                          @click="openResetAdminPwdDialog">
                            <i-mdi-key class="w-4 h-4 mr-2 text-gray-500" name="key" />
                            重置管理员密码
                        </el-dropdown-item>
						<el-dropdown-item v-if="route.params.storageKey && storageConfigStore.permission.newFolder" @click="newFolder">
							<i-lucide-folder-plus class="w-4 h-4 mr-2 text-gray-500" name="add-folder" />
							新建文件夹
						</el-dropdown-item>
						<el-dropdown-item v-if="route.params.storageKey && storageConfigStore.permission.upload" @click="openUploadDialog">
							<i-ci-file-upload class="w-4 h-4 mr-2 text-gray-500" name="upload" />
							上传文件
						</el-dropdown-item>
						<el-dropdown-item v-if="route.params.storageKey && storageConfigStore.permission.uploadFolder"
										  @click="openUploadFolderDialog">
							<i-ci-folder-upload class="w-4 h-4 mr-2 text-gray-500" name="upload-folder" />
							上传文件夹
						</el-dropdown-item>
						<el-dropdown-item v-if="route.params.storageKey && !fileDataStore.imgMode" @click="fileDataStore.imgMode = true">
							<i-ri-image-line class="w-4 h-4 mr-2 text-gray-500" name="image" />
							打开画廊模式
						</el-dropdown-item>
						<el-dropdown-item v-else-if="route.params.storageKey && fileDataStore.imgMode" @click="fileDataStore.imgMode = false">
							<i-ri-image-line class="w-4 h-4 mr-2 text-blue-500" name="image" />
							关闭画廊模式
						</el-dropdown-item>
                        <el-dropdown-item @click="openSettingVisible">
                            <Cog8ToothIcon class="w-4 h-4 mr-2 text-gray-500"></Cog8ToothIcon>
                            更多设置
                        </el-dropdown-item>

                        <div class="border-gray-200 border-t"></div>

                        <template v-if="storageConfigStore.loginInfo.isLogin">
                            <el-dropdown-item @click="toAdmin" v-if="storageConfigStore.loginInfo.isAdmin">
                                <i-mdi-account-settings-variant class="w-4 h-4 mr-2 text-gray-500" name="admin" />
                                前往后台
                            </el-dropdown-item>
                            <el-dropdown-item @click="openUpdatePwdDialog">
                                <i-mdi-lock class="w-4 h-4 mr-2 text-gray-500" name="lock" />
                                修改密码
                            </el-dropdown-item>
                            <el-dropdown-item @click="logout">
                                <i-mdi-logout class="w-4 h-4 mr-2 text-gray-500" name="logout" />
                                注销
                            </el-dropdown-item>
                        </template>
                        <el-dropdown-item v-else-if="storageConfigStore.globalConfig.showLogin" @click="toLoginView">
                            <i-mdi-login-variant class="w-4 h-4 mr-2 text-gray-500" name="login" />
                            登录账号
                        </el-dropdown-item>

                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
    <Setting></Setting>

    <update-pwd ref="updatePwdDialogRef" />
    <update-user-name-and-pwd ref="resetAdminPwdDialogRef" />
</template>

<script setup>
import { Bars3Icon, Cog8ToothIcon, CloudArrowUpIcon } from "@heroicons/vue/24/outline";

let router = useRouter();
let route = useRoute();

import { isMobile, isNotMobile } from "~/utils";

// 存储源列表.
import useHeaderStorageList from "~/composables/header/useHeaderStorageList";

const { loadStorageSourceList, currentStorageKey, storageList } = useHeaderStorageList();

// 面包屑数据和操作
import useBreadcrumb from "~/composables/header/useHeaderBreadcrumb";

const { buildBreadcrumbData, breadcrumbData } = useBreadcrumb();

import useStorageConfigStore from "~/stores/storage-config";

let storageConfigStore = useStorageConfigStore();

import useFileDataStore from "~/stores/file-data";

let fileDataStore = useFileDataStore();

onMounted(() => {
    loadStorageSourceList().then(() => {
        buildBreadcrumbData();
    });
});

const updatePwdDialogRef = ref(null);
const openUpdatePwdDialog = () => {
    updatePwdDialogRef.value.openDialog();
};

const resetAdminPwdDialogRef = ref(null);
const openResetAdminPwdDialog = () => {
    resetAdminPwdDialogRef.value.openDialog();
};

const clickBreadcrumb = (item) => {
    if (item.href) {
        router.push(item.href);
    }
};

watch(() => route.params.storageKey, (value) => {
    if (value === undefined) {
        currentStorageKey.value = "";
    }
});


import useFileOperator from "~/composables/file/useFileOperator";

const { newFolder } = useFileOperator();

import useFileUpload from "~/composables/file/useFileUpload";

const { openUploadDialog, openUploadFolderDialog, uploadProgressInfoStatistics } = useFileUpload();

import useSetting from "~/composables/header/useSetting";

const { openSettingVisible } = useSetting();

// 监听存储源设置 -> 默认打开图片模式, 如果为是, 则打开图片模式.
watch(() => [storageConfigStore.folderConfig.defaultSwitchToImgMode, fileDataStore.oldStorageKey], (val, oldValue) => {
    let defaultSwitchToImgMode = val[0];
    let storageKey = val[1];
    let oldStorageKey = oldValue[1];

    if (storageKey !== oldStorageKey) {
        fileDataStore.imgMode = defaultSwitchToImgMode;
    }
});

const toLoginView = () => {
    window.location.href = "/login";
};

// 自定义 css js 功能.
import { useStyleTag } from "@vueuse/core";

if (storageConfigStore.globalConfig.customCss) {
    try {
        useStyleTag(storageConfigStore.globalConfig.customCss);
    } catch (e) {
        console.error("加载自定义 css 加载失败:", storageConfigStore.globalConfig.customCss, e);
    }
}
import HeaderLogo from "~/components/file/HeaderLogo.vue";
import { checkLoginReq, logoutReq } from "~/api/home/user";
import UpdateUserNameAndPwd from "~/components/user/UpdateUserNameAndPwd.vue";

const loadScriptDom = (scriptDom) => {
    if (scriptDom) {
        document.getElementsByTagName("head")[0].appendChild(scriptDom);
        console.log(`加载自定义 js, src:${scriptDom.src}, text:${scriptDom.text}`);
    }
};

const loadScriptText = (scriptText) => {
    if (scriptText && scriptText.trim()) {
        let scriptDom = document.createElement("script");
        scriptDom.type = "text/javascript";
        scriptDom.text = scriptText;
        loadScriptDom(scriptDom);
    }
};


onMounted(() => {
    nextTick(() => {
        if (storageConfigStore.globalConfig.customJs) {
            // 创建一个新的 div 元素
            const tempDivDom = document.createElement("div");
            // 将字符串作为 HTML 插入到新的 div 中
            tempDivDom.innerHTML = storageConfigStore.globalConfig.customJs;
            // 遍历新 div 中的所有 script 元素
            Array.from(tempDivDom.getElementsByTagName("script")).forEach(script => {
                // 如果该 script 元素有 src 属性，则动态引入外部 JavaScript
                if (script.src) {
                    const newScript = document.createElement("script");
                    for (let i = 0; i < script.attributes.length; i++) {
                        const attr = script.attributes[i];
                        newScript.setAttribute(attr.name, attr.value);
                    }
                    loadScriptDom(newScript);
                } else {
                    // 否则，执行内联的 JavaScript 代码
                    loadScriptText(script.innerHTML);
                }
                tempDivDom.removeChild(script);
            });
            loadScriptText(tempDivDom.innerHTML);
        }
    });
});

// 如果已登录, 则自动跳转到 admin.
checkLoginReq().then((response) => {
    storageConfigStore.updateLoginInfo(response.data);
});

const reload = inject("reload");
const logout = () => {
    logoutReq().then(res => {
        reload();
    });
};

const toAdmin = () => {
    router.push("/admin/site-setting");
};

</script>

<style scoped lang="scss">

.zfile-header {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    height: 48px;
    line-height: 48px !important;
    padding: 0 15px;

    background-color: #ffffff;
    color: #606266;
    transition: border-color var(--el-transition-duration), background-color var(--el-transition-duration);
    border-bottom: 1px solid rgba(132, 133, 141, 0.2);

    .el-scrollbar {
        @apply w-full;
        :deep(.el-scrollbar__bar.is-vertical) {
            display: none !important;
        }
    }

    .zfile-header-breadcrumb {
        :deep(.el-breadcrumb) {
            line-height: 48px;
            font-size: 13px;
            white-space: nowrap;
            margin-left: 14px;

            .el-breadcrumb__item {
                display: inline;
                float: none;
            }
        }
    }

    .zfile-header-right {
        @apply flex space-x-10;

        :deep(.el-dropdown) {
            line-height: 48px !important;
        }

        .zfile-header-btn {
            @apply flex text-4xl space-x-10 items-center;

            div {
                @apply cursor-pointer h-5 #{!important};
            }
        }

        .zfile-header-storage-select {
            @apply mr-4 min-w-[200px];
        }
    }

}

@media only screen and (max-width: 767px) {
    .zfile-header {
        :deep(.el-breadcrumb__separator) {
            display: none !important;
        }

        :deep(.el-form-item__label) {
            display: none !important;
        }

        :deep(.el-select) {
            width: 120px;
            @apply truncate text-sm font-medium text-gray-700;
        }
    }
}

.zfile-debug-tips {
    :deep(.el-form-item__label) {
        font-weight: bold;
        color: red !important;
    }
}


.zfile-header-storage-select {
    :deep(.el-input__wrapper) {
        @apply truncate text-sm font-medium;
    }
}
</style>

<style lang="scss">
.zfile-header-dropdown {
    .el-dropdown-menu__item:hover,
    .el-dropdown-menu__item:hover svg {
        @apply text-blue-500
    }
}
</style>