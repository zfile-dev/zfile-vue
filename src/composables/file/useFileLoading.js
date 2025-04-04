const loading = ref(false);
const firstLoading = ref(false);

import useGlobalConfigStore from "~/stores/global-config";
let globalConfigStore = useGlobalConfigStore();

// 是否启用骨架屏 loading
let skeletonLoading = computed(() => {
  let skeletonEnable = globalConfigStore.zfileConfig.skeleton.enable;
  let skeletonShow = globalConfigStore.zfileConfig.skeleton.show;

  // 如果启用了骨架屏
  if (skeletonEnable) {
    // 如果骨架屏模式为是 '始终加载'
    if (skeletonShow === 'always') {
      return loading.value;
    } else {  // 如果骨架屏模式为是仅 '首次加载'
      // 已经首次加载后, 则不使用骨架屏
      return firstLoading.value ? false : loading.value;
    }
  } else {    // 如果未启用骨架屏, 则直接返回 false
    return false;
  }
});

// 是否显示普通 loading
let basicLoading = computed(() => {
  return skeletonLoading.value ? false : loading.value;
});

export default function useFileLoading() {

  return {
    loading,
    firstLoading,
    skeletonLoading,
    basicLoading
  };

}
