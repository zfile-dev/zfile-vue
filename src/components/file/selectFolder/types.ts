// 声明返回值类型
export interface ConfirmResult {
  value: String
  type: 'cancel' | 'close' | 'confirm'
}
