const importers = import.meta.glob<string>('./lang-code/*/index.ts')
const languages: { [key in string]: () => any } = {}
Object.keys(importers).forEach((fileName) => {
  const language = fileName.replace('./lang-code/', '').replace('/index.ts', '')
  languages[language] = importers[fileName]
})

export default languages
