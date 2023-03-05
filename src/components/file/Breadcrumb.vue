<template>
  <nav class="flex w-full" ref="parentEl">
    <ol role="list" ref="breadcrumbEl" class="z-breadcrumbs">
      <li v-if="$slots['breadcrumb-item']">
        <div class="z-breadcrumbs__item">
          <a class="ml-3 text-[13px]"><slot name="breadcrumb-item"/></a>
        </div>
      </li>
      <template v-else>
        <li v-if="isOverflowing && foldBreadcrumb.fold?.length > 0" class="z-breadcrumbs__fold">
          <div class="z-breadcrumbs__item">
            <el-dropdown popper-class="z-breadcrumbs__popper" trigger="click" placement="bottom-start">
              <span class="el-dropdown-link">
                <a class="z-breadcrumbs__ellipsis">
                  ···
                </a>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="(item, index) in foldBreadcrumb.fold" :key="index">
                    <router-link :to="item?.href">
                      <a @click="clickBreadcrumb(item)" :href="item?.href" class="text-gray-500 hover:text-gray-700">
                        {{ item?.name }}
                      </a>
                    </router-link>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </li>
        <li v-for="(item, index) in foldBreadcrumb.fold" class="absolute -left-96 -top-96 h-0" :key="item.name">
          <div class="z-breadcrumbs__item">
            <router-link :to="item.href">
              <a @click="clickBreadcrumb(item)" :href="item.href" :class="index === foldBreadcrumb.show.length - 1 ? 'disable' : ''" class="z-breadcrumbs__text">{{ item.name }}</a>
            </router-link>
          </div>
        </li>
        <li v-for="(item, index) in foldBreadcrumb.show" :key="item.name">
          <div class="z-breadcrumbs__item">
            <ChevronRightIcon class="z-breadcrumbs__icon" v-if="item !== props.items[0]" />
            <router-link :to="item.href">
              <a @click="clickBreadcrumb(item)" :href="item.href" :class="index === foldBreadcrumb.show.length - 1 ? 'disable' : ''" class="z-breadcrumbs__text">{{ item.name }}</a>
            </router-link>
          </div>
        </li>
      </template>
    </ol>
  </nav>
</template>

<script setup>
import { ChevronRightIcon } from '@heroicons/vue/solid'
import { useElementBounding } from '@vueuse/core'

// 组件接收的参数
let props = defineProps({
  items: {
    type: Array,
    default: []
  },
  thresholdWidth: {
    type: Number,
    default: 100
  }
})

// 定义一个面包屑点击事件，允许外部调用
const emit = defineEmits()
const clickBreadcrumb = (item) => {
  emit('breadcrumb-click', item)
}

// 面包屑间隔宽度
const spaceWidth = 12 + 20;

// 面包屑元素和父元素
const breadcrumbEl = ref(null);
const parentEl = ref(null);

// 面包屑的宽度和父元素的宽度
const { width } = useElementBounding(breadcrumbEl)
const { width:parentWidth } = useElementBounding(parentEl)

// 面包屑宽度是否移除
const isOverflowing = computed(() => {
  return width + props.thresholdWidth > parentWidth
})

// 获取元素的实际宽度，包括 margin 值
const getElementWidth = (element) => {
  // 获取元素的矩形对象
  let boundingClientRect = element.getBoundingClientRect();
  return boundingClientRect.width;
}

const breadcrumbElWidthInfo = ref({
  ellipsisWidth: 0,
  totalWidth: 0,
  totalWidths: []
});

import { useResizeObserver } from '@vueuse/core'
// 面包屑宽度变化时，重新计算面包屑各个块的宽度
useResizeObserver(breadcrumbEl, (entries) => {
  let ellipsisWidth = 0, totalWidth = 0;
  let totalWidths = [];

  const target = entries[0].target;
  const children = target.children;

  for (let i = 0; i < children.length; i++) {

    // 获取元素的矩形对象
    let element = children[i];
    let itemWidth = getElementWidth(element.querySelector("a"));

    // 折叠块
    if (element.classList.contains('z-breadcrumbs__fold')) {
      ellipsisWidth = itemWidth;
      // 折叠块宽度
    } else if (element.classList.contains('hidden')) {
      totalWidth += itemWidth;
      totalWidths.push(itemWidth);
      // 显示块宽度
    } else {
      totalWidth += itemWidth;
      totalWidths.push(itemWidth);
    }
  }

  // console.log('\n');
  // console.log("[z-breadcrumb]. 父页面宽度为：", parentWidth.value,
  //   "省略号宽度和", ellipsisWidth,
  //   "所有元素宽度列", totalWidth,
  //   "所有元素宽度列表", totalWidths);
  breadcrumbElWidthInfo.value = {
    ellipsisWidth,
    totalWidth,
    totalWidths
  };
})

