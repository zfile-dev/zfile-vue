<template>
  <el-form :model="storageItem"
          :label-width="globalConfigStore.adminForm.labelWidth"
          :label-position="globalConfigStore.adminForm.labelPosition"
          :size="globalConfigStore.adminForm.size"
          scroll-to-error
          status-icon
          class="zfile-storage-edit z-admin-form"
          :rules="rules" ref="storageEditForm">

    <cancel title="存储源信息" to="/admin/storage-list">
      请维护您的存储源信息，可参考
      <a class="link" target="_blank" href="https://docs.zfile.vip/category/%E5%AD%98%E5%82%A8%E6%BA%90%E7%A4%BA%E4%BE%8B%E9%85%8D%E7%BD%AE">ZFile 存储源配置文档</a>
    </cancel>

    <el-form-item label="存储源名称" prop="name">
      <el-input v-model="storageItem.name"/>
    </el-form-item>

    <el-form-item label="存储源别名" prop="key">
      <el-input v-model="storageItem.key"/>
      <div class="el-form-item-tips">
        存储源别名，用于 URL 中展示, 如 {{ concatPath(serverAddress, storageItem.key || "{存储源别名}") }}
      </div>
    </el-form-item>

    <el-form-item label="存储源备注">
      <el-input type="textarea" :rows="3"
                placeholder="请输入存储源备注" v-model="storageItem.remark"/>
      <div class="el-form-item-tips">
        存储源备注信息, 用于辅助管理员区分不同的存储源, 此字段仅管理员可见
      </div>
    </el-form-item>

    <el-form-item label="存储策略" prop="type">
      <el-select :disabled="isEditMode" :filterable="isNotMobile" v-model="storageItem.type" placeholder="请选择存储策略">
        <el-option :key="item.key"
                   v-for="(item) in supportStorageType"
                   :label="item.description"
                   :value="item.key">
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="是否启用">
      <el-switch v-model="storageItem.enable"/>
      <div class="el-form-item-tips">
        如不启用，则在前台不显示，且不可访问.
      </div>
    </el-form-item>

    <el-form-item label="是否默认打开画廊模式">
      <el-switch v-model="storageItem.defaultSwitchToImgMode"/>
      <div class="el-form-item-tips">
        启用后，每次切换到此存储源，将自动打开画廊模式（适用于纯图片的存储源）
      </div>
    </el-form-item>

    <div v-for="(item) in storageSourceParamList" :key="item.key">
      <el-form-item
        v-if="fieldShowMap[item.key]"
        :label="item.name"
        :required="item.required"
        :prop="'storageSourceAllParam.' + item.key">

        <template #label v-if="item.pro">
          {{item.name}}
          <span class="badge-blue">Pro</span>
        </template>

        <!-- Endpoint -->
        <el-select :filterable="isNotMobile" allow-create default-first-option
                   v-if="item.key === 'endPoint' && constant.region.hasOwnProperty(storageItem.type)"
                   style="width: 100%"
                   v-model="storageItem.storageSourceAllParam.endPoint">
          <el-option v-for="endPoint in constant.region[storageItem.type]" :label="endPoint.name" :value="endPoint.val" :key="endPoint.name">
            <span style="float: left">{{ endPoint.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{endPoint.val}}</span>
          </el-option>
        </el-select>

        <!-- sharepoint 网站列表 -->
        <el-select :filterable="isNotMobile"
                   v-else-if="item.key === 'siteId' && isSharePoint(storageItem.type)"
                   placeholder="请选择站点列表"
                   v-model="storageItem.storageSourceAllParam.siteId" class="input-with-select">
          <el-option v-for="option in sharepointSites" :key="option.id" :label="option.displayName" :value="option.id">
					<span style="float: left">
						{{ option.displayName }}
						<el-tag type="success" v-if="option.displayName === 'Communication site'">默认网站</el-tag>
					</span>
            <el-popover
              placement="right"
              width="400"
              trigger="hover"
              :content="option.webUrl"
            >
              <template #reference>
                <el-link target="_blank" :icon="LinkIcon" :href="option.webUrl" :underline="false" class="float-right" type="primary">查看网站</el-link>
              </template>
            </el-popover>
          </el-option>
        </el-select>

        <!-- sharepoint 网站子目录 -->
        <el-select :filterable="isNotMobile"
                   v-else-if="item.key === 'listId' && isSharePoint(storageItem.type)"
                   placeholder="请选择网站子目录"
                   v-model="storageItem.storageSourceAllParam.listId" class="input-with-select">
          <el-option v-for="option in sharepointSiteLists" :key="option.id" :label="option.displayName" :value="option.id">
					<span style="float: left">
						{{ option.displayName }}
						<el-tag type="success" v-if="option.displayName === 'Communication site'">默认网站</el-tag>
					</span>
            <el-popover
              placement="right"
              width="400"
              trigger="hover"
              :content="option.webUrl"
            >
              <template #reference>
                <el-link target="_blank" :icon="Link" :href="option.webUrl" :underline="false" class="float-right" type="primary">查看网站</el-link>
              </template>
            </el-popover>
          </el-option>
        </el-select>

        <!-- gd 网盘选择 -->
        <el-select :filterable="isNotMobile"
                   v-else-if="item.key === 'driveId' && drivesList?.length > 0"
                   placeholder="请选择驱动器列表"
                   v-model="storageItem.storageSourceAllParam.driveId" class="input-with-select">
          <el-option value="" label="默认空间">
					<span class="float-left">
            默认空间
					</span>
            <span class="float-right">
            <el-tag type="primary" class="float-right">
              个人盘
            </el-tag>
          </span>
          </el-option>
          <el-option v-for="option in drivesList" :key="option.id" :label="option.name" :value="option.id">
					<span class="float-left">
						{{ option.name }}
					</span>
            <el-popover
              placement="left"
              width="400"
              trigger="hover"
              :content="option.id"
            >
              <template #reference>
                <el-tag type="success" class="float-right">
                  团队盘
                </el-tag>
              </template>
            </el-popover>
          </el-option>
        </el-select>

        <!-- s3 存储器列表 -->
        <el-select
					allow-create
          :filterable="isNotMobile"
          v-else-if="item.key === 'bucketName' && bucketList?.length > 0"
          placeholder="请选择存储器列表"
          v-model="storageItem.storageSourceAllParam.bucketName" class="input-with-select">
          <el-option v-for="option in bucketList" :key="option.name"
                     :label="option.name" :value="option.name">
					<span class="float-left">
						{{ option.name }}
					</span>
            <span class="float-right">
            {{ option.date }}
          </span>
          </el-option>
        </el-select>

        <!-- s3 跨域配置列表 -->
        <div class="w-full" v-else-if="item.key === 'corsConfigList'">
          <Cors v-model="storageItem.storageSourceAllParam['corsConfigList']" />
          <div class="text-sm text-gray-400" v-html="corsTips">
          </div>
        </div>

        <!-- 通用下拉选择 -->
        <template v-else-if="item.type === 'select'">
          <el-select :allow-create="item.optionAllowCreate" :filterable="isNotMobile" default-first-option v-model="storageItem.storageSourceAllParam[item.key]">
            <el-option v-for="option in item.options" :label="option.label" :value="option.value"></el-option>
          </el-select>
        </template>

        <!-- 通用 switch 开关 -->
        <template v-else-if="item.type === 'switch'">
          <el-switch v-model="storageItem.storageSourceAllParam[item.key]" />
        </template>

        <!-- 通用 input -->
        <template v-else-if="item.type === 'input'">
          <el-input v-if="trimInputFields.includes(item.key)" v-model.trim="storageItem.storageSourceAllParam[item.key]" :disabled="inputIsReadOnly(item.key)" />
          <el-input v-else v-model="storageItem.storageSourceAllParam[item.key]"/>
        </template>

	      <!-- 通用 input-number -->
	      <template v-else-if="item.type === 'number'">
		      <el-input-number v-model="storageItem.storageSourceAllParam[item.key]"/>
	      </template>

        <!-- 通用 textarea -->
        <template v-else-if="item.type === 'textarea'">
          <el-input type="textarea" v-model="storageItem.storageSourceAllParam[item.key]" />
        </template>

        <div v-else>
          服务端配置错误, 字段 {{ item.key }} 类型为 {{ item.type }}, 不支持此类型的渲染.
        </div>

        <div class="el-form-item-tips">
          <!-- 通用链接 -->
          <div v-if="item.link">
            <span v-if="item.key === 'accessToken'" class="flex items-center">
              <el-link target="_blank" :icon="LinkIcon" type="info"
                       :href="item.link + '?clientId=' + encodeURIComponent(storageItem.storageSourceAllParam['clientId'])
                            + '&clientSecret=' + encodeURIComponent(storageItem.storageSourceAllParam['clientSecret'])
                            + '&redirectUri=' + encodeURIComponent(storageItem.storageSourceAllParam['redirectUri'])">
                {{ item.linkName }}
              </el-link>
              <i-ic-baseline-content-copy @click="copyText(item.link + '?clientId=' + encodeURIComponent(storageItem.storageSourceAllParam['clientId'])
                                      + '&clientSecret=' + encodeURIComponent(storageItem.storageSourceAllParam['clientSecret'])
                                      + '&redirectUri=' + encodeURIComponent(storageItem.storageSourceAllParam['redirectUri']))"
                                          class="inline cursor-pointer ml-2 w-4 text-lg relative" />
            </span>
            <el-link v-else target="_blank" :icon="LinkIcon" :href="item.link">{{ item.linkName }}</el-link>
          </div>

          <!-- 通用描述信息 -->
          <div v-if="item.description" v-html="item.description">
          </div>

          <div class="font-bold" v-if="item.key === 'domain' && storageItem.storageSourceAllParam['domain']">
            注意:
            <ul>
              <li v-show="showSchemaTips"
                  class="text-red-500">如果你的 zfile 是 https，则该存储源的下载域名也应是 https，否则可能会影响打包下载和批量下载!</li>
              <li>需域名支持跨域访问，否则可能会导致下载/预览失败.</li>
            </ul>
          </div>
          <!--  onedrive 动态地址提示 -->
          <div v-if="item.key === 'redirectUri' && item.description && ['onedrive', 'sharepoint'].includes(storageItem.type)">
            如：{{ concatPath(serverAddress, 'onedrive/callback') }}
            <i-ic-baseline-content-copy @click="copyText(concatPath(serverAddress, 'onedrive/callback'))" class="inline cursor-pointer ml-1" />
          </div>
          <div v-if="item.key === 'redirectUri' && item.description && ['onedrive-china', 'sharepoint-china'].includes(storageItem.type)">
            如：{{ concatPath(serverAddress, 'onedrive/china-callback') }}
            <i-ic-baseline-content-copy @click="copyText(concatPath(serverAddress, 'onedrive/china-callback'))" class="inline cursor-pointer ml-1" />
          </div>
          <div v-if="item.key === 'redirectUri' && item.description && storageItem.type === 'google-drive'">
            如：{{ concatPath(serverAddress, 'gd/callback') }}
            <i-ic-baseline-content-copy @click="copyText(concatPath(serverAddress, 'gd/callback'))" class="inline cursor-pointer ml-1" />
          </div>
          <div v-if="item.key === 'accessToken' && storageItem.type === 'open115'">
            <open115-login :app-id="storageItem.storageSourceAllParam.clientId" @success="onOpen115LoginSuccess" />
          </div>
        </div>
      </el-form-item>
    </div>

    <el-form-item :label-width="globalConfigStore.adminForm.labelWidth" class="admin-from-footer">
      <el-button class="ml-auto" type="primary" :icon="CheckBadgeIcon" :loading="loading" @click="submitForm">保存设置</el-button>
    </el-form-item>

  </el-form>
