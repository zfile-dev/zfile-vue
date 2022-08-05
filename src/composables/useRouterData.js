const routerRef = ref(null);
const routeRef = ref(null);

export default function useRouterData(initRouter, initRoute) {

  if (initRouter && !routerRef.value) {
    routerRef.value = initRouter;
  }

  if (initRoute && !routeRef.value) {
    routeRef.value = initRoute;
  }

  // 当前所在驱动器 key
  const storageKey = computed(() => {
    return routeRef.value?.params.storageKey;
  });

  // 当前所在目录
  const currentPath = computed(() => {
    if (routeRef.value?.params.fullpath) {
      return '/' + routeRef.value.params.fullpath.join('/');
    } else {
      return '/';
    }
  });

  const fullpath = computed(() => {
    return routeRef.value?.params.fullpath;
  });

  return {
    routerRef,
    storageKey,
    currentPath,
    fullpath
  };

}