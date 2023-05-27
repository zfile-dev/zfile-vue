<template>
  <nav class="flex w-full relative z-breadcrumbs-root" ref="parentEl">
    <ol role="list" ref="breadcrumbEl" class="z-breadcrumbs">
      <li v-for="item in foldBreadcrumb.head" :key="item.name">
        <div class="z-breadcrumbs__item">
          <ChevronRightIcon class="z-breadcrumbs__icon" v-if="item !== props.items[0]" />
          <a @click.prevent.stop="clickBreadcrumb(item)" :href="item.href" class="z-breadcrumbs__text">{{ item.name }}</a>
        </div>
      </li>
      <li v-if="$slots['breadcrumb-item']">
        <div class="z-breadcrumbs__item">
          <a class="ml-3 text-[13px]"><slot name="breadcrumb-item"/></a>
        </div>
      </li>
      <template v-else>
        <li v-if="foldBreadcrumb.fold?.length > 0" class="z-breadcrumbs__fold">
          <div class="z-breadcrumbs__item">
            <ChevronRightIcon class="z-breadcrumbs__icon" v-if="foldBreadcrumb.head.length > 0" />
            <el-dropdown popper-class="z-breadcrumbs__popper" trigger="click" placement="bottom-start">
              <span class="el-dropdown-link">
                <a class="z-breadcrumbs__ellipsis">
                  ···
                </a>
              </span>
              <template #dropdown>
                <el-dropdown-menu class="w-48 sm:w-72">
                  <el-dropdown-item v-for="(item, index) in foldBreadcrumb.fold" :key="index" @click.prevent.stop="clickBreadcrumb(item)">
                    <a :href="item?.href"
                       :class="[item === props.items[props.items.length - 1] ? 'cursor-not-allowed text-gray-300' : 'text-gray-600 hover:text-gray-700 font-semibold', '  max-w-md overflow-ellipsis overflow-hidden whitespace-nowrap']">
                      {{ item?.name }}
                    </a>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </li>
        <li v-for="(item, index) in foldBreadcrumb.show" :key="item.name">
          <div class="z-breadcrumbs__item">
            <ChevronRightIcon class="z-breadcrumbs__icon" v-if="item !== props.items[0]" />
            <a @click.prevent.stop="clickBreadcrumb(item)" :href="item.href" :class="index === foldBreadcrumb.show.length - 1 ? 'disable' : ''" class="z-breadcrumbs__text">{{ item.name }}</a>
          </div>
        </li>
      </template>
    </ol>

    <!-- 辅助渲染面包屑，用于获取每个子元素的宽度 -->
    <ol role="list" ref="hideBreadcrumbEl" class="!flex-nowrap z-breadcrumbs invisible absolute">
      <li v-for="item in props.items" :key="item.name">
        <div class="z-breadcrumbs__item">
          <ChevronRightIcon class="z-breadcrumbs__icon" v-if="item !== props.items[0]" />
          <a @click.prevent.stop="clickBreadcrumb(item)" :href="item.href" class="z-breadcrumbs__text">{{ item.name }}</a>
        </div>
      </li>
    </ol>
    <a class="z-breadcrumbs__ellipsis invisible absolute" ref="hideBreadcrumbEllipsisEl">
      ···
    </a>
  </nav>
</template>

<script setup>
import { ChevronRightIcon } from '@heroicons/vue/24/solid'
import { useResizeObserver } from '@vueuse/core'

// 组件接收的参数
let props = defineProps({
  items: {
    type: Array,
    default: []
  },
  keepShowHeadSize: {
    type: Number,
    default: 1
  }
})

// 组件回调的事件
// 定义一个面包屑点击事件，允许外部调用
const emit = defineEmits()
const clickBreadcrumb = (item) => {
  emit('breadcrumb-click', item)
}


// 面包屑元素和隐藏面包屑元素
const parentEl = ref(null);
const breadcrumbEl = ref(null);
const hideBreadcrumbEl = ref(null);
const hideBreadcrumbEllipsisEl = ref(null);

const itemsWidthArr = ref([]);
const itemsWidthSum = ref(0);
const parentWidth = ref(0);

// 页面宽度变化时，重新计算面包屑
useResizeObserver(parentEl, (entries) => {
  resizeFunction(entries);
})

// 面包屑元素宽度变化时，重新计算面包屑
useResizeObserver(hideBreadcrumbEl, (entries) => {
  resizeFunction(entries);
})

