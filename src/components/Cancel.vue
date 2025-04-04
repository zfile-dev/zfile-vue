<template>
  <admin-form-header>
    <template #title>
      <div class="flex justify-items-center">
        <router-link :to="to">
          <i-mdi-arrow-left class="my-auto h-full mr-2 cursor-pointer" />
        </router-link>
        <div class="flex">
          <span>{{ title }}</span>
          <span v-show="pro" class="badge-blue">Pro</span>
        </div>
      </div>
    </template>
    <template #subTitle>
      <slot />
    </template>
  </admin-form-header>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  pro: {
    type: Boolean,
    default: false
  }
})
</script>