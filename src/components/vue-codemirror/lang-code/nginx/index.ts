import { StreamLanguage } from '@codemirror/language'
import { nginx } from '@codemirror/legacy-modes/mode/nginx'

export default function() {
  return StreamLanguage.define(nginx)
}