const resizeFunction = (entries) => {
  const target = entries[0].target;

  let children;
  if (target.className.includes('z-breadcrumbs-root')) {
    children = target.children[1].children;
    parentWidth.value = getElementWidth(target);
  } else if (target.className.includes('z-breadcrumbs')) {
    children = target.children;
    parentWidth.value = getElementWidth(target.parentElement);
  } else {
    return;
  }

  // 如果没有子元素，直接返回, 说明面包屑没有数据或还未渲染完成
  if (children.length === 0) {
    return;
  }

  // 获取每个元素的宽度, 并赋值给面包屑数据
  itemsWidthSum.value = 0;
  for (let i = 0; i < children.length; i++) {
    let element = children[i];
    itemsWidthArr.value[i] = getElementWidth(element);
    itemsWidthSum.value += itemsWidthArr.value[i];
  }

  // 计算面包屑折叠数据
  computeFoldBreadcrumb();
}

// 面包屑折叠和显示的数据列表
const foldBreadcrumb = ref({
  head: [],
  fold: [],
  show: []
});

// 根据面包屑数据计算面包屑折叠数据
const computeFoldBreadcrumb = () => {
  let items = props.items.slice(0);
  let head = [];
  let fold = [];
  let show = items.slice(0);

  // 如果需要保留第一个面包屑，就把第一个面包屑放到面包屑头部，然后从面包屑数据中删除第一个面包屑
  if (props.keepShowHeadSize > 0) {
    head = items.slice(0, props.keepShowHeadSize);
    items = items.slice(props.keepShowHeadSize);
    show = items.slice(0);
  }

  let baseWidth = 0;

  // 如果所有元素总宽度大于父元素宽度，就需要折叠面包屑，基础宽度需要加上面包屑块的宽度
  let overflow = itemsWidthSum.value > parentWidth.value;
  if (overflow) {
    // 获取面包屑折叠块的宽度
    let ellipsisWidth = getElementWidth(hideBreadcrumbEllipsisEl.value);
    baseWidth += ellipsisWidth;
    console.log(`[z-breadcrumb] 所有面包屑元素宽度和大于父元素宽度，增加基础宽度：${ellipsisWidth}, 总基础宽度：${baseWidth}`);
  }

  // 如果需要保留第前 N 个面包屑，基础宽度就需要加上前 N 个面包屑的宽度
  if (props.keepShowHeadSize > 0) {
    for (let i = 0; i < props.keepShowHeadSize; i++) {
      baseWidth += itemsWidthArr.value[i];
      console.log(`[z-breadcrumb] 需要保留第 ${i + 1} 个面包屑，增加基础宽度: ${itemsWidthArr.value[i]}, 总基础宽度 ${baseWidth}`);
    }
    if (overflow) {
      baseWidth += (12 + 20);
      console.log(`[z-breadcrumb] 所有面包屑元素宽度和大于父元素宽度，增加与前 ${props.keepShowHeadSize} 个保留的面包屑之间的基础宽度：${12 + 20}, 总基础宽度：${baseWidth}`);
    }
  }
  let showWidthSum = baseWidth;
  // 从后往前遍历，计算出满足页面宽度的面包屑，直到不满足页面宽度，就把剩余的面包屑折叠
  for (let i = items.length - 1; i >= 0; i--) {
    let item = items[i];
    let itemWidth = itemsWidthArr.value[i + head.length];
    showWidthSum += itemWidth;
    if (showWidthSum > parentWidth.value) {
      showWidthSum -= itemWidth;
      show = items.slice(i + 1);
      fold = items.slice(0, i + 1);
      console.log(`[z-breadcrumb] 当前面包屑 ${item.name} 元素宽度：${itemWidth}, 显示总宽度 ${showWidthSum + itemWidth} 已超出父元素宽度：${parentWidth.value}, 将折叠面包屑：${fold.map(item => (item.name + '(' + itemWidth + ')'))}, 折叠后总宽度为:  ${showWidthSum}`);
      break;
    } else {
      console.log(`[z-breadcrumb] 当前面包屑 ${item.name} 元素宽度：${itemWidth}, 父元素宽度：${parentWidth.value}, 显示总宽度: ${showWidthSum}, 无需折叠`);
    }
  }

  foldBreadcrumb.value = { head, fold, show };
}


// 获取元素的实际宽度，包括 margin-left 和 margin-right 值
const getElementWidth = (element) => {
  let boundingClientRect = element.getBoundingClientRect();
  return boundingClientRect.width + parseFloat(getComputedStyle(element).marginLeft) + parseFloat(getComputedStyle(element).marginRight);
}
</script>

<style scoped lang="scss">
.z-breadcrumbs {
  @apply flex flex-wrap overflow-hidden items-center space-x-3;

  .z-breadcrumbs__item {
    @apply flex items-center;
  }
  .z-breadcrumbs__icon {
    @apply flex-shrink-0 h-5 w-5 text-gray-400;
  }
  .z-breadcrumbs__text {
    @apply ml-3 text-[13px] font-semibold text-gray-600 hover:text-gray-700;

    &.disable {
      @apply text-gray-400 pointer-events-none;
    }
  }
}

.z-breadcrumbs__ellipsis {
  @apply ml-3 text-sm font-black text-gray-700 hover:text-gray-900;
}
</style>
