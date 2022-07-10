import {App} from 'vue'
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'

export default (app: App) => {
  app.use(VueViewer)
}