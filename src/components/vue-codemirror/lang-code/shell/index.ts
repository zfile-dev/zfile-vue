import { StreamLanguage } from '@codemirror/language'
import { shell } from '@codemirror/legacy-modes/mode/shell'
export default function() {
  return StreamLanguage.define(shell)
}