// 缓存的面包屑折叠和收起数据
const cacheFoldBreadcrumb = ref(null);
// 面包屑缓存宽度区间，当父页面宽度在该区间内，不需要重新计算面包屑折叠
const cacheParentSizeRange = ref({
  min: -1,
  max: -1
});


// 面包屑折叠数据状态，超出宽度后会自动折叠，直到不超出宽度，分别使用 show 和 fold 两个数组存储
const foldBreadcrumb = computed(() => {
  let fold = [];
  let show = props.items.slice(0);

  // 如果面包屑没有数据，直接返回
  if (props.items.length === 0 || breadcrumbElWidthInfo.value.totalWidth === 0) {
    console.debug(`[z-breadcrumb] 面包屑没有数据或还未渲染完成，直接返回所有数据不折叠`)
    cacheFoldBreadcrumb.value = { fold, show };
    return { fold, show }
  }

  // 如果面包屑数据还没有渲染完成，等待渲染完成
  let brWidthArray = breadcrumbElWidthInfo.value.totalWidths;
  let isRenderFinish = props.items.length === brWidthArray.length;

  // 如果父页面的宽度在缓存的安全宽度范围内，且缓存的数据个数未变化，直接返回缓存的折叠数据
  let isSafeWidth = cacheParentSizeRange.value.min <= parentWidth.value &&  parentWidth.value <= cacheParentSizeRange.value.max;
  let isNotChangeItems = props.items.length === cacheFoldBreadcrumb.value?.fold.length + cacheFoldBreadcrumb.value?.show.length;
  if (isSafeWidth && isNotChangeItems) {
    console.debug(`[z-breadcrumb] 当前父页面宽度 ${parentWidth.value} 在缓存的安全宽度范围内 ${cacheParentSizeRange.value.min} - ${cacheParentSizeRange.value.max}，直接返回缓存的数据`);
    return cacheFoldBreadcrumb.value;
  }

  // 给 props.items 中每个元素添加宽度属性
  brWidthArray.forEach((item, index) => {
    if (props.items[index] !== undefined) {
      props.items[index].width = item;
    }
  });

  let currentFullWidth = breadcrumbElWidthInfo.value.totalWidth;
  // 总占用宽度 = 当前所有元素宽度 + 阈值宽度 + 省略号宽度 + (元素个数 - 1) * 空格宽度
  currentFullWidth += props.thresholdWidth + breadcrumbElWidthInfo.value.ellipsisWidth + (props.items.length - 1) * spaceWidth;

  let lastFoldWidth = 0;

  // 如果超出宽度，且当前面包屑数据长度大于 1，就折叠
  while (currentFullWidth > parentWidth.value) {
    let item = show.shift();
    if (!item) {
      break;
    }
    fold.push(item);
    let itemWidth = item.width + (fold.length === 1 ? 0 :spaceWidth);
    console.log(`[z-breadcrumb] 折叠了 ${item.name}, 元素宽度为 ${itemWidth}, 当前宽度 ${currentFullWidth}, 父页面宽度 ${parentWidth.value}, 折叠后宽度为 ${(currentFullWidth - itemWidth)}`);
    currentFullWidth -= itemWidth;
    lastFoldWidth = item.width;
  }


  cacheParentSizeRange.value = {
    min: currentFullWidth + props.thresholdWidth + (breadcrumbElWidthInfo.value.ellipsisWidth || (fold.length === 0 || 50)),
    max: lastFoldWidth ? (currentFullWidth + lastFoldWidth) : 999999
  };

  if (isRenderFinish) {
    cacheFoldBreadcrumb.value = {
      fold,
      show
    }
  } else {
    cacheFoldBreadcrumb.value = {
      fold: [],
      show: []
    }
    console.log('[z-breadcrumb] 当前面包屑数据还没有渲染完成，故本地不缓存数据');
  }

  // console.log('[z-breadcrumb] 返回结果为: ', { fold, show },
  //   ', 最终宽度为: ', currentFullWidth,
  //   `, 缓存的安全宽度范围为: ${cacheParentSizeRange.value.min} - ${cacheParentSizeRange.value.max}`,
  //   ', 父页面宽度为: ', parentWidth.value,
  //   ', 原始元素为:' , props.items,
  //   ',brWidthArray:', brWidthArray);

  return {
    fold,
    show
  };
})


</script>

<style scoped lang="scss">
.z-breadcrumbs {
  @apply flex flex-wrap items-center space-x-3;

  .z-breadcrumbs__item {
    @apply flex items-center;
  }
  .z-breadcrumbs__icon {
    @apply flex-shrink-0 h-5 w-5 text-gray-400;
  }
  .z-breadcrumbs__ellipsis {
    @apply ml-3 text-sm font-black text-gray-700 hover:text-gray-900;
  }
  .z-breadcrumbs__text {
    @apply ml-3 text-[13px] font-semibold text-gray-500 hover:text-gray-700;

    &.disable {
      @apply text-gray-400 font-normal pointer-events-none;
    }
  }
}
</style>