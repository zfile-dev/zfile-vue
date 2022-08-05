import { defineStore } from 'pinia'

// @ts-ignore
import common from "~/common";

// 当前存储源的配置信息，数据来源为服务端配置。请求存储源后会获取其配置信息。
const useFileDataStore = defineStore('fileDataStore', {
  state: () => {
    return {
      currentClickRow: {},
      currentRightClickRow: {},
      currentStorageSource: {
        id: null,
        type: {
          description: '',
          key: ''
        }
      },
      imgMode: false,
      newImgMode: false,
      oldStorageKey: null,
      searchParam: '',
      fileListSource: [],
      audioArray: [],
      audioIndex: 0,
    }
  },
  getters: {
    filterFileByType: (state) => {
      return (type: string) => {
        return state.fileListSource.filter(function (item:any) {
          if (item.type === 'BACK') {
            return false
          }
          let name = item.name;
          let suffix = name.substr(name.lastIndexOf('.') + 1).toLowerCase();
          return common.constant.fileTypeMap[type].indexOf(suffix) !== -1;
        });
      };
    },
    fileList: state => {
      let tableData = state.fileListSource;
      tableData.forEach((item:any) => {
        // 生成图标
        if (!item.icon) {
          item['icon'] = common.getFileIconName(item);
        }
        if (item.preview !== null) {
          // 获取文件类型
          var fileType = common.getFileType(item.name);
          if (fileType) {
            // 获取文件是否可预览
            item['fileType'] = fileType;
            item.preview = common.constant.previewFileType.indexOf(fileType) !== -1;
          } else {
            item.preview = false;
          }
        }
      });
      return tableData;
    },
  },
  actions: {
    updateCurrentStorageSource(val: any) {
      this.currentStorageSource = val;
    },
    updateAudioIndex(val: any) {
      this.audioIndex = val;
    },
    updateAudioList(val: any) {
      this.audioArray = val;
    },
    updateCurrentClickRow(val: any) {
      this.currentClickRow = val;
    },
    updateCurrentRightClickRow(val: any) {
      this.currentRightClickRow = val;
    },
    updateFileList(val: any) {
      this.fileListSource = val;
    },
    updateOldStorageKey(val: any) {
      this.oldStorageKey = val;
    },
  },
})

export default useFileDataStore;