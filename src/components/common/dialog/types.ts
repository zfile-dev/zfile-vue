export interface PropsType {
  title?: string;
  isDraggable?: boolean;
  modelValue?: boolean;
  hiddenFullBtn?: boolean;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  destroyOnClose?: boolean;
  draggable?: boolean;
  /*
  是否根据设备是否是移动端来自动设置全屏
   */
  autoFullScreen?: boolean;
  onClose?: Function | null;
  showFooter?: boolean;
}

export declare type DialogCloseType = 'cancel' | 'close';