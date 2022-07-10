import {App} from 'vue'
import {VueMasonryPlugin} from 'vue-masonry';
export default (app: App) => {
  app.use(VueMasonryPlugin)
}