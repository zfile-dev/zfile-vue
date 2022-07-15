import { defineStore } from 'pinia'

// 全局配置信息, 初始化自 /public/zfile.config.json 文件中.
const useGlobalConfigStore = defineStore('globalConfigStore', {
  state: () => {
    return {
      zfileConfig: {
        baseUrl: "",
        fileList: {
          defaultSize: "small",
          emptyText: "数据为空，请先上传或添加文件"
        },
        router: {
          mode: "history"
        },
        skeleton: {
          enable: true,
          show: "always",
          size: 30
        },
        gallery: {
          column: 5,
          columnSpacing: 50,
          rowSpacing: 10,
          showInfo: false,
          showInfoMode: "hover",
          roundedBorder: true,
          showBackTop: true,
        },
        imagePreview: {
          mode: "only",
          gallery: true
        },
        officePreview: {}
      }
    }
  },
  actions: {
    updateZfileConfig(val: any) {
      this.zfileConfig = val
    }
  },
})

export default useGlobalConfigStore;