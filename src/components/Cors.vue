<template>
  <div class="zfile-cors-wrapper">
    <el-button @click="openDrawer('add', null)" type="primary">新增配置</el-button>
    <el-tooltip content="检测到当前跨域配置异常，可能会影响在线预览、上传等功能，请点击添加推荐配置" placement="top">
      <el-button v-show="!isRecommendConfig" @click="addRecommendConfig" type="success">添加推荐配置</el-button>
    </el-tooltip>
    <el-table :data="corsConfig" width="100%">
      <el-table-column prop="allowedOrigins" label="允许来源" show-overflow-tooltip></el-table-column>
      <el-table-column prop="allowedMethods" label="允许Method" show-overflow-tooltip></el-table-column>
      <el-table-column prop="allowedHeaders" label="允许Headers" show-overflow-tooltip></el-table-column>
      <el-table-column prop="exposeHeaders" label="暴露Headers" show-overflow-tooltip></el-table-column>
      <el-table-column prop="maxAgeSeconds" width="110" label="缓存时间(秒)" show-overflow-tooltip></el-table-column>
      <el-table-column label="操作" align="center" min-width="60px">
        <template #default="{ row }">
          <div class="space-x-2">
            <i-mdi-rename-outline class="z-btn-primary" @click="openDrawer('edit', row)" />
            <TrashIcon class="z-btn-danger" @click="deleteConfig(row)" />
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-drawer class="zfile-cors-drawer-wrapper" v-model="drawerVisible"
               append-to-body
               title="跨域规则配置" :destroy-on-close="true" :close-on-click-modal="false"
               :size="isMobile ? '80%' : '30%'">
      <template #header>
        <div class="zfile-cors-drawer-title">
          <div class="mr-2">跨域规则配置</div>
          <a target="_blank" class="text-xs my-auto link" type="success" href="https://docs.aws.amazon.com/zh_cn/AmazonS3/latest/userguide/ManageCorsUsing.html">
            参考文档
          </a>
        </div>
      </template>
      <el-form :model="form"
               :label-width="globalConfigStore.adminForm.labelWidth"
               :label-position="globalConfigStore.adminForm.labelPosition"
               :size="globalConfigStore.adminForm.size"
               status-icon
               class="z-admin-form"
               ref="corsFormRef"
               :rules="rules">
        <el-form-item label="来源" prop="allowedOriginsStr">
          <el-input v-model="form.allowedOriginsStr" type="textarea" placeholder="请输入允许来源，如 https://xxx.com 或 http://192.168.0.1" :autosize="{ minRows: 3, maxRows: 6 }" />
          <div class="el-form-item-tips">
            <ul class="list-disc ml-4">
              <li>来源可以设置多个，每行一个，每行最多能有一个通配符 *，每行前后不要后空格，最后不要加 /</li>
              <li>如你有多个地址/域名访问该 ZFile 服务(如家里服务器搭建，有内网，也有公网)都要配置到这里，不然可能会影响上传、下载、预览功能，后续增加其他地址访问时，记得更新这里。更详细的配置请参考存储源官方提供的文档。</li>
              <li>当前环境推荐配置: <span class="select-all">{{ currentOrigin }}</span>
              </li>
            </ul>
          </div>
        </el-form-item>
        <el-form-item label="允许方法" prop="allowedMethods">
          <el-checkbox-group v-model="form.allowedMethods">
            <el-checkbox v-for="method in allowMethods" :key="method" :value="method">
              {{ method }}
            </el-checkbox>
          </el-checkbox-group>
          <div class="el-form-item-tips">
            ZFile 需要用 GET 和 PUT 方法，其他方法请根据需求添加。
          </div>
        </el-form-item>
        <el-form-item label="允许 Headers" prop="allowedHeadersStr">
          <el-input v-model="form.allowedHeadersStr" type="textarea" placeholder="请输入允许Headers" :autosize="{ minRows: 3, maxRows: 6 }" />
          <div class="el-form-item-tips">
            允许 Headers 可以设置多个，每行一个，每行最多能有一个通配符 *。
            <br>
            ZFile 当前版本需要用 <span class="select-all">content-type</span>，其他的根据需求添加。
          </div>
        </el-form-item>
        <el-form-item label="暴露 Headers" prop="exposeHeadersStr">
          <el-input v-model="form.exposeHeadersStr" type="textarea" placeholder="请输入暴露Headers" :autosize="{ minRows: 3, maxRows: 6 }" />
          <div class="el-form-item-tips">
            暴露 Headers 可以设置多个，每行一个，不允许出现通配符 *，一般 ZFile 中使用不需要设置。
          </div>
        </el-form-item>
        <el-form-item label="缓存时间（秒）" prop="maxAgeSeconds">
          <el-input-number v-model="form.maxAgeSeconds" :min="0" label="缓存时间（秒）" :step="1" step-strictly></el-input-number>
          <div class="el-form-item-tips">
            指定在 S3 针对特定资源的预检 OPTIONS 请求作出响应后，浏览器缓存该响应的时间（以秒为单位）。通过缓存响应，在需要重复原始请求时，浏览器无需向 S3 发送预检请求。
          </div>
        </el-form-item>


        <el-form-item :label-width="globalConfigStore.adminForm.labelWidth" class="admin-from-footer">
          <el-button type="primary" :icon="CheckBadgeIcon" @click="saveConfig">保存设置</el-button>
          <el-button @click="drawerVisible = false">取消</el-button>
        </el-form-item>

      </el-form>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { isMobile } from "~/utils";

