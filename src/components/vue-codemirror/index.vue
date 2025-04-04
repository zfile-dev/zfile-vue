<template>
  <div class="example" ref="codemirrorRef">
    <toolbar
      :config="config"
      :themes="Object.keys(themes)"
      :languages="Object.keys(languages)"
      :encodings="encodings"
      :disabled="config.disabled"
      :readonly="config.readonly"
      @encoding="ensureEncoding"
      @language="ensureLanguageCode" />
    <div class="divider"></div>
    <editor
      v-if="modelValue"
      :fileName="fileName"
      :config="config"
      :theme="currentTheme"
      :language="currentLangCode"
      :code="encodeModelValue" />
  </div>
</template>

<script setup lang="ts">
import languageEncoding from "detect-file-encoding-and-language";
import languages from './languages'
import encodings from './encodings'
import themes from './themes'
import Toolbar from './toolbar.vue'
import Editor from './editor.vue'
import { ToolBarConfig } from "./types";
import { defineProps } from "vue";

const config:ToolBarConfig = reactive({
  disabled: false,
  readonly: false,
  indentWithTab: true,
  tabSize: 4,
  autofocus: true,
  height: '60vh',
  language: 'javascript',
  encoding: 'UTF-8',
  theme: 'default',
  lineWrapping: true,
})

const langCodeMap = reactive(new Map<string, () => any>())
const currentLangCode = computed(() => langCodeMap.get(config.language)!)
const currentTheme = computed(() => {
  return config.theme !== 'default' ? themes[config.theme] : void 0
})

const props = defineProps({
  fileName: {
    type: String,
    required: true
  },
  modelValue: {
    type: Blob,
    required: true
  },
  language: {
    type: String,
    default: 'javascript'
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

config.readonly = props.readonly

// 编码后的 modelValue
const encodeModelValue = ref<string>('')

const ensureLanguageCode = async (targetLanguage: string) => {
  config.language = targetLanguage
  const delayPromise = () => new Promise((resolve) => window.setTimeout(resolve, 260))
  if (langCodeMap.has(targetLanguage)) {
    await delayPromise()
  } else {
    if (!languages[targetLanguage]) {
      config.language = 'javascript'
      targetLanguage = 'javascript'
    }
    const [result] = await Promise.all([languages[targetLanguage](), delayPromise()])
    langCodeMap.set(targetLanguage, result.default)
  }
}

const ensureEncoding = (encoding: string) => {
  if (encoding) {
    config.encoding = encoding
    processEncoding(config.encoding)
  } else {
    languageEncoding(props.modelValue).then((fileInfo) => {
      if (fileInfo.encoding && fileInfo.confidence.encoding && fileInfo.confidence.encoding > 0.5) {
        ElMessage.success(`检测到文件编码为 ${fileInfo.encoding}, 可能性为 ${fileInfo.confidence.encoding * 100}%`)
      } else {
        ElMessage.warning({
          message: '自动检测文件编码未成功，将使用默认编码 UTF-8 打开.',
          duration: 5000
        })
        fileInfo.encoding = 'UTF-8'
      }

      config.encoding = fileInfo.encoding || 'UTF-8'
      processEncoding(config.encoding)
    })
  }
}

const processEncoding = (encoding: string) => {
  let fd = new FileReader;
  fd.onload = function () {
    encodeModelValue.value = fd.result as string
  }
  fd.readAsText(props.modelValue, encoding);
}

onBeforeMount(() => {
  ensureLanguageCode(props.language!)
  ensureEncoding('')
})


const useAutoHeight = () => {
  const codemirrorRef = ref<HTMLElement | null>(null);
  const editorHeight = ref<string>('');

  // Function to calculate editor height
  const calculateEditorHeight = () => {
    const bodyHeight = codemirrorRef.value?.parentElement?.offsetHeight || 0;
    const toolbarHeight = codemirrorRef.value?.querySelector('.toolbar')?.offsetHeight || 0;
    const dividerHeight = 9;
    const footerHeight = codemirrorRef.value?.querySelector('.footer')?.offsetHeight || 0;
    editorHeight.value = `calc(${bodyHeight}px - ${toolbarHeight + (dividerHeight * 2) + footerHeight + 50}px)`;
  };

  // ResizeObserver to watch for changes in parent element size
  let resizeObserver: ResizeObserver;

  onMounted(() => {
    calculateEditorHeight();
    resizeObserver = new ResizeObserver(() => {
      calculateEditorHeight();
    });
    if (codemirrorRef.value?.parentElement) {
      resizeObserver.observe(codemirrorRef.value.parentElement);
    }
  });

  onBeforeUnmount(() => {
    if (resizeObserver && codemirrorRef.value?.parentElement) {
      resizeObserver.unobserve(codemirrorRef.value.parentElement);
    }
  });

  return {
    codemirrorRef,
    editorHeight
  }
}

const { codemirrorRef, editorHeight } = useAutoHeight()
</script>

<style lang="scss" scoped>
@import '~/styles/code-editor-variables.scss';

.example {
  .divider {
    height: 1px;
    background-color: $border-color;
  }

  :deep(.cm-editor) {
    height: v-bind('editorHeight');
  }

  .loading-box {
    overflow: auto;
    width: 100%;
    min-height: 20rem;
    max-height: 60rem;
    /* loading height = view-height - layout-height - page-height */
    /* navbar + banner + footer */
    $layout-height: $navbar-height + $banner-height + $footbar-height;
    /* single-card-gap * 2 + card-header + editor-header */
    $page-height: 2rem * 2 + 3.2rem + 3rem;
    /* editor-border * 2 */
    height: calc(100vh - $layout-height - $page-height - 2px);
  }
}
</style>