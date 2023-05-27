<template>
  <div class="flex flex-wrap">
    <div v-for="(item, index) in items" :key="index" class="mb-4 w-full">
      <div class="flex items-center">
        <el-input-number v-model="item.value" :min="1" :max="getUnitMax(item.unit)" :disabled="item.unit === 'forever'"></el-input-number>
        <el-select v-model="item.unit" fit-input-width class="ml-3 w-20">
          <el-option
            v-for="unit in timeUnitArr"
            :key="unit.value"
            :label="unit.label"
            :value="unit.value">
          </el-option>
        </el-select>

        <button v-show="index !== 0"
                type="button"
                @click="moveUp(index)"
                class="ml-2 py-2 px-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-700 focus:outline-none font-bold">
					<ArrowUpIcon class="h-4"></ArrowUpIcon>
				</button>
        <button v-show="index !== items.length - 1"
                type="button"
                @click="moveDown(index)"
                class="ml-2 py-2 px-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-700 focus:outline-none font-bold">
					<ArrowDownIcon class="h-4"></ArrowDownIcon>
				</button>
				<button v-show="index === items.length - 1"
								type="button"
								@click="addItem(index + 1)"
								class="ml-2 py-2 px-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-700 focus:outline-none font-bold">
					<PlusIcon class="h-4"></PlusIcon>
				</button>
        <button type="button"
								v-show="items.length > 1"
                @click="remove(index)"
                class="ml-2 py-2 px-2 rounded-md bg-red-500 text-white hover:bg-red-600 focus:bg-red-700 focus:outline-none font-bold">
					<MinusIcon class="h-4"></MinusIcon>
				</button>
      </div>
      <small class="ml-3 text-gray-500">{{ item.formatted }}</small>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { PlusIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/vue/24/solid'

import { getUnitMax, timeUnitArr } from "~/tool/unit";

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
})

const items = ref(props.modelValue ? props.modelValue : [{ value: "1", unit: "d", second: 86400 }]);

const addItem = (index) => {
  items.value.splice(index, 0, { value: "", unit: "s" });
};

const emit = defineEmits(['update:modelValue'])
watch(items, (newItems) => {
  emit("update:modelValue", newItems);
});

// 上移
const moveUp = (index) => {
  if (index === 0) return;
  const item = items.value[index];
  items.value.splice(index, 1);
  items.value.splice(index - 1, 0, item);
};

// 下移
const moveDown = (index) => {
  if (index === items.value.length - 1) return;
  const item = items.value[index];
  items.value.splice(index, 1);
  items.value.splice(index + 1, 0, item);
};

// 删除
const remove = (index) => {
  items.value.splice(index, 1);
};
</script>

<style>
/* Tailwindcss class styles can be added here */
</style>