</template>

<script setup>
import {CheckBadgeIcon, LinkIcon} from '@heroicons/vue/24/solid'

import useAdminSetting from "~/composables/admin/useAdminSetting";
const { siteSetting } = useAdminSetting();

import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();

import {
  loadStorageItemReq,
  loadSupportStorageReq,
  storageParamsReq,
  saveStorageSettingReq, existStorageKeyReq
} from "~/api/admin/admin-storage";
import {ElMessageBox} from "element-plus";
import {loadSharePointSiteListsReq, loadSharePointSitesReq} from "~/api/tools/tools-sharepoint";
import { loadS3BucketsReq, loadS3CorsConfigReq } from "~/api/tools/tools-s3";
import { loadGDDrivesReq } from "~/api/tools/tools-gd";
import { toClipboard } from "@soerenmartius/vue3-clipboard";
import { concatPath, convertStr, isNotMobile } from "~/utils";

let router = useRouter();
let route = useRoute();

// 当前正在编辑的存储源 key
let currentEditStorageKey = null;

let storageEditForm = ref();
const submitForm = () => {
  storageEditForm.value.validate(checked => {
    if (checked) {
      loading.value = true;
      saveStorageSettingReq(storageItem.value).then((res) => {

        let saveMsg = '保存成功, 是否前往用户管理配置权限（不配置将无法访问该存储源）？';

        isEditMode.value = true;
        ElMessageBox.confirm(saveMsg, '提示', {
          confirmButtonText: '前往用户管理设置',
          cancelButtonText: '返回存储源列表',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          showClose: false,
          type: 'success',
          callback: action => {
            if (action === 'confirm') {
              router.push('/admin/user-list');
            } else {
              router.push('/admin/storage-list');
            }
          }
        });
      }).finally(() => {
        loading.value = false;
      })
    } else {
      ElMessage.warning('表单验证失败, 请检查表单数据是否填写正确');
      return false;
    }
  })
}

