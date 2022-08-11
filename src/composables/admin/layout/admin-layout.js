// 请求加载
import {githubInfoReq, loadConfigReq, downloadLogReq} from "~/api/admin-setting";
import {logoutReq} from '~/api/login'
import {useRequest} from "vue-request";

import dayjs from "dayjs";

export default function useAdminLayout(router, route) {
    // 站点设置加载, 主要用于右上角头像获取
    let {data: siteSetting} = useRequest(loadConfigReq);
    // 从 github 获取最新信息
    let {data: githubLatestInfo, loading: githubLatestLoading} = useRequest(githubInfoReq, {
        errorRetryCount: 3
    });

    // 注销
    const logout = () => {
        logoutReq().then(() => {
            router.push('/login')
        })
    }

    /**
     * 日志下载
     */
    const logDownload = () => {
        const loading = ElLoading.service({
            fullscreen: true,
            lock: true,
            text: '下载中...',
            background: 'rgba(0, 0, 0, 0.5)',
        });
        downloadLogReq().then((res) => {
            const { data, headers } = res;
            const fileName = `ZFile 诊断日志 - ${dayjs().format('YYYY-MM-DD HH:mm:ss')}.zip`;
            // 此处当返回json文件时需要先对data进行JSON.stringify处理，其他类型文件不用做处理
            //const blob = new Blob([JSON.stringify(data)], ...)
            const blob = new Blob([data], {type: headers['content-type']})
            let dom = document.createElement('a')
            let url = window.URL.createObjectURL(blob)
            dom.href = url
            dom.download = decodeURI(fileName)
            dom.style.display = 'none'
            document.body.appendChild(dom)
            dom.click()
            dom.parentNode.removeChild(dom)
            window.URL.revokeObjectURL(url);
        }).catch((res) => {
            ElMessage.error('下载日志失败.');
        }).finally(() => {
            loading.close();
        });
    }

    const rebuildTitle = () => {
        if (route.path.indexOf('/admin') === -1) {
            return;
        }
        // 获取当前选中的左侧导航的文字, 作为标题
        document.title = (route.meta.name || 'ZFile') + ' | 后台管理';
    }

    return {
        siteSetting,
        githubLatestInfo, githubLatestLoading,
        logDownload,
        logout,
        rebuildTitle
    }

}