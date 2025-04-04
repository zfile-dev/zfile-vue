<template>
  <div class="editor">
    <div class="main">
      <codemirror
        v-model="code"
        :style="{
          width: '100%',
          height: config.height,
          backgroundColor: '#fff',
          color: '#333'
        }"
        placeholder="Please enter the code."
        :extensions="extensions"
        :autofocus="config.autofocus"
        :disabled="config.readonly"
        :indent-with-tab="config.indentWithTab"
        :tab-size="config.tabSize"
        @update="handleStateUpdate"
        @ready="handleReady"
        @focus="log('focus', $event)"
        @blur="log('blur', $event)"
      />
    </div>
    <div class="divider"></div>
    <div class="footer">
      <div class="buttons" :class="{ 'invisible': config.readonly }">
        <el-tooltip content="也可以使用快捷键 Ctrl/⌘ + S 保存" placement="top">
          <button class="item" @click="saveFile">保存</button>
        </el-tooltip>
      </div>
      <div class="infos">
        <span class="item">空格: {{ config.tabSize }}</span>
        <span class="item">总长度: {{ state.length }}</span>
        <span class="item">行数: {{ state.lines }}</span>
        <span class="item">光标: {{ state.cursor }}</span>
        <span class="item">选中: {{ state.selected }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { EditorView, ViewUpdate } from '@codemirror/view'
import { Codemirror } from 'vue-codemirror'
import { PropType } from "vue/dist/vue";
import { ToolBarConfig } from "./types";
import { Compartment, EditorState } from "@codemirror/state";
const lineWrappingComp = new Compartment();
import { ElTooltip }  from "element-plus";
import iconv from 'iconv-lite';

const props = defineProps({
  fileName: {
    type: String,
    required: true
  },
  config: {
    type: Object as PropType<ToolBarConfig>,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  theme: [Object, Array],
  language: Function
})

const log = console.log
const code = ref(props.code)
const extensions = computed(() => {
  const result = []

  if (props.config.lineWrapping) {
    result.push(lineWrappingComp.of(EditorView.lineWrapping))
  }

  if (props.language) {
    result.push(props.language())
  }
  if (props.theme) {
    result.push(props.theme)
  }
  return result
})

const cmView = ref<EditorView>()
const cmState = ref<EditorState>()
const handleReady = ({ view, state }: { view: EditorView, state: EditorState }) => {
  cmView.value = view
  cmState.value = state
}

const state = reactive({
  lines: null as null | number,
  cursor: null as null | number,
  selected: null as null | number,
  length: null as null | number
})

//  当编辑器状态更新时，更新选中、光标、长度等信息
const handleStateUpdate = (viewUpdate: ViewUpdate) => {
  // selected
  const ranges = viewUpdate.state.selection.ranges
  state.selected = ranges.reduce((plus, range) => plus + range.to - range.from, 0)
  state.cursor = ranges[0].anchor
  // length
  state.length = viewUpdate.state.doc.length
  state.lines = viewUpdate.state.doc.lines
}

onMounted(() => {
  watch(
    () => props.code,
    (_code) => {
      code.value = _code
    }
  )
})

// vue use 监听保存快捷键
import { useEventListener } from '@vueuse/core'
useEventListener(window, 'keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    saveFile()
  }
})

// 保存文件方法
import useFileUpload from "~/composables/file/useFileUpload";
const { silentUploadFile } = useFileUpload();
const saveFile = () => {
  if (props.config?.disabled) {
    ElMessage.warning('只读状态下不允许保存文件');
    return;
  }

  const file = new File([iconv.encode(code.value, props.config.encoding)], props.fileName, { type: 'text/plain' });
  silentUploadFile(file)
}
</script>

<style lang="scss" scoped>
  @import '~/styles/code-editor-variables.scss';

  .editor {

    :deep(.cm-editor) {
      @apply h-[50vh] sm:h-[60vh] lg:h-[65vh];
    }

    .divider {
      height: 1px;
      background-color: $border-color;
    }

    .main {
      display: flex;
      width: 100%;

      .code {
        width: 30%;
        height: 100px;
        margin: 0;
        padding: 0.4em;
        overflow: scroll;
        border-left: 1px solid $border-color;
        font-family: monospace;
      }
    }

    .footer {
      height: 3rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 90%;
      width: 100%;
      @apply max-sm:flex-col;

      .buttons {
        @apply max-sm:w-full space-x-3;
        .item {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          background-color: transparent;
          border: 1px dashed $border-color;
          font-size: $font-size-small;
          color: $text-secondary;
          cursor: pointer;
          .iconfont {
            margin-left: $xs-gap;
          }
          &:hover {
            color: $text-color;
            border-color: $text-color;
          }
        }
      }

      .infos {
        @apply max-sm:w-full space-x-3;
        .item {
          display: inline-block;
          font-feature-settings: 'tnum';
        }
      }
    }
  }
</style>