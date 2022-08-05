import axios from 'axios'
import {ElMessage} from 'element-plus';
import useGlobalConfigStore from "~/stores/global-config";

// 创建 axios 的一个实例
const instance = axios.create({
    baseURL: useGlobalConfigStore().zfileConfig.baseUrl, //接口统一域名
    timeout: 0, //设置超时
    headers: {
        'Content-Type': 'application/json;charset=UTF-8;',
    },
})

// 请求拦截器
instance.interceptors.request.use((config) => {
    // 每次发送请求之前判断是否存在 token，如果存在，则统一在 http 请求的 header 都加上 token，不用每次请求都手动添加了
    const token = window.localStorage.getItem('zfile-token');
    // 非外部链接，才增加 token 到请求头
    if (!config.url.startsWith("http")) {
        token && (config.headers['zfile-token'] = token)
        config.headers['axios-request'] = true
    }
    // console.log('开始请求的 url 为：', config.url, '\n时间为：', new Date().getTime())
    // requestTimeCache[config.url] = new Date().getTime();
    console.time(config.url);

    return config;
}, (error) =>
    // 对请求错误做些什么
    Promise.reject(error)
);

// 响应拦截器
instance.interceptors.response.use((response) => {
    // console.log('结束请求的 url 为：', response.config.url, '\n时间为：', new Date().getTime(), '\n耗时为：', new Date().getTime() - requestTimeCache[response.config.url])
    console.timeEnd(response.config.url);
    // 如果不需要话执行响应拦截器, 直接返回
    if (response.config.responseIntercept === false) {
        return response;
    }

    if (response.data.code !== 0) {

        if (response.data.code === 401) {
            router.push('/login');
        }

        if (response.config.showDefaultMsg !== false) {

            if (response.data.code === 400) {
                let errorObj = response.data.data;

                let keys = Object.keys(errorObj);

                let message;
                if (keys.length > 1) {
                    message = '非法参数！<br>';
                    keys.forEach((key) => {
                        message += `字段[${key}]: ${errorObj[key]}<br>`
                    })
                } else {
                    message = errorObj[keys[0]];
                }

                ElMessage({
                    type: 'error',
                    dangerouslyUseHTMLString: true,
                    grouping: true,
                    message: message
                })
            } else {
                ElMessage({
                    type: 'error',
                    dangerouslyUseHTMLString: true,
                    grouping: true,
                    message: response.data.msg
                })
            }
        }

        return Promise.reject(response);
    }
    return response.data;
}, (error) => {
    // 响应错误
    if(error.response && error.response.status){
        const responseDataCode = error.response.data.code;

        if (responseDataCode === 401) {
            window.location.href = '/login';
        }

        if (error.response.config.showDefaultMsg !== false) {
            if (responseDataCode) {
                ElMessage({
                    type: 'error',
                    grouping: true,
                    message: error.response.data.msg
                })

            } else {
                ElMessage({
                    type: 'error',
                    grouping: true,
                    message: '请求失败，请联系管理员'
                })
            }
        }
        return Promise.reject(error);
    }
    return Promise.reject(error);
});

export default instance;