/**
 * 初始化支持的存储源列表和存储源数据
 */
let useInitData = () => {
  // 存储源数据
  let storageItem = ref({
    orderNum: null,
    name: '',
    type: '',
    remark: '',
    alias: '',
    defaultSwitchToImgMode: false,
    enable: true,
    enableFileOperator: true,
    enableFileAnnoOperator: false,
    enableCache: false,
    autoRefreshCache: false,
    storageSourceAllParam: {
      endPoint: '',
      pathStyle: '',
      isPrivate: false,
      accessKey: null,
      secretKey: null,
      bucketName: null,
      host: null,
      port: null,
      filePath: null,
      accessToken: null,
      refreshToken: null,
      secretId: null,
      username: null,
      password: null,
      privateKey: null,
      passphrase: null,
      basePath: "",
      domain: "",
      listId: "",
      redirectUri: "",
      siteId: "",
      proxyDomain: '',
      downloadLinkType: '',
      clientId: '',
      clientSecret: '',
      region: '',
      autoConfigCors: false,
      driveId: ''
    },
  });

  // 加载指定存储源的数据
  const loadStorageItem = (storageId) => {
    loadStorageItemReq(storageId).then((res) => {
      res.data.type = res.data.type.key;
      storageItem.value = res.data;
      currentEditStorageKey = res.data.key;
    })
  }

  let isEditMode = ref(false);

  // 支持的所有存储策略
  let supportStorageType = ref([]);
  onMounted(() => {
    // 获取支持的所有存储引擎
    loadSupportStorageReq().then((response) => {
      supportStorageType.value = response.data;
    });

    // 获取 url 参数中的存储源 id, 如果没 id, 表示是新增, 不初始化加载数据
    let storageId = route.params.storageId;
    if (storageId) {
      isEditMode.value = true;
      loadStorageItem(storageId);
    }
  })

  // loading
  let loading = ref(false);
  // 表单校验规则
  let rules = ref({
    name: [{required: true, message: '请输入存储源名称'}],
    key: [
      {
        validator: (rule, value, callback) => {
          if (value === undefined || value === null || value === '') {
            callback();
            return;
          }

          if (constant.systemNames.includes(value)) {
            callback(new Error('不可占用系统级名称，请修改。'));
            return;
          }


          let reg = /^[\w\-]+$/;
          if (!reg.test(value)) {
            callback(new Error('只允许使用字母、数字、下划线、横杠。'));
            return;
          }

          if (currentEditStorageKey === value) {
            callback();
            return;
          }
          existStorageKeyReq({storageKey: value}).then((res) => {
            if (res.data) {
              callback(new Error('该存储源别名已存在，请修改。'));
            } else {
              callback();
            }
          })
        },
      }
    ],
    type: [{required: true, message: '存储策略不能为空'}],
    'storageSourceAllParam.url': [
      {
        type: 'url', message: '请输入正确的地址，需以 http:// 或 https:// 开头'
      },
    ],
    'storageSourceAllParam.domain': [
      {
        type: 'url', message: '请输入正确的域名，需以 http:// 或 https:// 开头'
      },
      {
        validator: (rule, value, callback) => {
          if (value === undefined || value === null || value === '') {
            callback();
            return;
          }

          if (window.location.protocol === 'https:' && value.indexOf('http://') === 0) {
            callback(new Error('检测到当前 ZFile 站点是 https 协议, 受浏览器限制, 此处也必须是 https 协议, 否则可能无法正常使用.'));
            return;
          }

          callback();
        },
      }
    ],
    'storageSourceAllParam.endPointScheme': [
      {
        validator: (rule, value, callback) => {
          if (value === undefined || value === null || value === '') {
            callback();
            return;
          }

          if (window.location.protocol === 'https:' && value === 'http') {
            callback(new Error('检测到当前 ZFile 站点是 https 协议, 受浏览器限制, 此处也必须是 https 协议, 否则可能无法正常使用.'));
            return;
          }

          callback();
        },
      }
    ],
    'storageSourceAllParam.filePath': [
      {
        validator: (rule, value, callback) => {
          if (value === undefined || value === null || value === '') {
            callback(new Error('本地存储路径不能为空'));
            return;
          }

          let isLinuxAbsolutePath = /^\/.*/.test(value);
          let isWindowsAbsolutePath = /^[a-zA-Z]+:.*/.test(value);
          console.log(isLinuxAbsolutePath, isWindowsAbsolutePath);
          if (!isLinuxAbsolutePath && !isWindowsAbsolutePath) {
            callback(new Error('本地存储路径必须是绝对路径，Linux 以 / 开头，Windows 以盘符开头'));
            return;
          }

          callback();
        },
      }
    ],
    'storageSourceAllParam.bucketName': [
      {
        required: true, message: '请选择存储器列表'
      }
    ]
  })

  return { storageItem, supportStorageType, loading, rules, isEditMode }
}
let { storageItem, supportStorageType, loading, rules, isEditMode } = useInitData();

