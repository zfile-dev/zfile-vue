import Vue from 'vue';
import App from './App.vue';

// iconfont
import '@/assets/font-icon/iconfont.js'
import '@/assets/font-icon/iconfont.css'

import router from './router'
import './element-ui'

import layer, {jquery} from '@/assets/layer/layer'
import '@/assets/layer/theme/default/layer.css'

import store from "@/store";

Vue.prototype.layer = layer;
Vue.prototype.$ = jquery;

Vue.config.productionTip = true;

import axios from 'axios'

// axios.defaults.baseURL = '/';
axios.defaults.baseURL = 'http://127.0.0.1:8080';

// 允许跨域携带 cookie
axios.defaults.withCredentials = true;

// 对 URL 中对每个参数进行 encode 编码
axios.interceptors.request.use(
    config => {
        let url = config.url;
        // get参数编码
        if (config.method === 'get' && config.params) {
            url += '?';
            let keys = Object.keys(config.params);
            for (let key of keys) {
                url += `${key}=${encodeURIComponent(config.params[key])}&`
            }
            url = url.substring(0, url.length - 1);
            config.params = {}
        }
        config.url = url;
        return config
    },
);
Vue.prototype.$http = axios;

import 'highlight.js/styles/github.css'

import contentmenu from 'v-contextmenu'
Vue.use(contentmenu);
import 'v-contextmenu/dist/index.css'

import APlayer from '@moefe/vue-aplayer';

Vue.use(APlayer, {
    defaultCover: 'http://c.jun6.net/audio.png',
    productionTip: true,
});

new Vue({
    render: h => h(App),
    router,
    store,
    beforeCreate: function () {
        // 如果已经初始化, 则跳转后文件首页, 否则跳转后初始化页
        this.$http.get('is-installed').then((response) => {
            let data = response.data;
            if (data.code !== 0) {
                if (!this.$route.fullPath.includes("/main")
                    && !this.$route.fullPath.includes("/admin")
                    && !this.$route.fullPath.includes("/login")) {
                    this.$router.push('/main');
                }
            } else {
                this.$router.push('/install')
            }
        });

        //  REQUEST 请求异常拦截
        axios.interceptors.response.use(config=> {
            return config;
        }, error=> {
            let msg = error.response.data.msg;
            if (msg === '未登录') {
                this.$router.push('/login');
            } else {
                this.$message({
                    message: msg,
                    type: 'error'
                });
            }
            return Promise.resolve(error);
        });
    }
}).$mount('#app');