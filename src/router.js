import Vue from 'vue';
import Router from "vue-router";
Vue.use(Router);

import Main from "./components/Main";
import Login from "./components/Login";
import SiteSetting from "./components/admin/SiteSetting";
import ViewSetting from "./components/admin/ViewSetting";
import StorageStrategy from "./components/admin/StorageStrategy";
import UpdatePassword from "./components/admin/UpdatePassword";
import CacheManager from "./components/admin/CacheManager";
import API from "./components/admin/API";
import Monitor from "./components/admin/Monitor";

export default new Router({
    mode: 'hash', // 路由模式:默认为 hash,如果改为 history,则需要后端进行配合
    base: '/', // 基路径:默认值为'/'.如果整个单页应用在/app/下,base 就应该设为'/app/'.一般可以写成__dirname,在 webpack 中配置.
    routes: [
        {
            path: '/install',
            component: r => {
                require.ensure([], () => r(require('./components/Install')), 'install')
            }
        },
        {
            path: '/main*',
            component: Main
        },
        {
            path: '/login',
            component: Login
        },
        {
            path: '/admin',
            component: r => {
                require.ensure([], () => r(require('./components/admin/Index')), 'adminIndex')
            },
            children: [
                {
                    path: '/',
                    name: '主页',
                    component: SiteSetting
                },
                {
                    path: 'site',
                    name: '基本设置',
                    component: SiteSetting
                },
                {
                    path: 'view',
                    name: '显示设置',
                    component: ViewSetting
                },
                {
                    path: 'storage',
                    name: '存储策略设置',
                    component: StorageStrategy
                },
                {
                    path: 'password',
                    name: '密码设置',
                    component: UpdatePassword
                },
                {
                    path: 'cache',
                    name: '缓存管理',
                    component: CacheManager
                },
                {
                    path: 'api',
                    name: 'API',
                    component: API
                },
                {
                    path: 'monitor',
                    name: 'Monitor',
                    component: Monitor
                }
            ]
        }
    ]
})