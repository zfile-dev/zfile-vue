import { StreamLanguage } from '@codemirror/language'
import { lua } from '@codemirror/legacy-modes/mode/lua'

export default function() {
  return StreamLanguage.define(lua)
}
