import { StreamLanguage } from '@codemirror/language'
import { r } from '@codemirror/legacy-modes/mode/r'
export default function() {
  return StreamLanguage.define(r)
}
