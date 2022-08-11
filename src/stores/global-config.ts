import { defineStore } from 'pinia'

// 全局配置信息, 初始化自 /public/zfile.config.json 文件中.
const useGlobalConfigStore = defineStore('globalConfigStore', {
  state: () => {
    return {
      zfileConfig: {
        baseUrl: "",
        router: {
          mode: "history"
        },
        skeleton: {
          enable: true,
          show: "always",
          size: 20
        },
        gallery: {
          mobileColumn: 5,
          column: 3,
          columnSpacing: 50,
          rowSpacing: 10,
          showInfo: true,
          showInfoMode: "hover",
          roundedBorder: true,
          showBackTop: true,
        },
        imagePreview: {
          mode: "full",
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