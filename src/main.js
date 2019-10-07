import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
// import '@/assets/font-icon/iconfont'
import '@/assets/font-icon/iconfont.css'
import router from './router'

import layer, {jquery} from '@/assets/layer/layer'
import '@/assets/layer/theme/default/layer.css'
Vue.prototype.layer=layer;
Vue.prototype.$=jquery;

Vue.use(ElementUI);
Vue.config.productionTip = false;

import axios from 'axios'
axios.defaults.baseURL = 'http://192.168.1.150:8080';
Vue.prototype.$http = axios;

import VueHighlightJS from 'vue-highlightjs'
import 'highlight.js/styles/github.css'
Vue.use(VueHighlightJS);

import VueContextMenu from 'vue-contextmenu'
Vue.use(VueContextMenu);

import APlayer from '@moefe/vue-aplayer';
Vue.use(APlayer, {
  defaultCover: 'https://github.com/u3u.png',
  productionTip: true,
});

new Vue({
  render: h => h(App),
  router: router,
}).$mount('#app');