<template>
  <img id="zfile-home-logo" @click="openLink" v-if="storageConfigStore.globalConfig.siteHomeLogo"
       :src="storageConfigStore.globalConfig.siteHomeLogo"
       class="my-auto h-6 mr-2 cursor-pointer">
</template>

<script setup>

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

const openLink = () => {
  if (storageConfigStore.globalConfig.siteHomeLogoLink) {
    if (storageConfigStore.globalConfig.siteHomeLogoTargetMode === "_blank") {
      window.open(storageConfigStore.globalConfig.siteHomeLogoLink);
    } else {
      location.href = storageConfigStore.globalConfig.siteHomeLogoLink;
    }
  }
}

</script>

<style scoped>

</style>