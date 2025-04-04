import { StreamLanguage } from '@codemirror/language'
import { swift } from '@codemirror/legacy-modes/mode/swift'

export default () => StreamLanguage.define(swift)
