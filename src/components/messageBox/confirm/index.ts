import { createApp } from "vue";
import Confirm from "./confirm.vue";
import { Props } from "./types";

const createDialog = (message: string, title: string, options: Props = {}) => new Promise((resolve, reject) => {
  const mountNode = document.createElement('div')
  const Instance = createApp(Confirm, {
    show: true,
    message,
    title,
    ...options,
    onClose: (type: string) => {
      if (type === 'confirm') {
        resolve(type);
      } else {
        reject(type);
      }
      Instance.unmount();
      document.body.removeChild(mountNode);
    }
  })

  document.body.appendChild(mountNode)
  Instance.mount(mountNode)
});

export default createDialog;
