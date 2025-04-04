import { defineStore } from "pinia";

import useFileSelect from "~/composables/file/useFileSelect";

let { selectStatistics } = useFileSelect();


// 当前存储源的配置信息，数据来源为服务端配置。请求存储源后会获取其配置信息。
const useStorageConfigStore = defineStore('storageConfigStore', {
  state: () => {
    return {
      globalConfig: {
        siteName: '',
        directLinkPrefix: '',
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
        icp: '',
        announcement: '',
        layout: 'full',
        mobileLayout: 'full',
        showAnnouncement: false,
        searchEnable: false,
        showLogin: false,
        siteHomeName: '首页',
        siteHomeLogo: '',
        siteHomeLogoLink: '',
        siteHomeLogoTargetMode: '',
        maxShowSize: 1000,
        loadMoreSize: 50,
        defaultSortField: 'name',
        defaultSortOrder: 'asc',
        linkExpireTimes: ''
      },
      loginInfo: {
        isLogin: null,
        isAdmin: null,
        username: '',
        nickname: ''
      },
      folderConfig: {
        readmeText: null,
        proxyUpload: false,
        readmeDisplayMode: null,
        defaultSwitchToImgMode: false,
        permission: {
        },
        metadata: {
          uploadType: null,
          supportRenameFolder: null,
          supportMoveFolder: null,
          supportCopyFolder: null,
          supportDeleteNotEmptyFolder: null,
        },
        rootPath: null,
      }
    }
  },
  getters: {
    permission: (state) => {
      let originPermission = state.folderConfig.permission;
      // 当全局允许使用直链，且当前用户有直链权限时，才显示直链按钮
      let pathLink = state.globalConfig.showPathLink && originPermission.generateLink;
      let shortLink = state.globalConfig.showShortLink && originPermission.generateShortLink;
      let download = originPermission.download && selectStatistics.value.isAllFile;
      return {
        open: selectStatistics.value.isSingleSelectFolder,
        preview: originPermission.preview && selectStatistics.value.isSingleSelectFile,
        download: download,
        copyDownloadLink: download && originPermission.copyDownloadLink,
        rename: originPermission.rename && selectStatistics.value.isSingleSelect,

        link: (pathLink || shortLink) && selectStatistics.value.isAllFile,
        pathLink: pathLink,
        shortLink: shortLink,
        bothLink: (pathLink && shortLink) && selectStatistics.value.isAllFile,

        copy: originPermission.copy,
        move: originPermission.move,
        delete: originPermission.delete,
        upload: originPermission.upload,
        uploadFolder: originPermission.upload && originPermission.newFolder,
        search: originPermission.search,
        newFolder: originPermission.newFolder,
        batchDownload: download && originPermission.batchDownload,
        packageDownload: download && originPermission.packageDownload,

      }
    }
  },
  actions: {
    updateGlobalConfig(val: any) {
      this.globalConfig = val;
    },
    updateFolderConfig(val: any) {
      this.folderConfig = val;
    },
    updateLoginInfo(val: any) {
      this.loginInfo = val;
    },
  },
})

export default useStorageConfigStore;