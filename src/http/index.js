import axios from 'axios'
import {ElMessage} from 'element-plus';
import useGlobalConfigStore from "~/stores/global-config";
import MessageBox from "~/components/messageBox/messageBox";

let globalConfigStore = useGlobalConfigStore();
// 创建 axios 的一个实例
const instance = axios.create({
    baseURL: globalConfigStore.zfileConfig.baseUrl, //接口统一域名
    timeout: 0, //设置超时
    headers: {
        'Content-Type': 'application/json;charset=UTF-8;',
    },
})

// 请求拦截器
instance.interceptors.request.use((config) => {
    // 每次发送请求之前判断是否存在 token，如果存在，则统一在 http 请求的 header 都加上 token，不用每次请求都手动添加了
    let token = window.localStorage.getItem('zfile-token');
	// 如果 token 不存在，则从 cookie 中获取
	if (!token) {
		const cookieToken = document.cookie.split('; ').find(row => row.startsWith('zfile-token='));
		if (cookieToken) {
			token = cookieToken.split('=')[1];
		}
	}
    // 非外部链接，才增加 token 到请求头
    if (!config.url.startsWith("http") || config.containToken === true) {
        token && (config.headers['zfile-token'] = token)
        config.headers['axios-request'] = true
        config.headers['axios-from'] = globalConfigStore.serverAddress
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

    if (response.data.code !== constant.responseCode.SUCCESS) {

        if (response.config.showDefaultMsg !== false) {
            ElMessage({
                type: 'error',
                dangerouslyUseHTMLString: true,
                grouping: true,
                message: response.data.msg
            })
        }

        return Promise.reject(response);
    }
    return response.data;
}, (error) => {
    // 响应错误
    if(error.response && error.response.status){
        const responseDataCode = error.response.data.code;

        if (responseDataCode === constant.responseCode.BAD_REQUEST) {
            let errorObj = error.response.data.data;

            let message;
            if (errorObj) {
                let keys = Object.keys(errorObj);

                if (keys.length > 1) {
                    message = '非法参数！<br>';
                    keys.forEach((key) => {
                        message += `字段[${key}]: ${errorObj[key]}<br>`
                    })
                } else {
                    message = errorObj[keys[0]];
                }
            } else {
                message = error.response.data.msg;
            }

            ElMessage({
                type: 'error',
                dangerouslyUseHTMLString: true,
                grouping: true,
                message: message
            })
            return Promise.reject(error);
        }

        if (responseDataCode === constant.responseCode.UNAUTHORIZED) {
            window.location.href = '/login?redirect=' + window.location.pathname + window.location.search + window.location.hash;
            return;
        }

        if (responseDataCode === constant.responseCode.FORBIDDEN) {
            MessageBox.confirm('您没有权限访问此资源，是否前往登录？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                window.location.href = '/login?redirect=' + window.location.pathname + window.location.search + window.location.hash;
            }).catch(() => {
            });
        }

        if (error.response.config.showDefaultMsg !== false) {
            if (responseDataCode) {
                if (responseDataCode.startsWith(constant.responseCode.PRO_CHECK_PREFIX)) {
                    MessageBox.confirm(`授权校验异常, 错误信息: <font color="red">${error.response.data.msg}</font>，是否前往后台查看授权设置？`, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        dangerouslyUseHTMLString: true,
                        type: 'info'
                    }).then(() => {
                        window.location.href = '/admin';
                    }).catch(() => {
                    });
                } else {
                    ElMessage({
                        type: 'error',
                        grouping: true,
                        message: error.response.data.msg
                    })
                }
            }  else {
                let msg = '请求失败，请联系管理员';
                if (error.response.status === 403) {
                    msg = error.response.data;
                }
                ElMessage({
                    type: 'error',
                    grouping: true,
                    message: msg
                })
            }
        }
        return Promise.reject(error);
    }
    return Promise.reject(error);
});

export default instance;