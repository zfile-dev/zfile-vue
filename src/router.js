import Vue from 'vue';
import Router from "vue-router";
Vue.use(Router);

const Install = () => import(/* webpackChunkName: "front" */'./components/Install');
const Main = () => import(/* webpackChunkName: "front" */'./components/Main');

const Admin = () => import(/* webpackChunkName: "admin" */'./components/admin/Index');
const Login = () => import(/* webpackChunkName: "admin" */'./components/Login');
const SiteSetting = () => import(/* webpackChunkName: "admin" */'./components/admin/SiteSetting');
const ViewSetting = () => import(/* webpackChunkName: "admin" */'./components/admin/ViewSetting');
const UpdatePassword = () => import(/* webpackChunkName: "admin" */'./components/admin/UpdatePassword');
const API = () => import(/* webpackChunkName: "admin" */'./components/admin/API');
const Monitor = () => import(/* webpackChunkName: "admin" */'./components/admin/Monitor');
const DriveList = () => import(/* webpackChunkName: "admin" */'./components/admin/DriveList');

export default new Router({
    mode: 'hash', // 路由模式:默认为 hash,如果改为 history,则需要后端进行配合
    base: '/', // 基路径:默认值为'/'.如果整个单页应用在/app/下,base 就应该设为'/app/'.一般可以写成__dirname,在 webpack 中配置.
    routes: [
        {
            path: '/install',
            component: Install
        },
        {
            path: '/:driveId?/main*',
            component: Main,
            props: true
        },
        {
            path: '/login',
            component: Login
        },
        {
            path: '/admin',
            component: Admin,
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
                    path: 'password',
                    name: '密码设置',
                    component: UpdatePassword
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
                },
                {
                    path: 'drive-list',
                    name: 'DriveList',
                    component: DriveList
                }
            ]
        }
    ]
})