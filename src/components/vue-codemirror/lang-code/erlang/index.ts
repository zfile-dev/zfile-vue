import { StreamLanguage } from '@codemirror/language'
import { erlang } from '@codemirror/legacy-modes/mode/erlang'

export default function() {
  return StreamLanguage.define(erlang)
}