import useGlobalConfigStore from "~/stores/global-config";
import { CheckBadgeIcon } from "@heroicons/vue/24/solid";
import { TrashIcon } from "@heroicons/vue/24/outline";
const globalConfigStore = useGlobalConfigStore();

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
});

const emit = defineEmits(['update:modelValue'])
const updateCorsConfig = (newConfig) => {
  emit("update:modelValue", newConfig);
};

watch(() => props.modelValue, (newVal) => {
  corsConfig.value = newVal;
});

const corsConfig = ref(props.modelValue || []);

// 自动为每个配置项生成一个唯一的 id
corsConfig.value.forEach((config, index) => {
  if (!config.id) {
    config.id = Date.now() + index;
  }
  if (!config.allowedOrigins) {
    config.allowedOrigins = [];
  }
  if (!config.allowedMethods) {
    config.allowedMethods = [];
  }
  if (!config.allowedHeaders) {
    config.allowedHeaders = [];
  }
  if (!config.exposeHeaders) {
    config.exposeHeaders = [];
  }
  if (!config.maxAgeSeconds) {
    config.maxAgeSeconds = 0;
  }
});

const drawerVisible = ref(false);
const form = ref({
  allowedOrigins: "",
  allowedMethods: ["GET", "PUT"],
  allowedHeaders: "",
  exposeHeaders: "",
  maxAgeSeconds: 0
});

const allowMethods = ["GET", "POST", "PUT", "DELETE", "HEAD"];

function openDrawer(action, data) {
  if (action === "edit" && data) {
    form.value = {
      ...data,
      allowedOriginsStr: data.allowedOrigins.join('\n').trim(),
      allowedHeadersStr: data.allowedHeaders ? data.allowedHeaders.join('\n').trim() : '',
      exposeHeadersStr: data.exposeHeaders ? data.exposeHeaders.join('\n').trim() : ''
    };
  } else {
    form.value = {
      allowedOriginsStr: "",
      allowedMethods: ["GET", "PUT"],
      allowedHeadersStr: "content-type",
      exposeHeadersStr: "",
      maxAgeSeconds: 0
    };
  }
  drawerVisible.value = true;
}

function saveConfig() {
  corsFormRef.value.validate(checked => {
    if (checked) {
      let newConfig = {
        ...form.value,
        allowedOrigins: form.value.allowedOriginsStr.split('\n').filter(x => x.trim()),
        allowedHeaders: form.value.allowedHeadersStr.split('\n').filter(x => x.trim()),
        exposeHeaders: form.value.exposeHeadersStr.split('\n').filter(x => x.trim())
      };
      if (newConfig.id) {
        const index = corsConfig.value.findIndex(config => config.id === newConfig.id);
        corsConfig.value[index] = newConfig;
      } else {
        corsConfig.value.push({ ...newConfig, id: Date.now() });
      }
      drawerVisible.value = false;
      updateCorsConfig(corsConfig.value);
    }
  })
}

function deleteConfig(config) {
  corsConfig.value = corsConfig.value.filter(item => item !== config);
  updateCorsConfig(corsConfig.value);
}


const corsFormRef = ref(null);

const rules = {
  allowedOriginsStr: [
    { required: true, message: "请输入允许来源", trigger: "blur" }
  ],
  allowedMethods: [
    { type: 'array', required: true, message: "请选择允许方法", trigger: "change" }
  ],
};

const currentOrigin = window.location.origin;

const isRecommendConfig = computed(() => {
  return corsConfig.value.some(config => {
    return config.allowedOrigins.includes(currentOrigin) && config.allowedMethods.includes("GET") && config.allowedMethods.includes("PUT");
  });
});

const addRecommendConfig = () => {
  if (!isRecommendConfig.value) {
    corsConfig.value.push({
      id: Date.now(),
      allowedOrigins: [currentOrigin],
      allowedMethods: ["GET", "PUT"],
      allowedHeaders: ["content-type"],
      exposeHeaders: [],
      maxAgeSeconds: 0
    });
    updateCorsConfig(corsConfig.value);
  }
};
</script>

<style lang="scss">

.zfile-cors-wrapper {
  @apply w-full;
}

.zfile-cors-drawer-wrapper {
  @apply min-w-[400px];
  .el-drawer__header {
    @apply mb-0 border-b pb-4;
    .el-drawer__title {
      @apply font-bold text-black;
    }
  }

  .z-admin-form {
    @apply p-4;
  }

  .el-drawer__body {
    @apply p-0;
    .el-form {
      .el-form-item-tips {
        @apply text-xs;
      }
    }
  }
}
</style>