let useS3Util = () => {
  let bucketList = ref([]);
  let corsTips = ref('');

  let s3Credentials = computed(() => {
    return {
      accessKey: storageItem.value.storageSourceAllParam.accessKey || storageItem.value.storageSourceAllParam.secretId,
      secretKey: storageItem.value.storageSourceAllParam.secretKey,
      endPoint: storageItem.value.storageSourceAllParam.endPoint,
      region: storageItem.value.storageSourceAllParam.region,
      bucketName: storageItem.value.storageSourceAllParam.bucketName,
    }
  })

  watch(() => s3Credentials.value, (val) => {
    if (!constant.storageType.s3Type.includes(storageItem.value.type)) {
      return;
    }
    if (val.accessKey && val.secretKey && val.endPoint) {
      loadS3BucketList(val);

      if (val.bucketName) {
        loadCorsConfig(val);
      }
    }
  })

  const loadS3BucketList = (s3Credentials) => {
    loadS3BucketsReq(s3Credentials).then((res) => {
      bucketList.value = res.data;
    }).catch((e) => {
      bucketList.value = [];
    })
  }

  const loadCorsConfig = (s3Credentials) => {
    loadS3CorsConfigReq(s3Credentials).then((res) => {
      storageItem.value.storageSourceAllParam['corsConfigList'] = res.data;
      corsTips.value = '以上是自动获取到的跨域配置，如未正确配置跨域，可能会导致在线预览和上传失败。';
    }).catch((e) => {
      corsTips.value = '自动获取跨域配置失败，可能是存储源不支持/无需跨域配置，或者没有权限获取跨域配置或其他原因。<br>报错信息：' + e.response.data.msg;
    })
  }

  return { bucketList, corsTips }
}

