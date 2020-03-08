import Vue from 'vue';
import App from './App.vue';

import '@/assets/font-icon/iconfont.js'

import router from './router'
import './element-ui'

import store from "@/store";

import layer, {jquery} from '@/assets/layer/layer'
import '@/assets/layer/theme/default/layer.css'
Vue.prototype.layer = layer;
Vue.prototype.$ = jquery;

Vue.config.productionTip = false;

import axios from 'axios'

import common from "./common";
Vue.prototype.common = common;

import VueClipboard from 'vue-clipboard2'
VueClipboard.config.autoSetContainer = true;
Vue.use(VueClipboard);


import InfiniteLoading from 'vue-infinite-loading';

Vue.use(InfiniteLoading, { /* 配置 */ });

import "@/assets/common.css";

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
                url += `${key}=${encodeURIComponent(decodeURI(config.params[key]))}&`
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
    defaultCover: 'https://c.jun6.net/audio.png',
    productionTip: false,
});


axios.get('zfile.config.json').then((result) => {
    axios.defaults.baseURL = result.data.baseUrl;
    new Vue({
        render: h => h(App),
        router,
        store,
        beforeCreate: function () {
            // 如果已经初始化, 则跳转后文件首页, 否则跳转后初始化页
            this.$http.get('is-installed').then((response) => {
                let data = response.data;
                if (data.code !== 0) {
                    let hash = window.location.hash;
                    if (!hash.includes("#/main")
                        && !hash.includes("#/admin")
                        && !hash.includes("#/login")) {
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
});


console.log("\n %c ZFile 2.2 %c https://github.com/zhaojun1998/zfile \n\n", "background: #35495e; padding: 1px; border-radius: 3px 0 0 3px; color: #fff", "background: #fadfa3; padding: 1px; border-radius: 0 3px 3px 0; color: #fff");