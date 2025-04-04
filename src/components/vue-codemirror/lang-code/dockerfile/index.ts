import { StreamLanguage } from '@codemirror/language'
import { dockerFile } from '@codemirror/legacy-modes/mode/dockerfile'
export default function() {
  return StreamLanguage.define(dockerFile)
}