let { bucketList, corsTips } = useS3Util();


let useGDUtil = () => {
  let drivesList = ref([]);

  let param = computed(() => {
    return {
      accessToken: storageItem.value.storageSourceAllParam.accessToken,
    }
  })

  watch(() => param.value, (val) => {
    if (storageItem.value.type !== 'google-drive') {
      return;
    }
    loadDrives(val);
  })

  const loadDrives = (param) => {
    loadGDDrivesReq(param).then((res) => {
      drivesList.value = res.data;
    }).catch((e) => {
      drivesList.value = [];
    })
  }

  return { drivesList }
}

let { drivesList } = useGDUtil();


/**
 * sharepoint 工具
 */
let useSharePointUtil = () => {
  let sharepointSites = ref([]);
  let sharepointSiteLists = ref([]);

  const isSharePoint = (type) => {
    return type.indexOf('sharepoint') !== -1;
  }

  const getSharePointType = (storageType) => {
    return storageType === 'sharepoint' ? 'Standard' : 'China';
  }

  watch(() => storageItem.value.storageSourceAllParam.accessToken, (newVal) => {
    if (newVal) {
      loadSharePointSites();
    }
  })

  const loadSharePointSites = () => {
    let storageType = storageItem.value.type;
    if (isSharePoint(storageType)) {
      let param = {
        type: getSharePointType(storageType),
        accessToken: storageItem.value.storageSourceAllParam.accessToken
      }

      loadSharePointSitesReq(param).then((res) => {
        sharepointSites.value = res.data;
      })
    }
  }

  watch(() => storageItem.value.storageSourceAllParam.siteId, (newVal) => {
    if (newVal) {
      loadSharePointSiteLists();
    }
  })

  const loadSharePointSiteLists = () => {
    let storageType = storageItem.value.type;
    if (isSharePoint(storageType)) {
      let param = {
        type: getSharePointType(storageType),
        accessToken: storageItem.value.storageSourceAllParam.accessToken,
        siteId: storageItem.value.storageSourceAllParam.siteId
      }

      loadSharePointSiteListsReq(param).then((res) => {
        sharepointSiteLists.value = res.data;
      })
    }
  }

  return { sharepointSites, sharepointSiteLists, isSharePoint }
}
let { sharepointSites, sharepointSiteLists, isSharePoint } = useSharePointUtil();

