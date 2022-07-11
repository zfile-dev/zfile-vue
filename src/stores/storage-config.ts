import { defineStore } from 'pinia'

// 当前存储源的配置信息，数据来源为服务端配置。请求存储源后会获取其配置信息。
const useStorageConfigStore = defineStore('storageConfigStore', {
  state: () => {
    return {
      config: {
        siteName: '',
        directLinkPrefix: '',
        defaultSwitchToImgMode: false,
        infoEnable: false,
        showLinkBtn: false,
        recordDownloadLog: false,
        showShortLink: false,
        showPathLink: false,
        tableSize: 'small',
        rootShowStorage: true,
        fileClickMode: 'dbclick',
        showDocument: false,
        debugMode: false,
        domain: '',
        icp: '123',
        avatar: '',
        announcement: '',
        layout: 'full',
        showAnnouncement: false,
        searchEnable: false,
        showLogin: false
      }
    }
  },
  actions: {
    updateConfig(val: any) {
      this.config = val;
    },
  },
})

export default useStorageConfigStore;