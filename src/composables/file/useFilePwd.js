import minimatch from "minimatch";

import useRouterData from "~/composables/useRouterData";
let { storageKey, currentPath } = useRouterData()

const zfilePasswordCache = useStorage('zfile-pwd-cache', {});

export default function useFilePwd() {

  // 向缓存中写入当前路径密码
  let putPathPwd = (pattern, password) => {
    if (pattern) {
      if (!zfilePasswordCache.value[storageKey.value]) {
        zfilePasswordCache.value[storageKey.value]= {};
      }
      zfilePasswordCache.value[storageKey.value][pattern] = password;
    }
  };

  // 获取当前路径缓存中的密码
  let getPathPwd = () => {
    for (let storageTag of Object.keys(zfilePasswordCache.value)) {
      if (storageTag === storageKey.value) {
        for (let key of Object.keys(zfilePasswordCache.value[storageTag])) {
          if (minimatch(currentPath.value, key)) {
            return zfilePasswordCache.value[storageTag][key];
          }
        }
      }
    }
    return '';
  };

  return {
    putPathPwd,
    getPathPwd
  }

}