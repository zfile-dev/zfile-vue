// 声明返回值类型
export interface ConfirmResult {
  checkbox: boolean
  value: string
  type: 'cancel' | 'close' | 'confirm'
}


// 声明 Options 类型
export interface Props {
  title?: String;
  message?: String;
  confirmButtonText?: String;
  cancelButtonText?: String;
  inputType?: "text" | "password";
  inputPlaceholder?: String;
  inputDefault?: String;
  showPassword?: Boolean;
  checkbox?: Boolean;
  checkboxLabel?: String;
  readonly defaultChecked?: Boolean;
  inputValidator?: Function;
  inputErrorMessage?: String;
  dangerouslyUseHTMLString?: Boolean;
}
