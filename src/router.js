import Vue from 'vue';
import Install from "@/components/Install";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
    mode: 'hash', //路由模式:默认为 hash,如果改为 history,则需要后端进行配合
    base: '/file',//基路径:默认值为'/'.如果整个单页应用在/app/下,base 就应该设为'/app/'.一般可以写成__dirname,在 webpack 中配置.
    routes: [
        {path: '/install', component: Install}
    ]
})