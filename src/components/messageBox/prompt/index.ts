import { createApp } from "vue";
import Prompt from "./prompt.vue";
import { ConfirmResult, Props } from "./types";

const createDialog = (message: string, title: string, options: Props = {}) => new Promise((resolve, reject) => {
  const mountNode = document.createElement('div')
  const Instance = createApp(Prompt, {
    show: true,
    message,
    title,
    ...options,
    onClose: (res: ConfirmResult) => {
      if (res.type === 'confirm') {
        resolve(res);
      } else {
        reject(res);
      }
      Instance.unmount();
      document.body.removeChild(mountNode);
    }
  })

  document.body.appendChild(mountNode)
  Instance.mount(mountNode)
});

export default createDialog;