/**
 * 获取存储策略的参数列表, 及监听切换存储策略时, 自动重新加载参数列表.
 */
let useLoadStorageSourceParamList = () => {
  // 监听切换存储策略
  watch(() => storageItem.value.type, (newVal) => {
    loadStorageSourceParamList(newVal);
  })

  // 获取指定存储策略的所有参数
  let storageSourceParamList = ref([]);
  let fieldShowMap = ref({});

  const loadStorageSourceParamList = (storageType) => {
    if (!storageType) {
      return;
    }
    storageParamsReq({storageType}).then((res) => {
      storageSourceParamList.value = res.data;
      for (let storageSourceParam of storageSourceParamList.value) {
        // 如果不是编辑状态，且有默认值，则设置默认值
        if (!isEditMode.value && storageSourceParam.defaultValue) {
          storageSourceParam.defaultValue = convertStr(storageSourceParam.defaultValue);
          storageItem.value.storageSourceAllParam[storageSourceParam.key] = storageSourceParam.defaultValue;
        } else if (storageSourceParam.key === 'redirectUri' && !storageItem.value.storageSourceAllParam[storageSourceParam.key]) { // 如果是 redirectUri, 且没有值, 则设置默认值
          storageItem.value.storageSourceAllParam[storageSourceParam.key] = storageSourceParam.defaultValue;
        }

        if (storageSourceParam.hidden === true) {
          fieldShowMap.value[storageSourceParam.key] = false;
          continue;
        }
        if (storageSourceParam.condition === "") {
          fieldShowMap.value[storageSourceParam.key] = true;
        } else {
          fieldShowMap.value[storageSourceParam.key] = computed(() => {
            const predicate = (conditionField, conditionValue, conditionSymbol) => {
              // 如果依赖的字段不显示, 则不用判断条件，直接返回 false，如果字段以 ? 结尾，则表示不用判断关联字段是否显示
              let ignoreRelatedField = conditionField.endsWith("?");
              if (ignoreRelatedField) {
                conditionField = conditionField.replace("?", "");
              }
              if (!ignoreRelatedField && fieldShowMap.value[conditionField] === false) {
                return false;
              }

              conditionValue = convertStr(conditionValue);

              if (conditionSymbol === '==') {
								if (conditionValue === '') {
									return storageItem.value.storageSourceAllParam[conditionField] === conditionValue || storageItem.value.storageSourceAllParam[conditionField] === null;
								}
                return storageItem.value.storageSourceAllParam[conditionField] === conditionValue;
              } else if (conditionSymbol === '!=') {
                return storageItem.value.storageSourceAllParam[conditionField] !== conditionValue;
              } else {
                return true;
              }
            }
            const parseConditionItem = (item) => {
              let conditionSymbol;
              if (item.indexOf("==") !== -1) {
                conditionSymbol = '==';
              } else if (item.indexOf("!=") !== -1) {
                conditionSymbol = '!=';
              } else {
                alert(`不支持的表达式 ${item}`);
              }

              let [conditionField, conditionValue] = item.split(conditionSymbol);
              return predicate(conditionField, conditionValue, conditionSymbol);
            }

            // 如 'enableProxyDownload==true||token!=null'
            let condition = storageSourceParam.condition;

            // 如果是 || 条件，只要有一个条件满足即可，但这里要不能短路，要全部判断，因为涉及到依赖字段的显示隐藏(如判断条件依赖的字段是隐藏状态，那么当前字段也应该隐藏)
            if (condition.indexOf("||") !== -1) {
              return condition.split("||").some(item => parseConditionItem(item))
            } else if (condition.indexOf("&&") !== -1) {  // 如果是 && 条件
              return condition.split("&&").every(item => parseConditionItem(item))
            } else {
              return parseConditionItem(condition);
            }
          });
        }
      }
    })
  }

  return { storageSourceParamList, fieldShowMap }
}
let { storageSourceParamList, fieldShowMap } = useLoadStorageSourceParamList();

