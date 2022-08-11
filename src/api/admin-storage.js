import axios from "~/http/request"

// 加载系统支持的所有存储引擎
export const loadSupportStorageReq = () => {
    return axios({
        url: "/admin/support-storage",
        method: "get",
    })
}

// 获取所有存储源
export const loadStorageListReq = (data) => {
    return axios({
        url: "/admin/storages",
        method: "get",
        data
    })
}

// 获取指定存储源的所有参数
export const loadStorageItemReq = (storageKey) => {
    return axios({
        url: `/admin/storage/${storageKey}`,
        method: "get"
    })
}

// 删除存储源
export const deleteStorageReq = (id) => {
    return axios({
        url: `/admin/storage/${id}`,
        method: "delete",
    })
}

// 启用/关闭存储源的缓存功能
export const switchEnableReq = (id, action) => {
    return axios({
        url: `/admin/storage/${id}/${action}`,
        method: "post",
    })
}

// 跳转存储源的顺序
export const storageSortReq = (data) => {
    return axios({
        url: `/admin/storage/sort`,
        method: "post",
        data
    })
}


// 调整存储源的顺序
export const storageUpdateIdReq = (data) => {
    return axios({
        url: `/admin/storage/updateId`,
        method: "post",
        data
    })
}

// 启用/关闭存储源的缓存功能
export const switchCacheEnableReq = (id, action) => {
    return axios({
        url: `/admin/cache/${id}/${action}`,
        method: "post",
    })
}

// 启用/关闭存储源的缓存自动刷新功能
export const switchCacheAutoRefreshReq = (id, action) => {
    return axios({
        url: `/admin/cache/${id}/auto-refresh/${action}`,
        method: "post",
    })
}

// 获取指定存储类型的字段
export const storageParamsReq = (data) => {
    return axios({
        url: `/admin/storage-params`,
        method: "get",
        data
    })
}

// 保存存储源参数
export const saveStorageSettingReq = (data) => {
    return axios({
        url: `/admin/storage`,
        method: "post",
        data
    })
}


// 是否存在此存储源 key
export const existStorageKeyReq = (data) => {
    return axios({
        url: `/admin/storage/exist/key`,
        method: "get",
        data
    })
}

// 加载存储源过滤参数
export const loadStorageFilterReq = (storageKey) => {
    return axios({
        url: `/admin/storage/${storageKey}/filters`,
        method: "get",
    })
}


// 保存存储源过滤参数
export const saveStorageFilterReq = (storageKey, data) => {
    return axios({
        url: `/admin/storage/${storageKey}/filters`,
        method: "post",
        data
    })
}


// 加载存储源密码参数
export const loadStoragePasswordReq = (storageKey) => {
    return axios({
        url: `/admin/storage/${storageKey}/password`,
        method: "get",
    })
}


// 保存存储源密码参数
export const saveStoragePasswordReq = (storageKey, data) => {
    return axios({
        url: `/admin/storage/${storageKey}/password`,
        method: "post",
        data
    })
}

// 加载存储源密码参数
export const loadStorageReadmeReq = (storageKey) => {
    return axios({
        url: `/admin/storage/${storageKey}/readme`,
        method: "get",
    })
}


// 保存存储源密码参数
export const saveStorageReadmeReq = (storageKey, data) => {
    return axios({
        url: `/admin/storage/${storageKey}/readme`,
        method: "post",
        data
    })
}

// 启用/关闭存储源兼容 readme 模式
export const changeCompatibilityReadmeEnableReq = (id, action) => {
    return axios({
        url: `/admin/storage/${id}/compatibility_readme/${action}`,
        method: "post",
    })
}