<template>
  <div>
    <el-button @click="generateQrCode(appId)">
      登录115账号
    </el-button>
    <div class="mt-2">
      <el-image class="w-40" :src="qrCode" v-if="qrCode" />
    </div>

    <div class="text-sm text-gray-500">
      <div v-if="qrCodeStatus.status === 'init'">请点击登录115账号</div>
      <div v-if="qrCodeStatus.status === 'waiting'">请扫码</div>
      <div v-if="qrCodeStatus.status === 'scanning'">{{ qrCodeStatus.msg }}</div>
      <div v-if="qrCodeStatus.status === 'error'" class="text-red-500">{{ qrCodeStatus.msg }}</div>
      <div v-if="qrCodeStatus.status === 'success'" class="text-green-500">{{ qrCodeStatus.msg }}</div>
    </div>
  </div>
</template>

<script setup>
import useOpen115Util from '~/composables/admin/storage/utils/open115-util'
const { generateQrCode, qrCode, qrCodeStatus } = useOpen115Util();

defineProps({
  appId: {
    type: String,
    required: true
  },
})

const emit = defineEmits(['success'])

watch(qrCodeStatus, (newVal) => {
  if (newVal.status === 'success') {
    emit('success', newVal)
  }
})
</script>