export declare type MessageType = '' | 'success' | 'warning' | 'info' | 'error';

// 声明 Options 类型
export interface Props {
  type?: MessageType;
  title?: String;
  message?: String;
  confirmButtonText?: String;
  cancelButtonText?: String;
  dangerouslyUseHTMLString?: Boolean;
  showCancelButton?: Boolean;
  showCloseButton?: Boolean;
  closeOnClickModal?: Boolean;
  closeOnPressEscape?: Boolean;
}
