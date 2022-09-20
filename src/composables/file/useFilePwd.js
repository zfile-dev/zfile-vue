import minimatch from "minimatch";
import useRouterData from "~/composables/useRouterData";
import { removeDuplicateSlashes } from "fast-glob/out/managers/patterns";
import common from "~/common";
let { storageKey, currentPath } = useRouterData()

const zfilePasswordCache = useStorage('zfile-pwd-cache', {});

export default function useFilePwd() {

  // 向缓存中写入当前路径密码
  let putPathPwd = (pattern, password) => {
    if (pattern) {
      // 如果表达式开头没写 / ，则自动补全
      pattern = pattern.startsWith('/') ? pattern : '/' + pattern;

      if (!zfilePasswordCache.value[storageKey.value]) {
        zfilePasswordCache.value[storageKey.value]= {};
      }

      // 修正 glob 表达式兼容性和服务端不同的 bug
      if (pattern.endsWith("**") && !pattern.endsWith("/**")) {
        pattern = removeDuplicateSlashes(pattern.substring(0, pattern.length - 2) + "/**");
        console.log('检测到密码文件夹通配符 ** 前未写 /，自动将其修正为为：', pattern);
      }
      zfilePasswordCache.value[storageKey.value][pattern] = password;
    }
  };

  // 获取当前路径缓存中的密码
  let getPathPwd = (path) => {
    let currentPathValue = path || currentPath.value;
    currentPathValue = common.removeDuplicateSeparator('/' + currentPathValue + "/");
    for (let storageTag of Object.keys(zfilePasswordCache.value)) {
      if (storageTag === storageKey.value) {
        for (let key of Object.keys(zfilePasswordCache.value[storageTag])) {
          if (minimatch(currentPathValue, key)) {
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