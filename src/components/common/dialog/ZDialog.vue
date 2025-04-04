<template>
  <div class="z-dialog-wrapper">
    <el-dialog
      v-bind="attrs"
      :model-value="modelValue"
      :draggable="draggable"
      :show-close="false"
      :fullscreen="attrs?.fullscreen ?? isFullscreen"
      :before-close="handleNativeClose"
    >
      <template #header>
        <div class="z-dialog-title">
         {{ title }}
        </div>
        <div class="z-dialog-title-btns">
          <el-icon v-if="isFullScreenBtn" @click="handleFullscreen"><ArrowsPointingOutIcon /></el-icon>
          <el-icon size="20" @click="handleClose('close')"><XMarkIcon /></el-icon>
        </div>
      </template>

      <div class="z-dialog-content" v-loading="loading">
        <slot></slot>
      </div>

      <template #footer>
        <span v-if="!slots.footer && showFooter" class="z-dialog-footer">
          <el-button type="primary" @click="handleConfirm">{{ confirmText }}</el-button>
          <el-button @click="handleClose('cancel')">{{ cancelText }}</el-button>
        </span>
        <slot v-else name="footer"></slot>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, useAttrs, useSlots } from "vue";
import { ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { ElDialog, ElIcon, ElButton } from "element-plus";
import { DialogCloseType, PropsType } from "./types";

const attrs = useAttrs();
const slots = useSlots();

const props = withDefaults(defineProps<PropsType>(), {
  title: "",
  isDraggable: false,
  modelValue: false,
  hiddenFullBtn: false,
  loading: false,
  confirmText: "确认",
  cancelText: "关闭",
  destroyOnClose: false,
  draggable: false,
  autoFullScreen: false,
  onClose: null,
  showFooter: true,
});

const emits = defineEmits<{
  (e: "update:modelValue"): void;
  (e: "confirm"): void;
  (e: "close", type: DialogCloseType): void;
}>();

const isFullscreen = ref(props.autoFullScreen ? window.innerWidth < 768 : false);
const isFullScreenBtn = computed(() => {
  // 如果指定了原生的 fullscreen 属性，则不显示全屏按钮
  if (attrs?.fullscreen) return false;
  return !props.hiddenFullBtn;
});

const handleFullscreen = () => {
  // 如果指定了原生的 fullscreen 属性，则不响应全屏按钮的操作
  if (attrs?.fullscreen) return;
  isFullscreen.value = !isFullscreen.value;
};

// 发生了原生的关闭事件(点击遮罩，按 esc 键)
const handleNativeClose = () => {
  handleClose("close");
};

const handleClose = (type: DialogCloseType) => {
  // 如果定义了原生的 before-close 属性，则先执行 before-close 方法
  if (Reflect.has(attrs, "before-close") && typeof attrs["before-close"] === "function") {
    attrs["before-close"]();
  }

  // 判断 emits 里是否有 close 事件，有则触发，没有则直接更新 modelValue
  if (props.onClose) {
    emits("close", type)
  } else {
    emits("update:modelValue");
  }
};

const handleConfirm = () => {
  emits("confirm");
};

defineExpose({
  isVisible: props.modelValue,
});
</script>

<style lang="scss" scoped>
// 去除默认的顶部 padding，使得标题可以紧贴顶部，不会显得距离顶部比距离正文多
:deep(.el-dialog) {
  padding-top: 0;
  padding-bottom: 0;
}

// 标题区样式，左侧标题，右侧按钮，下方分割线
:deep(.el-dialog__header) {
  border-bottom: 1px solid #eee;
  padding: 12px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// 标题文字样式，居左显示，超出后显示省略号
.z-dialog-title {
  width: 100%;
  line-height: 24px;
  font-size: 18px;
  color: #303133;
  text-align: left;

  margin-right: 16px;
  // 标题超出后显示省略号
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

// 标题按钮区样式，右侧按钮区域，按钮之间有间距, 按钮 hover 时颜色变化
.z-dialog-title-btns {
  display: flex;
  align-items: center;
  i {
    margin-right: 8px;

    font-size: 16px;
    cursor: pointer;
  }
  i:hover, i:focus {
    color: var(--el-color-primary);
  }
  i:last-child {
    margin-right: 0;
  }
}

.z-dialog-content {
  height: 100%;
}

.z-dialog-wrapper {
  :deep(.el-dialog__footer) {
    @apply pb-4;
  }
}

</style>