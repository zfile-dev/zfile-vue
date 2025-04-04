<template>
	<div class="flex flex-wrap w-full" v-if="items">
		<div v-for="(item, index) in props.modelValue" :key="item.second" class="mb-4 w-full">
			<div class="flex items-center">
				<el-input-number class="min-w-[100px]" v-model="item.value" :min="1" :max="getUnitMax(item.unit)"
                         @change="computeSecond(item)"
                         :disabled="item.unit === 'forever'"></el-input-number>
				<el-select @change="computeSecond(item)" v-model="item.unit" class="ml-1 min-w-[75px]">
					<el-option
            v-for="unit in constant.timeUnitArr"
						:key="unit.value"
						:label="unit.label"
						:value="unit.value">
					</el-option>
				</el-select>

				<button :class="index === 0 ? 'invisible' : 'visible'"
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
import { generateSeconds, getUnitMax } from "~/utils";
import { PlusIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon } from "@heroicons/vue/24/solid";

const props = defineProps({
	modelValue: {
		type: Array,
		required: true
	}
});

const items = ref(props.modelValue ? props.modelValue : [{ value: "1", unit: "d", second: 86400 }]);

const emit = defineEmits(["update:modelValue"]);
watch(items, (newItems) => {
	emit("update:modelValue", newItems);
}, { deep: true });

const addItem = (index) => {
  items.value.splice(index, 0, { value: 1, unit: "s", second: 1 });
};

const moveUp = (index) => {
	if (index === 0) return;
	const item = items.value[index];
	items.value.splice(index, 1);
	items.value.splice(index - 1, 0, item);
};

const moveDown = (index) => {
	if (index === items.value.length - 1) return;
	const item = items.value[index];
	items.value.splice(index, 1);
	items.value.splice(index + 1, 0, item);
};

const remove = (index) => {
	items.value.splice(index, 1);
};

const computeSecond = (item) => {
  item.seconds = generateSeconds(item);
};
</script>