watch(() => storageSourceParamList.value, (newVal) => {
  if (newVal) {
      rules.value = {
        ...rules.value,
        ...newVal.reduce((acc, item) => {
          if (item.required) {
            acc[`storageSourceAllParam.${item.key}`] = [{required: true, message: `${item.name}不能为空`}];
          }
          return acc;
        }, {})
      }
  }
})


/**
 *  复制
 */
let copyText = (text) => {
  toClipboard(text).then(() => {
    ElMessage.success('复制成功');
  });
}

const showSchemaTips = computed(() => {
  return window.location.protocol === 'https:' && storageItem.value.storageSourceAllParam['domain'].indexOf('http://') === 0
})


const trimInputFields = [
  'endPoint',
  'accessKey',
  'secretKey',
  'accessToken',
  'refreshToken',
  'secretId',
  'clientId',
  'clientSecret'
]

const serverAddress = computed(() => {
	return siteSetting.value?.forceBackendAddress || globalConfigStore.serverAddress
});

const inputIsReadOnly = (key) => {
	if (storageItem.value.type === 'open115' && (key === 'accessToken' || key === 'refreshToken') ) {
		return true;
	}
	return false;
}

const onOpen115LoginSuccess = (data) => {
	storageItem.value.storageSourceAllParam['accessToken'] = data.accessToken;
	storageItem.value.storageSourceAllParam['refreshToken'] = data.refreshToken;
	storageItem.value.storageSourceAllParam['refreshTokenExpiredAt'] = data.expiredAt;
}

</script>

<style scoped>

.zfile-storage-edit >>> .el-form-item-input > .el-select {
  width: 100%;
}

</style>

<route lang="yaml">
meta:
  layout: admin
  name: 新增存储源
</route>