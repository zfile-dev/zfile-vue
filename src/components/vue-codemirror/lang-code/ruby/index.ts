import { StreamLanguage } from '@codemirror/language'
import { ruby } from '@codemirror/legacy-modes/mode/ruby'
export default function() {
  return StreamLanguage.define(ruby)
}
