// 你自定义的 css
import './styles/main.css'
import './styles/tailwind/index.scss'

import App from './App.vue'
import axios from "axios";
const app = createApp(App)

import useGlobalConfigStore from "~/stores/global-config";
const globalConfigStore = useGlobalConfigStore();

import config from '../package.json'
console.log("\n %c ZFile " + config.version + " %c https://github.com/zhaojun1998/zfile \n\n", "background: #35495e; padding: 1px; border-radius: 3px 0 0 3px; color: #fff", "background: #fadfa3; padding: 1px; border-radius: 0 3px 3px 0; color: #fff");

axios.get('/zfile.config.json').then((res) => {
  globalConfigStore.updateZfileConfig(res.data);
}).finally(() => {
  app.mount('#app')
})