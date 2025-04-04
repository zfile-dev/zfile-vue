import { StreamLanguage } from '@codemirror/language'
import { go } from '@codemirror/legacy-modes/mode/go'
export default function() {
  return StreamLanguage.define(go)
}
