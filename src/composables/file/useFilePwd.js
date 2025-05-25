import { minimatch } from 'minimatch'
import useRouterData from "~/composables/useRouterData";
import {concatPath, removeDuplicateSeparator} from "~/utils";

let { storageKey, currentPath } = useRouterData()

const zfilePasswordCache = useStorage('zfile-pwd-cache', {});
const fullZFilePasswordCache = useStorage('zfile-pwd-full-cache', {}, sessionStorage);

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

export default function useFilePwd() {

  // 向缓存中写入当前路径密码
  let putPathPwd = (pattern, password, rememberPassword) => {
    if (pattern) {
      // 如果表达式开头没写 / ，则自动补全
      pattern = pattern.startsWith('/') ? pattern : '/' + pattern;

      // 初始化存储源 key
      if (!zfilePasswordCache.value[storageKey.value]) {
        zfilePasswordCache.value[storageKey.value]= {};
      }
      if (!fullZFilePasswordCache.value[storageKey.value]) {
        fullZFilePasswordCache.value[storageKey.value]= {};
      }

      // 修正 glob 表达式兼容性和服务端不同的 bug
      if (pattern.endsWith("**") && !pattern.endsWith("/**")) {
        pattern = removeDuplicateSeparator(pattern.substring(0, pattern.length - 2) + "/**");
        console.log('检测到密码文件夹通配符 ** 前未写 /，自动将其修正为为：', pattern);
      }

      // 根据是否记住密码，写入不同的缓存
      if (rememberPassword) {
        zfilePasswordCache.value[storageKey.value][pattern] = password;
      }
      fullZFilePasswordCache.value[storageKey.value][pattern] = password;
    }
  };

  // 获取当前路径缓存中的密码
  let getPathPwd = (path, ignoreTempPassword) => {
    // 如果没传递 path，则使用当前路径
    let currentPathValue = path || currentPath.value;
	// 用户存储源基目录
	let rootPath = storageConfigStore.user.rootPath;
    // 自动修正为标准路径
    currentPathValue = concatPath('/', rootPath, currentPathValue, '/');

    // 如果全量密码缓存为空，则自动初始化为当前密码缓存
    if (Object.keys(fullZFilePasswordCache.value).length === 0 && Object.keys(zfilePasswordCache.value).length !== 0) {
      fullZFilePasswordCache.value = JSON.parse(JSON.stringify(zfilePasswordCache.value));
      console.log('检测到全量密码缓存为空，自动将其初始化为：', fullZFilePasswordCache.value);
    }
    // 根据是否需要获取全量密码(含未记住的密码)，选择不同的缓存
    let cache = ignoreTempPassword ? zfilePasswordCache.value : fullZFilePasswordCache.value;

    for (let storageTag of Object.keys(cache)) {
      if (storageTag === storageKey.value) {
        for (let key of Object.keys(cache[storageTag])) {
          // 如果 key 以 * 结尾，则给 currentPathValue 加上任意字符，以匹配通配符
          if (key.endsWith('*')) {
            currentPathValue = currentPathValue + '*';
          }
          if (minimatch(currentPathValue, key)) {
            return cache[storageTag][key];
          }
        }
      }
    }
    return '';
  };

	const clearPwdCache = () => {
		zfilePasswordCache.value = {};
		fullZFilePasswordCache.value = {};
		ElMessage.success('操作成功')
	}

  return {
    putPathPwd,
    getPathPwd,
	clearPwdCache
  }

}