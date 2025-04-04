import { StreamLanguage } from '@codemirror/language'
import { perl } from '@codemirror/legacy-modes/mode/perl'
export default function() {
  return StreamLanguage.define(perl)
}
