import Vue from 'vue';
import Router from "vue-router";
Vue.use(Router);

import Install from "@/components/Install";
import Main from "@/components/Main";
import StorageStrategy from "@/components/admin/StorageStrategy";
import Index from "@/components/admin/Index";
import SiteSetting from "@/components/admin/SiteSetting";
import Login from "@/components/Login";
import UpdatePassword from '@/components/admin/UpdatePassword';

export default new Router({
    mode: 'hash', // 路由模式:默认为 hash,如果改为 history,则需要后端进行配合
    base: '/', // 基路径:默认值为'/'.如果整个单页应用在/app/下,base 就应该设为'/app/'.一般可以写成__dirname,在 webpack 中配置.
    routes: [
        {
            path: '/install',
            component: Install
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
            component: Index,
            children: [
                {
                    path: '/',
                    name: '站点设置',
                    component: SiteSetting,
                },
                {
                    path: 'site',
                    name: '站点设置',
                    component: SiteSetting,
                },
                {
                    path: 'storage',
                    name: '存储策略设置',
                    component: StorageStrategy,
                },
                {
                    path: 'password',
                    name: '密码设置',
                    component: UpdatePassword,
                }
            ]
        }
    ]
})