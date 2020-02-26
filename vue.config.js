const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  productionSourceMap: false,
  chainWebpack: config => {
    config.plugin('monaco').use(MonacoWebpackPlugin, [
      {
        languages: ['java', 'php'],
        features: ['!accessibilityHelp', '!bracketMatching', '!caretOperations', '!clipboard', '!codeAction', '!codelens', '!colorDetector', '!comment', '!contextmenu', '!coreCommands', '!cursorUndo', '!dnd', '!find', '!folding', '!fontZoom', '!format', '!gotoError', '!gotoLine', '!gotoSymbol', '!hover', '!iPadShowKeyboard', '!inPlaceReplace', '!inspectTokens', '!linesOperations', '!links', '!multicursor', '!parameterHints', '!quickCommand', '!quickOutline', '!referenceSearch', '!rename', '!smartSelect', '!snippets', '!suggest', '!toggleHighContrast', '!toggleTabFocusMode', '!transpose', '!wordHighlighter', '!wordOperations', '!wordPartOperations']
      }
    ])
  },
};