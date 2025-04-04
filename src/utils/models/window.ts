// 当前页面宽高
export const { width: currentPageWidth, height: currentPageHeight } = useWindowSize()

// 是否为移动端
export const isMobile = computed(() => {
  return currentPageWidth.value < 768;
});

// 是否为非移动端
export const isNotMobile = computed(() => {
  return currentPageWidth.value >= 768;
});